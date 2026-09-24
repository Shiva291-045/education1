const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Initialize database
const db = require('./db');
const authController = require('./controllers/authController');

let app;
let isExpress = false;

try {
  const express = require('express');
  const cors = require('cors');
  app = express();
  isExpress = true;

  app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
  }));
  app.use(express.json());

  // Static files
  app.use(express.static(PUBLIC_DIR));

  // Routes
  const authRoutes = require('./routes/authRoutes');
  const portalRoutes = require('./routes/portalRoutes');

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

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`TELANGANA EDUCATION PORTAL - JANGAON DISTRICT`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/auth`);
    console.log(`====================================================`);
  });

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
    const reqOrigin = req.headers.origin || `http://${req.headers.host || 'localhost:5000'}`;
    // CORS headers supporting credentials
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlObj = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = urlObj.pathname;

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

    const mockRes = {
      statusCode: 200,
      setHeader(name, value) {
        res.setHeader(name, value);
        return this;
      },
      header(name, value) {
        res.setHeader(name, value);
        return this;
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

    // API Routing
    if (pathname.startsWith('/api/')) {
      req.body = await parseBody();

      // WebAuthn Passkey Routes
      if (pathname === '/api/auth/webauthn/register-options' && req.method === 'POST') {
        return authController.webauthnRegisterOptions(req, mockRes);
      }
      if (pathname === '/api/auth/webauthn/register-verify' && req.method === 'POST') {
        return authController.webauthnRegisterVerify(req, mockRes);
      }
      if (pathname === '/api/auth/webauthn/login-options' && req.method === 'POST') {
        return authController.webauthnLoginOptions(req, mockRes);
      }
      if (pathname === '/api/auth/webauthn/login-verify' && req.method === 'POST') {
        return authController.webauthnLoginVerify(req, mockRes);
      }

      // Teacher Login
      if (pathname === '/api/auth/teacher/login' && req.method === 'POST') {
        return authController.teacherLogin(req, mockRes);
      }

      // Registration & Standard Login
      if (pathname === '/api/auth/register' && req.method === 'POST') {
        return authController.register(req, mockRes);
      }
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        return authController.login(req, mockRes);
      }

      // Session & Info
      if (pathname === '/api/auth/me' && req.method === 'GET') {
        return authController.me(req, mockRes);
      }
      if (pathname === '/api/auth/logout' && req.method === 'POST') {
        return authController.logout(req, mockRes);
      }
      if (pathname === '/api/official/link-status' && req.method === 'GET') {
        return authController.linkStatus(req, mockRes);
      }
      if (pathname === '/api/portal-data' && req.method === 'GET') {
        return authController.portalData(req, mockRes);
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

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`TELANGANA EDUCATION PORTAL - JANGAON DISTRICT`);
    console.log(`Native HTTP Server running at http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}
