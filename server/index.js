const path = require('path');
const fs = require('fs');
const http = require('http');

require('./loadEnv').loadEnv();

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const db = require('./db');
const mongo = require('./mongo');
const authController = require('./controllers/authController');
const authConfig = require('./config/authConfig');

async function bootServer(startListening) {
  try {
    await mongo.connectMongo();
  } catch (err) {
    if (process.env.NODE_ENV === 'production' && mongo.isMongoConfigured()) {
      console.error('[MongoDB] Required in production but unavailable. Exiting.');
      process.exit(1);
    }
    console.warn('[MongoDB] Unavailable. Using on-disk WebAuthn challenge persistence.');
  }
  startListening();
}

let app;
let isExpress = false;

try {
  const express = require('express');
  app = express();
  isExpress = true;

  app.use((req, res, next) => {
    const allowed = authConfig.applyCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
      if (!allowed && req.headers.origin) {
        return res.status(403).json({ success: false, message: 'Cross-origin request not allowed.' });
      }
      return res.status(204).end();
    }
    if (!allowed && req.headers.origin) {
      return res.status(403).json({ success: false, message: 'Cross-origin request not allowed.' });
    }
    next();
  });
  app.use(express.json());

  app.get('/config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(authConfig.publicConfigScript());
  });

  // Static files
  app.use(express.static(PUBLIC_DIR));

  // Routes
  const authRoutes = require('./routes/authRoutes');
  // Passkey direct routes (root and /api)
  app.post(['/passkey/register/start', '/api/passkey/register/start'], (req, res) => authController.passkeyRegisterStart(req, res));
  app.post(['/passkey/register/finish', '/api/passkey/register/finish'], (req, res) => authController.passkeyRegisterFinish(req, res));
  app.post(['/passkey/login/start', '/api/passkey/login/start'], (req, res) => authController.passkeyLoginStart(req, res));
  app.post(['/passkey/login/finish', '/api/passkey/login/finish'], (req, res) => authController.passkeyLoginFinish(req, res));

  app.use('/api/auth', authRoutes);
  app.use('/api', portalRoutes);

  // Fallback to index.html for SPA routing
  app.get('*', (req, res) => {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send('DEO Jangaon Education Portal Server Running');
    }
  });

  const startExpress = () => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`TELANGANA EDUCATION PORTAL - JANGAON DISTRICT`);
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api/auth`);
      console.log(`====================================================`);
    });
  };

  bootServer(startExpress);

} catch (e) {
  console.log('Express not detected or loading native HTTP server fallback...');

  // Pure Node.js HTTP Server fallback (Zero npm install dependency required)
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jsx': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const server = http.createServer(async (req, res) => {
    const allowed = authConfig.applyCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
      res.writeHead(allowed || !req.headers.origin ? 204 : 403);
      res.end();
      return;
    }
    if (!allowed && req.headers.origin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Cross-origin request not allowed.' }));
      return;
    }

    const urlObj = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = urlObj.pathname;

    if (pathname === '/config.js' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(authConfig.publicConfigScript());
      return;
    }

    // Helper to read JSON body
    const parseBody = () => new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });

    const headers = {};
    const mockRes = {
      statusCode: 200,
      setHeader(name, value) {
        headers[name.toLowerCase()] = value;
        res.setHeader(name, value);
        return this;
      },
      getHeader(name) {
        return headers[name.toLowerCase()];
      },
      header(name, value) {
        return this.setHeader(name, value);
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        res.writeHead(this.statusCode || 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      },
      send(data) {
        res.writeHead(this.statusCode || 200, { 'Content-Type': 'text/plain' });
        res.end(data);
      }
    };

    // API & Passkey Routing
    if (pathname.startsWith('/api/') || pathname.startsWith('/passkey/')) {
      req.body = await parseBody();

      // WebAuthn Passkey Registration Start
      if (
        (pathname === '/passkey/register/start' ||
         pathname === '/api/passkey/register/start' ||
         pathname === '/api/auth/passkey/register/start' ||
         pathname === '/api/auth/webauthn/register-options')
        && req.method === 'POST'
      ) {
        await authController.passkeyRegisterStart(req, mockRes);
        return;
      }
      // WebAuthn Passkey Registration Finish
      if (
        (pathname === '/passkey/register/finish' ||
         pathname === '/api/passkey/register/finish' ||
         pathname === '/api/auth/passkey/register/finish' ||
         pathname === '/api/auth/webauthn/register-verify')
        && req.method === 'POST'
      ) {
        await authController.passkeyRegisterFinish(req, mockRes);
        return;
      }
      // WebAuthn Passkey Login Start
      if (
        (pathname === '/passkey/login/start' ||
         pathname === '/api/passkey/login/start' ||
         pathname === '/api/auth/passkey/login/start' ||
         pathname === '/api/auth/webauthn/login-options')
        && req.method === 'POST'
      ) {
        await authController.passkeyLoginStart(req, mockRes);
        return;
      }
      // WebAuthn Passkey Login Finish
      if (
        (pathname === '/passkey/login/finish' ||
         pathname === '/api/passkey/login/finish' ||
         pathname === '/api/auth/passkey/login/finish' ||
         pathname === '/api/auth/webauthn/login-verify')
        && req.method === 'POST'
      ) {
        await authController.passkeyLoginFinish(req, mockRes);
        return;
      }

      // Teacher Login
      if (pathname === '/api/auth/teacher/login' && req.method === 'POST') {
        await authController.teacherLogin(req, mockRes);
        return;
      }

      // Registration & Standard Login
      if (pathname === '/api/auth/register' && req.method === 'POST') {
        await authController.register(req, mockRes);
        return;
      }
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        await authController.login(req, mockRes);
        return;
      }

      // Session & Info
      if (pathname === '/api/auth/me' && req.method === 'GET') {
        await authController.me(req, mockRes);
        return;
      }
      if (pathname === '/api/auth/logout' && req.method === 'POST') {
        await authController.logout(req, mockRes);
        return;
      }
      if (pathname === '/api/official/link-status' && req.method === 'GET') {
        await authController.linkStatus(req, mockRes);
        return;
      }
      if (pathname === '/api/portal-data' && req.method === 'GET') {
        await authController.portalData(req, mockRes);
        return;
      }
      if (pathname === '/api/schools/search' && req.method === 'GET') {
        const schools = [
          { name: "Zilla Parishad High School, Jangaon", type: "Government", mandal: "Jangaon", medium: "Telugu & English" },
          { name: "Govt High School, Bachannapet", type: "Government", mandal: "Bachannapet", medium: "Telugu & English" },
          { name: "Kasturba Gandhi Balika Vidyalaya (KGBV)", type: "Residential", mandal: "Jangaon", medium: "English" },
          { name: "Telangana State Model School, Narmetta", type: "Model School", mandal: "Narmetta", medium: "English" },
          { name: "MPPS Primary School, Station Ghanpur", type: "Primary", mandal: "Station Ghanpur", medium: "Telugu" }
        ];
        return mockRes.json({ success: true, count: schools.length, schools });
      }

      return mockRes.status(404).json({ success: false, message: 'Route not found' });
    }

    // Static Files Serving
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Telangana DEO Jangaon Education Portal</h1><p>Starting up...</p>');
    }
  });

  bootServer(() => {
    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`TELANGANA EDUCATION PORTAL - JANGAON DISTRICT`);
      console.log(`Native HTTP Server running at http://localhost:${PORT}`);
      console.log(`====================================================`);
    });
  });
}
