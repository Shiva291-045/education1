const crypto = require('crypto');

/**
 * Enterprise-grade security utility using Node.js built-in crypto (scrypt / HMAC)
 * and compatible with standard token architectures.
 */

// JWT Secret (Can be overridden by process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'TELANGANA-DEO-JANGAON-SECURE-KEY-2025';

/**
 * Securely hash password using scrypt with cryptographically random 16-byte salt
 * Output format: scrypt$salt$hash (Never plaintext)
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verify password against stored password hash
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  try {
    const parts = storedHash.split('$');
    if (parts.length === 3 && parts[0] === 'scrypt') {
      const salt = parts[1];
      const originalKey = parts[2];
      const testKey = crypto.scryptSync(password, salt, 64).toString('hex');
      return crypto.timingSafeEqual(Buffer.from(originalKey, 'hex'), Buffer.from(testKey, 'hex'));
    }
    // Fallback if legacy hash
    return false;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Generate authenticated signed token
 */
function generateToken(payload, expiresInHours = 24) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode authenticated token
 */
function verifyToken(token) {
  if (!token) return null;
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};
