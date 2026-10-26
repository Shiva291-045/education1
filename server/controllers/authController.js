const db = require('../db');
const officialDataService = require('../services/officialDataService');
const { hashPassword, verifyPassword } = require('../utils/security');
const authConfig = require('../config/authConfig');

// Sanitize user: NEVER leak passwordHash or credential private data
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function getSessionIdFromReq(req) {
  const fromCookie = authConfig.getCookie(req, 'deo_session_id');
  if (fromCookie) return fromCookie;
  const authHeader = req.headers && req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

function setSessionCookie(res, sessionId, req) {
  authConfig.appendSetCookie(res, authConfig.buildCookie('deo_session_id', sessionId, { maxAgeSeconds: 86400, req }));
}

function clearSessionCookie(res, req) {
  authConfig.appendSetCookie(res, authConfig.buildCookie('deo_session_id', '', { clear: true, req }));
}

class AuthController {
  /**
   * POST /api/auth/register
   * Direct Administrative Registration: Name -> Role -> Mobile Number -> Password -> Confirm Password
   * Automatically hashes password, registers the account, creates an authenticated session, and returns user data.
   */
  async register(req, res) {
    try {
      const { fullName, role, mobileNumber, password, confirmPassword, mandal } = req.body || {};

      // 1. Validation
      if (!fullName || fullName.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Please enter your full name (minimum 3 characters)."
        });
      }

      // Teacher role must not be registered publicly
      if (role === 'Teacher') {
        return res.status(400).json({
          success: false,
          message: "Teachers must not use public registration. Please use the dedicated Teacher Login with your Employee ID and Registered Mobile Number."
        });
      }

      const validRoles = ['APO', 'DEO', 'MEO'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Please select an authorized administrative role (APO, DEO, or MEO)."
        });
      }

      if (role === 'MEO' && (!mandal || mandal.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: "Please select your assigned mandal for MEO jurisdiction."
        });
      }

      const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '').slice(-10);
      if (cleanMobile.length !== 10) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit mobile number."
        });
      }

      // Check existing user
      const existingUser = db.getUserByMobile(cleanMobile);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "❌ Mobile number is already registered. Please login instead."
        });
      }

      // Password Validation
      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long."
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Password and Confirm Password do not match."
        });
      }

      // 2. Hash Password securely (scrypt)
      const passwordHash = hashPassword(password);

      // 3. Create User in Database with ACTIVE status
      const newUser = db.createUser({
        fullName,
        role,
        mobileNumber: cleanMobile,
        mandal: role === 'MEO' ? (mandal || 'JANGAON').trim().toUpperCase() : null,
        passwordHash,
        accountStatus: 'ACTIVE'
      });

      // 4. Create authenticated session
      const session = db.createSession(newUser.id, newUser.role, { authMethod: 'password' });
      setSessionCookie(res, session.sessionId, req);

      return res.status(201).json({
        success: true,
        message: "Account registered successfully.",
        user: sanitizeUser(newUser),
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error('Error in register:', err);
      return res.status(500).json({ success: false, message: "Registration failed due to server error." });
    }
  }

  /**
   * POST /api/auth/teacher/login
   * Dedicated Teacher Login using Employee ID + Registered Mobile Number.
   * Strict backend verification against official employee records.
   */
  async teacherLogin(req, res) {
    try {
      const { employeeId, mobileNumber } = req.body || {};

      if (!employeeId || !mobileNumber) {
        return res.status(400).json({
          success: false,
          message: "Both Employee ID and Registered Mobile Number are required."
        });
      }

      const verification = await officialDataService.verifyTeacherEmployee(employeeId, mobileNumber);
      if (!verification.success) {
        return res.status(401).json({
          success: false,
          message: verification.message
        });
      }

      const employee = verification.employee;

      // Upsert teacher user in database
      const user = db.upsertTeacherUser(employee);

      // Create session
      const session = db.createSession(user.id, 'Teacher', { authMethod: 'teacher_credentials' });
      setSessionCookie(res, session.sessionId, req);

      const updatedUser = db.getUserById(user.id);

      return res.status(200).json({
        success: true,
        message: "✓ Teacher Verified Successfully",
        user: sanitizeUser(updatedUser),
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error('Error in teacherLogin:', err);
      return res.status(500).json({ success: false, message: "Teacher login failed due to server error." });
    }
  }

  /**
   * POST /api/auth/login
   * Password Login (Administrative or General)
   */
  async login(req, res) {
    try {
      const { identifier, mobileNumber, password } = req.body || {};
      const targetId = identifier || mobileNumber;

      if (!targetId || !password) {
        return res.status(400).json({
          success: false,
          message: "Identifier (Mobile / Employee ID) and password are required."
        });
      }

      const user = db.getUserByIdentifier(targetId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "❌ Account not found. Please register or verify your credentials."
        });
      }

      if (!user.passwordHash) {
        return res.status(400).json({
          success: false,
          message: "No password configured for this account. Please contact the district administrator."
        });
      }

      const isMatch = verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "❌ Incorrect password. Please try again."
        });
      }

      db.updateUserLastLogin(user.id);
      const updatedUser = db.getUserById(user.id);

      const session = db.createSession(updatedUser.id, updatedUser.role, { authMethod: 'password' });
      setSessionCookie(res, session.sessionId, req);

      return res.status(200).json({
        success: true,
        message: "✓ Login successful.",
        user: sanitizeUser(updatedUser),
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error('Error in login:', err);
      return res.status(500).json({ success: false, message: "Login failed due to server error." });
    }
  }

  /**
   * GET /api/auth/me
   * Reads server-side session from cookie or Authorization header
   */
  async me(req, res) {
    try {
      const sessionId = getSessionIdFromReq(req);
      if (!sessionId) {
        return res.status(401).json({ success: false, message: "No active session." });
      }

      const session = db.getSession(sessionId);
      if (!session) {
        return res.status(401).json({ success: false, message: "Session expired or invalid. Please login again." });
      }

      const user = db.getUserById(session.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      return res.status(200).json({
        success: true,
        user: sanitizeUser(user),
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error('Error in me:', err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const sessionId = getSessionIdFromReq(req);
      if (sessionId) {
        db.destroySession(sessionId);
      }
      clearSessionCookie(res, req);
      return res.status(200).json({
        success: true,
        message: "✓ Logged out successfully."
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Logout error." });
    }
  }

  /**
   * GET /api/official/link-status
   */
  async linkStatus(req, res) {
    try {
      const sessionId = getSessionIdFromReq(req);
      if (!sessionId) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }
      const session = db.getSession(sessionId);
      if (!session) {
        return res.status(401).json({ success: false, message: "Session expired." });
      }

      const status = await officialDataService.getStatus(session.userId);
      return res.status(200).json({ success: true, ...status });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error." });
    }
  }

  /**
   * GET /api/portal/data
   */
  async portalData(req, res) {
    try {
      const data = db.getPortalData();
      return res.status(200).json({ success: true, ...data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error." });
    }
  }
}

module.exports = new AuthController();
