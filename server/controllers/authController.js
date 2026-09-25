const db = require('../db');
const officialDataService = require('../services/officialDataService');
const webauthn = require('../utils/webauthn');
const challengeService = require('../services/challengeService');
const { hashPassword, verifyPassword } = require('../utils/security');
const authConfig = require('../config/authConfig');

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

const PENDING_PASSKEY_COOKIE = 'deo_webauthn_pending';

function getSessionIdFromReq(req) {
  const fromCookie = authConfig.getCookie(req, 'deo_session_id');
  if (fromCookie) return fromCookie;
  const authHeader = req.headers.authorization;
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

function setPendingPasskeyCookie(res, token, req) {
  authConfig.appendSetCookie(res, authConfig.buildCookie(PENDING_PASSKEY_COOKIE, token, { maxAgeSeconds: 10 * 60, req }));
}

function clearPendingPasskeyCookie(res, req) {
  authConfig.appendSetCookie(res, authConfig.buildCookie(PENDING_PASSKEY_COOKIE, '', { clear: true, req }));
}

function extractAttestationResponse(body) {
  if (!body) return {};
  if (body.clientDataJSON && body.attestationObject) {
    return body;
  }
  const payload = body.response || body;
  if (payload.clientDataJSON && payload.attestationObject) {
    return {
      id: body.id || payload.id,
      rawId: body.rawId || payload.rawId,
      transports: payload.transports || body.transports,
      ...payload
    };
  }
  if (payload.response && payload.response.clientDataJSON) {
    return {
      id: payload.id || body.id,
      rawId: payload.rawId || body.rawId,
      transports: payload.response.transports || payload.transports || body.transports,
      ...payload.response
    };
  }
  return payload;
}

function extractAssertionResponse(body) {
  if (!body) return {};
  if (body.clientDataJSON && body.authenticatorData) {
    return body;
  }
  const payload = body.response || body;
  if (payload.clientDataJSON && payload.authenticatorData) {
    return {
      id: body.id || payload.id,
      rawId: body.rawId || payload.rawId,
      ...payload
    };
  }
  if (payload.response && payload.response.clientDataJSON) {
    return {
      id: payload.id || body.id,
      rawId: payload.rawId || body.rawId,
      ...payload.response
    };
  }
  return payload;
}

async function resolvePasskeyUserId(req, registrationType, boundChallenge) {
  let bodyUserId = req.body && req.body.userId ? String(req.body.userId).trim() : null;
  if (!bodyUserId && req.body) {
    const ident = req.body.identifier || req.body.mobileNumber || req.body.employeeId;
    if (ident) {
      const foundUser = db.getUserByIdentifier(ident) || db.getUserByMobile(ident);
      if (foundUser) {
        bodyUserId = String(foundUser.id);
      }
    }
  }

  const sessionId = getSessionIdFromReq(req);
  const session = sessionId ? db.getSession(sessionId) : null;

  let trustedUserId = null;
  if (session && session.userId) {
    trustedUserId = String(session.userId);
  } else {
    const pendingToken = authConfig.getCookie(req, PENDING_PASSKEY_COOKIE);
    if (pendingToken) {
      const bound = await challengeService.getByEnrollmentToken(pendingToken);
      if (bound && bound.userId) {
        if (!registrationType || bound.registrationType === registrationType) {
          trustedUserId = String(bound.userId);
        }
      }
    }
  }

  if (boundChallenge && boundChallenge.userId) {
    const challengeUserId = String(boundChallenge.userId);
    if (registrationType && boundChallenge.registrationType !== registrationType) {
      return { error: 'Challenge not found.', status: 400 };
    }
    if (trustedUserId && trustedUserId !== challengeUserId) {
      return { error: 'User mismatch.', status: 403 };
    }
    if (bodyUserId && bodyUserId !== challengeUserId) {
      return { error: 'User mismatch.', status: 403 };
    }
    return { userId: challengeUserId };
  }

  if (trustedUserId) {
    if (bodyUserId && bodyUserId !== trustedUserId) {
      return { error: 'User mismatch.', status: 403 };
    }
    return { userId: trustedUserId };
  }

  if (bodyUserId) {
    return { userId: bodyUserId };
  }

  return { error: 'Missing or invalid session.', status: 401 };
}

function challengeErrorStatus(stored) {
  if (!stored || stored.valid) return 400;
  if (stored.error === 'CHALLENGE_NOT_FOUND') return 400;
  if (stored.error === 'CHALLENGE_EXPIRED') return 400;
  if (stored.error === 'CHALLENGE_ALREADY_CONSUMED') return 400;
  return 400;
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
      const rpId = authConfig.getWebAuthnRpId(req);
      const stored = await challengeService.createRegistrationChallenge(newUser.id);
      const passkeyOptions = webauthn.generateRegistrationOptions({
        user: newUser,
        challenge: stored.challenge,
        rpName: 'District Educational Office, Jangaon',
        rpId
      });
      setPendingPasskeyCookie(res, stored.enrollmentToken, req);

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
      const resolved = await resolvePasskeyUserId(req, challengeService.REGISTRATION_TYPE);
      if (resolved.error) {
        return res.status(resolved.status).json({ success: false, message: resolved.error });
      }

      const user = db.getUserById(resolved.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      const rpId = authConfig.getWebAuthnRpId(req);
      const stored = await challengeService.createRegistrationChallenge(user.id);
      const options = webauthn.generateRegistrationOptions({
        user,
        challenge: stored.challenge,
        rpName: 'District Educational Office, Jangaon',
        rpId
      });
      setPendingPasskeyCookie(res, stored.enrollmentToken, req);

      return res.status(200).json({
        success: true,
        options,
        challenge: stored.challenge,
        userId: user.id,
        enrollmentToken: stored.enrollmentToken,
        ...options
      });
    } catch (err) {
      console.error('Error in webauthnRegisterOptions:', err.message);
      return res.status(500).json({ success: false, message: "Error generating passkey options." });
    }
  }

  /**
   * POST /api/auth/webauthn/register-verify
   * Verifies navigator.credentials.create() response and stores public key.
   */
  async webauthnRegisterVerify(req, res) {
    try {
      const response = extractAttestationResponse(req.body);
      if (!response || !response.clientDataJSON || !response.attestationObject) {
        return res.status(400).json({ success: false, message: "WebAuthn verification failed." });
      }

      const clientChallenge = webauthn.extractClientChallenge(response);
      let challengeDoc = clientChallenge
        ? await challengeService.findByChallengeValue(clientChallenge)
        : null;

      const resolved = await resolvePasskeyUserId(req, challengeService.REGISTRATION_TYPE, challengeDoc);
      if (resolved.error) {
        return res.status(resolved.status).json({ success: false, message: resolved.error });
      }

      if (!challengeDoc) {
        challengeDoc = await challengeService.findStoredChallenge(resolved.userId, challengeService.REGISTRATION_TYPE);
      }

      const stored = challengeService.validateChallengeDoc(challengeDoc);
      if (!stored.valid) {
        console.warn(`[WebAuthn] Registration challenge rejected: ${stored.error}`);
        return res.status(challengeErrorStatus(stored)).json({
          success: false,
          message: stored.message
        });
      }

      if (String(challengeDoc.userId) !== String(resolved.userId)) {
        return res.status(403).json({ success: false, message: 'User mismatch.' });
      }
      if (challengeDoc.registrationType !== challengeService.REGISTRATION_TYPE) {
        return res.status(400).json({ success: false, message: 'Challenge not found.' });
      }

      const user = db.getUserById(resolved.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found." });
      }

      const rpId = authConfig.getWebAuthnRpId(req);
      const expectedOrigins = authConfig.getExpectedOrigins(req);

      const verification = webauthn.verifyRegistration({
        response,
        expectedChallenge: stored.challenge,
        expectedRpId: rpId,
        expectedOrigins
      });

      if (!verification.success) {
        console.warn('[WebAuthn] Registration verification failed; challenge left unconsumed.');
        return res.status(400).json({
          success: false,
          message: verification.message || "WebAuthn verification failed."
        });
      }

      db.addPasskey(user.id, verification.credential);
      await challengeService.consumeChallenge(user.id, stored.challenge, challengeService.REGISTRATION_TYPE);

      const session = db.createSession(user.id, user.role, { authMethod: 'passkey' });
      setSessionCookie(res, session.sessionId, req);
      clearPendingPasskeyCookie(res, req);

      const updatedUser = db.getUserById(user.id);
      return res.status(200).json({
        success: true,
        message: "✓ Device Passkey Registered Successfully!",
        user: sanitizeUser(updatedUser),
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error('Error in webauthnRegisterVerify:', err.message);
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

      const rpId = authConfig.getWebAuthnRpId(req);
      const stored = await challengeService.createLoginChallenge(user.id);
      const options = webauthn.generateAuthenticationOptions({
        user,
        passkeys,
        rpId,
        challenge: stored.challenge
      });

      return res.status(200).json({
        success: true,
        options,
        challenge: stored.challenge,
        userId: user.id,
        ...options
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
      const { identifier, userId } = req.body || {};

      const assertion = extractAssertionResponse(req.body);
      if (!assertion || !assertion.id) {
        return res.status(400).json({ success: false, message: "Missing passkey authentication response." });
      }

      const clientChallenge = webauthn.extractClientChallenge(assertion);
      const challengeDoc = clientChallenge
        ? await challengeService.findByChallengeValue(clientChallenge)
        : null;
      if (challengeDoc && challengeDoc.registrationType !== challengeService.AUTHENTICATION_TYPE) {
        return res.status(400).json({ success: false, message: 'Challenge not found.' });
      }

      // Find user
      let user = null;
      if (challengeDoc && challengeDoc.userId) user = db.getUserById(challengeDoc.userId);
      if (!user && userId) user = db.getUserById(userId);
      if (!user && identifier) user = db.getUserByIdentifier(identifier);
      if (!user) user = db.getUserByCredentialId(assertion.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found." });
      }

      const passkeys = db.getUserPasskeys(user.id);
      const credential = passkeys.find(p => p.credentialId === assertion.id);

      if (!credential) {
        return res.status(401).json({
          success: false,
          message: "❌ Unrecognized passkey credential. Please use a registered passkey."
        });
      }

      const stored = challengeDoc
        ? challengeService.validateChallengeDoc(challengeDoc)
        : await challengeService.getValidLoginChallenge(user.id);
      if (!stored.valid) {
        console.warn(`[WebAuthn] Login challenge rejected: ${stored.error}`);
        return res.status(challengeErrorStatus(stored)).json({
          success: false,
          message: stored.message
        });
      }
      if (challengeDoc && String(challengeDoc.userId) !== String(user.id)) {
        return res.status(403).json({ success: false, message: 'User mismatch.' });
      }

      const rpId = authConfig.getWebAuthnRpId(req);
      const expectedOrigins = authConfig.getExpectedOrigins(req);

      const verification = webauthn.verifyAuthentication({
        response: assertion,
        credential,
        expectedChallenge: stored.challenge,
        expectedRpId: rpId,
        expectedOrigins
      });

      if (!verification.success) {
        return res.status(401).json({
          success: false,
          message: verification.message || "WebAuthn verification failed."
        });
      }

      db.updatePasskeyCounter(user.id, credential.credentialId, verification.counter);
      db.updateUserLastLogin(user.id);
      await challengeService.consumeLoginChallenge(user.id, stored.challenge);

      // Create authenticated server session
      const session = db.createSession(user.id, user.role, { authMethod: 'passkey' });
      setSessionCookie(res, session.sessionId, req);

      const updatedUser = db.getUserById(user.id);
      return res.status(200).json({
        success: true,
        message: "✓ Passkey Authentication Successful",
        user: sanitizeUser(updatedUser),
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error('Error in webauthnLoginVerify:', err.message);
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
      setSessionCookie(res, session.sessionId, req);

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

  // Explicit passkey methods for /passkey/register/start and /passkey/register/finish
  async passkeyRegisterStart(req, res) {
    return this.webauthnRegisterOptions(req, res);
  }

  async passkeyRegisterFinish(req, res) {
    return this.webauthnRegisterVerify(req, res);
  }

  async passkeyLoginStart(req, res) {
    return this.webauthnLoginOptions(req, res);
  }

  async passkeyLoginFinish(req, res) {
    return this.webauthnLoginVerify(req, res);
  }
}

module.exports = new AuthController();
