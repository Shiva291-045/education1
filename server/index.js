const path = require('path');
const fs = require('fs');
const http = require('http');

process.on('uncaughtException', (err) => {
  console.error('[SERVER UNCAUGHT EXCEPTION]:', err.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[SERVER UNHANDLED REJECTION]:', reason);
});

require('./loadEnv').loadEnv();

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const db = require('./db');
const mongo = require('./mongo');
const authController = require('./controllers/authController');
const teacherController = require('./controllers/teacherController');
const schoolStrengthController = require('./controllers/schoolStrengthController');
const authConfig = require('./config/authConfig');

async function bootServer(startListening) {
  try {
    await mongo.connectMongo();
    if (mongo.isMongoConnected()) {
      await mongo.initialSeedIfEmpty(db.read());
      await db.syncFromMongo();
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'production' && mongo.isMongoConfigured()) {
      console.error('[MongoDB] Required in production but unavailable. Exiting.');
      process.exit(1);
    }
    console.warn('[MongoDB] Unavailable. Using local persistence.');
  }
  startListening();
}

// Global flag guaranteeing exactly one server starts and listens on PORT
let serverStarted = false;

// Check if Express framework is available
let express;
try {
  express = require('express');
} catch (e) {
  express = null;
}

if (express) {
  try {
    const app = express();

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

    // Static files serving with cache-busting headers
    app.use(express.static(PUBLIC_DIR, {
      setHeaders: (res, filePath) => {
        const ext = path.extname(filePath);
        if (ext === '.js' || ext === '.html' || ext === '.json') {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=3600');
        }
      }
    }));

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

    // Catch-all for non-GET requests that didn't match any route
    app.all('*', (req, res) => {
      res.status(404).json({ success: false, message: 'Endpoint not found' });
    });

    const startExpress = () => {
      if (serverStarted) return;
      serverStarted = true;
      const srv = app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`TELANGANA EDUCATION PORTAL - JANGAON DISTRICT`);
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`API endpoints available at http://localhost:${PORT}/api/auth`);
        console.log(`====================================================`);
      });
      srv.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`[EXPRESS SERVER ERROR]: Port ${PORT} already in use (EADDRINUSE).`);
        } else {
          console.error('[EXPRESS SERVER ERROR]:', err);
        }
      });
    };

    bootServer(startExpress);

  } catch (err) {
    console.warn('Express initialization error:', err.message);
    if (!serverStarted) {
      startNativeHttpServer();
    }
  }
} else {
  // Express not available - start native HTTP server fallback
  startNativeHttpServer();
}

/**
 * Pure Node.js HTTP Server fallback (Runs ONLY when Express is unavailable)
 * Zero npm dependency required, supports full REST API, auth, sessions & SPA routing.
 */
function startNativeHttpServer() {
  if (serverStarted) return;
  console.log('Express not detected or loading native HTTP server fallback...');

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

    // API Routing
    if (pathname.startsWith('/api/')) {
      req.body = await parseBody();

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
      // Teacher Service Record
      if (pathname === '/api/teacher/service-record' && req.method === 'GET') {
        await teacherController.getServiceRecord(req, mockRes);
        return;
      }
      if (pathname === '/api/teacher/preview-record' && req.method === 'GET') {
        await teacherController.getPreviewRecord(req, mockRes);
        return;
      }

      // Employee Retirements & Schedules (Protected DEO, APO, MEO)
      if (pathname === '/api/teachers/retirements' && req.method === 'GET') {
        await teacherController.getRetirements(req, mockRes);
        return;
      }

      // Teachers Information Directory & Individual Teacher Profiles (Protected DEO, APO, MEO)
      if (pathname === '/api/teachers' && req.method === 'GET') {
        await teacherController.getTeachersDirectory(req, mockRes);
        return;
      }
      if ((pathname.startsWith('/api/teachers/profile/') || (pathname.startsWith('/api/teachers/') && pathname !== '/api/teachers')) && req.method === 'GET') {
        const treasuryCode = pathname.startsWith('/api/teachers/profile/')
          ? pathname.replace('/api/teachers/profile/', '')
          : pathname.replace('/api/teachers/', '');
        if (treasuryCode) {
          await teacherController.getIndividualTeacherProfile(req, mockRes, treasuryCode);
          return;
        }
      }
      if ((pathname.startsWith('/api/teachers/profile/') || (pathname.startsWith('/api/teachers/') && pathname !== '/api/teachers')) && req.method === 'PUT') {
        const treasuryCode = pathname.startsWith('/api/teachers/profile/')
          ? pathname.replace('/api/teachers/profile/', '')
          : pathname.replace('/api/teachers/', '');
        if (treasuryCode) {
          await teacherController.updateIndividualTeacherProfile(req, mockRes, treasuryCode);
          return;
        }
      }

      if (pathname === '/api/portal-data' && req.method === 'GET') {
        await authController.portalData(req, mockRes);
        return;
      }
      if (pathname === '/api/schools/search' && req.method === 'GET') {
        await schoolStrengthController.searchSchools(req, mockRes);
        return;
      }

      // Schools Information & Strength Analytics Routes (Protected DEO & APO)
      if ((pathname === '/api/schools/information' || pathname === '/api/schools/strength') && req.method === 'GET') {
        await schoolStrengthController.getStrengthDashboard(req, mockRes);
        return;
      }
      if ((pathname.startsWith('/api/schools/information/mandal/') || pathname.startsWith('/api/schools/strength/mandal/')) && req.method === 'GET') {
        const mandalParam = pathname.startsWith('/api/schools/information/mandal/')
          ? pathname.replace('/api/schools/information/mandal/', '')
          : pathname.replace('/api/schools/strength/mandal/', '');
        await schoolStrengthController.getMandalStrength(req, mockRes, mandalParam);
        return;
      }
      if ((pathname.startsWith('/api/schools/information/mandal/') || pathname.startsWith('/api/schools/strength/mandal/')) && req.method === 'PUT') {
        const mandalParam = pathname.startsWith('/api/schools/information/mandal/')
          ? pathname.replace('/api/schools/information/mandal/', '')
          : pathname.replace('/api/schools/strength/mandal/', '');
        await schoolStrengthController.updateMandal(req, mockRes, mandalParam);
        return;
      }
      if ((pathname.startsWith('/api/schools/information/district/') || pathname.startsWith('/api/schools/strength/district/')) && req.method === 'PUT') {
        const codeParam = pathname.startsWith('/api/schools/information/district/')
          ? pathname.replace('/api/schools/information/district/', '')
          : pathname.replace('/api/schools/strength/district/', '');
        await schoolStrengthController.updateDistrict(req, mockRes, codeParam);
        return;
      }

      return mockRes.status(404).json({ success: false, message: 'Route not found' });
    }

    // For non-GET / non-HEAD requests that were not matched by API routes, return 404
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Endpoint not found' }));
      return;
    }

    // Static Files Serving
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': (ext === '.js' || ext === '.html' || ext === '.json') ? 'no-cache, must-revalidate' : 'public, max-age=3600'
      });
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => {
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Telangana DEO Jangaon Education Portal</h1><p>Starting up...</p>');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[NATIVE SERVER ERROR]: Port ${PORT} already in use (EADDRINUSE).`);
    } else {
      console.error('[NATIVE SERVER ERROR]:', err);
    }
  });

  const startNative = () => {
    if (serverStarted) return;
    serverStarted = true;
    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`TELANGANA EDUCATION PORTAL - JANGAON DISTRICT`);
      console.log(`Native HTTP Server running at http://localhost:${PORT}`);
      console.log(`====================================================`);
    });
  };

  bootServer(startNative);
}
