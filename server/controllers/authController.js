const db = require('../db');
const officialDataService = require('../services/officialDataService');
const webauthn = require('../utils/webauthn');
const { hashPassword, verifyPassword } = require('../utils/security');

// Sanitize user: NEVER leak passwordHash or raw credential private data
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  // If user has passkeys, only return count and device metadata, not keys
  if (safeUser.passkeys) {
    safeUser.passkeyCount = safeUser.passkeys.length;
    safeUser.hasPasskey = safeUser.passkeys.length > 0;
    safeUser.passkeyDevices = safeUser.passkeys.map(p => ({
      credentialId: p.credentialId,
      createdAt: p.createdAt
    }));
    delete safeUser.passkeys;
  }
  return safeUser;
}

// Cookie helper: Extract session ID from cookie or Authorization header
function getSessionIdFromReq(req) {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const c of cookies) {
      if (c.startsWith('deo_session_id=')) {
        return c.substring('deo_session_id='.length);
      }
    }
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

// Cookie helper: Set secure session cookie
function setSessionCookie(res, sessionId) {
  const cookieVal = `deo_session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Set-Cookie', cookieVal);
  } else if (typeof res.header === 'function') {
    res.header('Set-Cookie', cookieVal);
  }
}

// Cookie helper: Clear session cookie
function clearSessionCookie(res) {
  const cookieVal = `deo_session_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Set-Cookie', cookieVal);
  }
}

// RP ID from request host
function getRpId(req) {
  const host = req.headers.host || 'localhost';
  return host.split(':')[0];
}

function getOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers.host || 'localhost:5000'}`;
}

class AuthController {
  /**
   * POST /api/auth/register
   * Completely removes OTP: Name -> Role -> Mobile Number -> Password -> Confirm Password
   * Creates pending user account and returns real WebAuthn passkey registration options.
   */
  async register(req, res) {
    try {
      const { fullName, role, mobileNumber, password, confirmPassword } = req.body;

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

      // 3. Create User in Database with PENDING_VERIFICATION status
      const newUser = db.createUser({
        fullName,
        role,
        mobileNumber: cleanMobile,
        passwordHash,
        accountStatus: 'PENDING_VERIFICATION'
      });

      // 4. Generate genuine WebAuthn Registration Options for browser passkey creation
      const rpId = getRpId(req);
      const passkeyOptions = webauthn.generateRegistrationOptions({
        user: newUser,
        rpName: 'District Educational Office, Jangaon',
        rpId
      });

      return res.status(201).json({
        success: true,
        message: "Account registered successfully. Please create your device passkey.",
        user: sanitizeUser(newUser),
        passkeyOptions
      });
    } catch (err) {
      console.error('Error in register:', err);
      return res.status(500).json({ success: false, message: "Registration failed due to server error." });
    }
  }

  /**
   * POST /api/auth/webauthn/register-options
   * Initiates passkey enrollment for an existing authenticated or verified user.
   */
  async webauthnRegisterOptions(req, res) {
    try {
      const { userId } = req.body;
      const targetUserId = userId || (req.session && req.session.userId);

      if (!targetUserId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
      }

      const user = db.getUserById(targetUserId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      const rpId = getRpId(req);
      const options = webauthn.generateRegistrationOptions({
        user,
        rpName: 'District Educational Office, Jangaon',
        rpId
      });

      return res.status(200).json({ success: true, options });
    } catch (err) {
      console.error('Error in webauthnRegisterOptions:', err);
      return res.status(500).json({ success: false, message: "Error generating passkey options." });
    }
  }

  /**
   * POST /api/auth/webauthn/register-verify
   * Verifies navigator.credentials.create() response and stores public key.
   */
  async webauthnRegisterVerify(req, res) {
    try {
      const { userId, response } = req.body;

      if (!userId || !response) {
        return res.status(400).json({ success: false, message: "Missing userId or passkey response." });
      }

      const user = db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found." });
      }

      const expectedChallenge = webauthn.getAndClearChallenge(`reg_${userId}`);
      if (!expectedChallenge) {
        return res.status(400).json({
          success: false,
          message: "Passkey challenge expired or not found. Please try registration again."
        });
      }

      const rpId = getRpId(req);
      const origin = getOrigin(req);

      const verification = webauthn.verifyRegistration({
        response,
        expectedChallenge,
        expectedRpId: rpId,
        expectedOrigins: [origin, `http://${rpId}:5000`, `https://${rpId}:5000`, `http://localhost:5000`, `http://127.0.0.1:5000`]
      });

      if (!verification.success) {
        return res.status(400).json({
          success: false,
          message: verification.message || "Cryptographic passkey verification failed."
        });
      }

      // Store passkey credential securely
      db.addPasskey(user.id, verification.credential);

      // Create authenticated server session
      const session = db.createSession(user.id, user.role, { authMethod: 'passkey' });
      setSessionCookie(res, session.sessionId);

      const updatedUser = db.getUserById(user.id);
      return res.status(200).json({
        success: true,
        message: "✓ Device Passkey Registered Successfully!",
        user: sanitizeUser(updatedUser),
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error('Error in webauthnRegisterVerify:', err);
      return res.status(500).json({ success: false, message: "Passkey registration verification failed." });
    }
  }

  /**
   * POST /api/auth/webauthn/login-options
   * Prepares challenge and allowed credential IDs for navigator.credentials.get()
   */
  async webauthnLoginOptions(req, res) {
    try {
      const { identifier } = req.body;

      if (!identifier) {
        return res.status(400).json({ success: false, message: "Please enter your Mobile Number or Employee ID." });
      }

      const user = db.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "❌ Account not found. Please register or verify your credentials."
        });
      }

      const passkeys = db.getUserPasskeys(user.id);
      if (!passkeys || passkeys.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No Passkey registered for this account. Please use password login or complete initial verification to register a Passkey.",
          hasPasskey: false
        });
      }

      const rpId = getRpId(req);
      const options = webauthn.generateAuthenticationOptions({
        user,
        passkeys,
        rpId
      });

      return res.status(200).json({
        success: true,
        options,
        userId: user.id
      });
    } catch (err) {
      console.error('Error in webauthnLoginOptions:', err);
      return res.status(500).json({ success: false, message: "Error preparing passkey authentication." });
    }
  }

  /**
   * POST /api/auth/webauthn/login-verify
   * Verifies assertion signature from navigator.credentials.get() and logs in user.
   */
  async webauthnLoginVerify(req, res) {
    try {
      const { identifier, userId, response } = req.body;

      if (!response || !response.id) {
        return res.status(400).json({ success: false, message: "Missing passkey authentication response." });
      }

      // Find user
      let user = null;
      if (userId) user = db.getUserById(userId);
      if (!user && identifier) user = db.getUserByIdentifier(identifier);
      if (!user) user = db.getUserByCredentialId(response.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found." });
      }

      const passkeys = db.getUserPasskeys(user.id);
      const credential = passkeys.find(p => p.credentialId === response.id);

      if (!credential) {
        return res.status(401).json({
          success: false,
          message: "❌ Unrecognized passkey credential. Please use a registered passkey."
        });
      }

      const expectedChallenge = webauthn.getAndClearChallenge(`auth_${user.id}`);
      if (!expectedChallenge) {
        return res.status(400).json({
          success: false,
          message: "Authentication challenge expired. Please retry passkey login."
        });
      }

      const rpId = getRpId(req);
      const origin = getOrigin(req);

      const verification = webauthn.verifyAuthentication({
        response,
        credential,
        expectedChallenge,
        expectedRpId: rpId,
        expectedOrigins: [origin, `http://${rpId}:5000`, `https://${rpId}:5000`, `http://localhost:5000`, `http://127.0.0.1:5000`]
      });

      if (!verification.success) {
        return res.status(401).json({
          success: false,
          message: verification.message || "Passkey cryptographic assertion failed."
        });
      }

      // Update counter and last login
      db.updatePasskeyCounter(user.id, credential.credentialId, verification.counter);
      db.updateUserLastLogin(user.id);

      // Create authenticated server session
      const session = db.createSession(user.id, user.role, { authMethod: 'passkey' });
      setSessionCookie(res, session.sessionId);

      const updatedUser = db.getUserById(user.id);
      return res.status(200).json({
        success: true,
        message: "✓ Passkey Authentication Successful",
        user: sanitizeUser(updatedUser),
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error('Error in webauthnLoginVerify:', err);
      return res.status(500).json({ success: false, message: "Passkey authentication failed." });
    }
  }

  /**
   * POST /api/auth/teacher/login
   * Dedicated Teacher Login using Employee ID + Registered Mobile Number.
   * Strict backend verification against official employee records.
   */
  async teacherLogin(req, res) {
    try {
      const { employeeId, mobileNumber } = req.body;

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
      setSessionCookie(res, session.sessionId);

      const updatedUser = db.getUserById(user.id);
      const hasPasskey = (user.passkeys && user.passkeys.length > 0);

      return res.status(200).json({
        success: true,
        message: "✓ Teacher Verified Successfully",
        user: sanitizeUser(updatedUser),
        sessionId: session.sessionId,
        hasPasskey
      });
    } catch (err) {
      console.error('Error in teacherLogin:', err);
      return res.status(500).json({ success: false, message: "Teacher login failed due to server error." });
    }
  }

  /**
   * POST /api/auth/login
   * Fallback Password Login (Administrative or General)
   */
  async login(req, res) {
    try {
      const { identifier, mobileNumber, password } = req.body;
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
          message: "No password configured for this account. Please use Passkey login or Employee ID verification."
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
      setSessionCookie(res, session.sessionId);

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
   * Reads server-side session from cookie
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
      clearSessionCookie(res);
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
