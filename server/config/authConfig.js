function parseList(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function hostnameFromHostHeader(req) {
  const forwarded = req && req.headers && req.headers['x-forwarded-host'];
  const host = (forwarded || (req && req.headers && req.headers.host) || 'localhost:5000')
    .split(',')[0]
    .trim();
  return host;
}

function normalizeRpId(value) {
  if (!value) return '';
  return String(value)
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .toLowerCase();
}

function getWebAuthnRpId(req) {
  const fromEnv = normalizeRpId(process.env.WEBAUTHN_RP_ID);
  if (fromEnv) return fromEnv;
  return normalizeRpId(hostnameFromHostHeader(req)) || 'localhost';
}

function getExpectedOrigin(req) {
  const fromEnv = (process.env.WEBAUTHN_ORIGIN || process.env.FRONTEND_ORIGIN || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const protoHeader = req && req.headers && req.headers['x-forwarded-proto'];
  const proto = (protoHeader ? protoHeader.split(',')[0].trim() : null)
    || (isProduction() ? 'https' : 'http');
  return `${proto}://${hostnameFromHostHeader(req)}`;
}

function getExpectedOrigins(req) {
  const origins = [
    ...parseList(process.env.WEBAUTHN_ORIGIN),
    ...parseList(process.env.FRONTEND_ORIGIN),
    ...parseList(process.env.CORS_ORIGINS),
    getExpectedOrigin(req)
  ];

  if (!isProduction()) {
    origins.push(
      'http://localhost:5000',
      'https://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:3000'
    );
  }

  return [...new Set(origins.filter(Boolean))];
}

function isSameSiteDeployment(req) {
  const frontend = process.env.FRONTEND_ORIGIN || process.env.WEBAUTHN_ORIGIN;
  if (!frontend) return true;
  try {
    const frontendHost = new URL(frontend).hostname.toLowerCase();
    if (process.env.BACKEND_ORIGIN) {
      return frontendHost === new URL(process.env.BACKEND_ORIGIN).hostname.toLowerCase();
    }
    if (req) {
      return frontendHost === normalizeRpId(hostnameFromHostHeader(req));
    }
    return false;
  } catch {
    return true;
  }
}

function isOriginAllowed(origin, req) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (getExpectedOrigins(req).includes(normalized)) return true;

  if (!isProduction()) {
    try {
      const originHost = new URL(origin).hostname.toLowerCase();
      const requestHost = normalizeRpId(hostnameFromHostHeader(req));
      return originHost === requestHost;
    } catch {
      return false;
    }
  }
  return false;
}

function applyCorsHeaders(req, res) {
  const origin = req.headers && req.headers.origin;
  if (origin && isOriginAllowed(origin, req)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    return true;
  }
  if (!origin) {
    return true;
  }
  return false;
}

function usesSecureCookies() {
  const sameSite = (process.env.COOKIE_SAMESITE || '').toLowerCase();
  if (sameSite === 'none') return true;
  if (process.env.COOKIE_SECURE === 'true' || process.env.COOKIE_SECURE === '1') return true;
  const origin = process.env.WEBAUTHN_ORIGIN || process.env.FRONTEND_ORIGIN || '';
  return origin.startsWith('https://') || (isProduction() && Boolean(origin));
}

function cookieSameSite(req) {
  if (process.env.COOKIE_SAMESITE) return process.env.COOKIE_SAMESITE;
  if (!isSameSiteDeployment(req)) return 'None';
  return 'Lax';
}

function buildCookie(name, value, { maxAgeSeconds = 86400, clear = false, req } = {}) {
  const sameSite = cookieSameSite(req);
  const parts = [
    `${name}=${clear ? '' : value}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${sameSite}`,
    `Max-Age=${clear ? 0 : maxAgeSeconds}`
  ];
  if (usesSecureCookies() || sameSite.toLowerCase() === 'none') {
    parts.push('Secure');
  }
  if (process.env.COOKIE_DOMAIN) {
    parts.push(`Domain=${process.env.COOKIE_DOMAIN}`);
  }
  return parts.join('; ');
}

function getCookie(req, name) {
  const header = req && req.headers && req.headers.cookie;
  if (!header) return null;
  const cookies = header.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

function appendSetCookie(res, cookieValue) {
  const existing = typeof res.getHeader === 'function' ? res.getHeader('Set-Cookie') : null;
  const list = existing ? (Array.isArray(existing) ? existing.slice() : [existing]) : [];
  list.push(cookieValue);
  if (typeof res.setHeader === 'function') {
    res.setHeader('Set-Cookie', list);
  }
}

function publicConfigScript() {
  const apiBase = (process.env.PUBLIC_API_BASE || process.env.BACKEND_PUBLIC_URL || '').trim().replace(/\/$/, '');
  return `window.PORTAL_API_BASE = ${JSON.stringify(apiBase)};\n`;
}

module.exports = {
  parseList,
  isProduction,
  getWebAuthnRpId,
  getExpectedOrigin,
  getExpectedOrigins,
  isOriginAllowed,
  applyCorsHeaders,
  buildCookie,
  getCookie,
  appendSetCookie,
  usesSecureCookies,
  publicConfigScript
};
