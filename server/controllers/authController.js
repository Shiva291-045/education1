const db = require('../db');
const otpService = require('../services/otpService');
const officialDataService = require('../services/officialDataService');
const { hashPassword, verifyPassword, generateToken, verifyToken } = require('../utils/security');

// Sanitize user: NEVER leak passwordHash
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

class AuthController {
  /**
   * POST /api/auth/send-otp
   */
  async sendOtp(req, res) {
    try {
      const { mobileNumber, purpose = 'REGISTRATION' } = req.body;

      if (!mobileNumber) {
        return res.status(400).json({ success: false, message: "Mobile number is required." });
      }

      const val = otpService.validateMobile(mobileNumber);
      if (!val.valid) {
        return res.status(400).json({ success: false, message: val.message });
      }
      const cleanMobile = val.mobileNumber;

      // Check registration status
      const existingUser = db.getUserByMobile(cleanMobile);

      if (purpose === 'REGISTRATION') {
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "❌ Mobile number is already registered. Please login instead."
          });
        }
      } else if (purpose === 'LOGIN' || purpose === 'FORGOT_PASSWORD') {
        if (!existingUser) {
          return res.status(404).json({
            success: false,
            message: "❌ Mobile number not found. Please register an account first."
          });
        }
        if (existingUser.accountStatus !== 'ACTIVE') {
          return res.status(403).json({
            success: false,
            message: "❌ Account is disabled or suspended. Please contact the district educational office."
          });
        }
      }

      // Dispatch OTP
      const result = await otpService.sendOtp(cleanMobile, purpose);
      return res.status(result.status).json(result);
    } catch (err) {
      console.error('Error in sendOtp:', err);
      return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
    }
  }

  /**
   * POST /api/auth/verify-otp
   */
  async verifyOtp(req, res) {
    try {
      const { mobileNumber, otpCode, purpose = 'REGISTRATION' } = req.body;
      const result = await otpService.verifyOtp(mobileNumber, otpCode, purpose);
      return res.status(result.status).json(result);
    } catch (err) {
      console.error('Error in verifyOtp:', err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }

  /**
   * POST /api/auth/register
   * Workflow:
   * Registration -> Full Name -> Role -> Mobile Number -> Password -> Confirm Password
   * -> Send OTP -> Verify OTP -> Create Account -> Check Official Department Data
   * -> Link Official Data -> Dashboard
   */
  async register(req, res) {
    try {
      const { fullName, role, mobileNumber, password, confirmPassword, otpCode } = req.body;

      // 1. Validations
      if (!fullName || fullName.trim().length < 3) {
        return res.status(400).json({ success: false, message: "Please enter your full name (minimum 3 characters)." });
      }

      const validRoles = ['APO', 'DEO', 'MEO', 'Teacher'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid role (APO, DEO, MEO, or Teacher)."
        });
      }

      const val = otpService.validateMobile(mobileNumber);
      if (!val.valid) {
        return res.status(400).json({ success: false, message: val.message });
      }
      const cleanMobile = val.mobileNumber;

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

      // 2. Verify OTP
      const otpVerification = await otpService.verifyOtp(cleanMobile, otpCode, 'REGISTRATION');
      if (!otpVerification.success) {
        return res.status(otpVerification.status).json(otpVerification);
      }

      // 3. Password Hashing (Secure scrypt with salt stretching, never plaintext)
      const passwordHash = hashPassword(password);

      // 4. Create User Account in Database (Real Authentication Data Only)
      const newUser = db.createUser({
        fullName,
        role,
        mobileNumber: cleanMobile,
        passwordHash
      });

      // 5. Check Official Department Data via dedicated service abstraction
      const officialCheckResult = await officialDataService.checkAndLinkOfficialData(
        newUser.id,
        cleanMobile,
        role
      );

      // 6. Generate authenticated session token
      const token = generateToken({
        id: newUser.id,
        role: newUser.role,
        mobileNumber: newUser.mobileNumber,
        fullName: newUser.fullName
      });

      const refreshedUser = db.getUserById(newUser.id);

      return res.status(201).json({
        success: true,
        message: "✓ Account Created Successfully",
        user: sanitizeUser(refreshedUser),
        token,
        officialDataResult: officialCheckResult
      });
    } catch (err) {
      console.error('Error in register:', err);
      return res.status(500).json({ success: false, message: "Registration failed due to server error." });
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { mobileNumber, password } = req.body;

      if (!mobileNumber || !password) {
        return res.status(400).json({
          success: false,
          message: "Mobile number and password are required."
        });
      }

      const val = otpService.validateMobile(mobileNumber);
      if (!val.valid) {
        return res.status(400).json({ success: false, message: val.message });
      }
      const cleanMobile = val.mobileNumber;

      // Find user
      const user = db.getUserByMobile(cleanMobile);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "❌ Account not found. Please register your account."
        });
      }

      if (user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: "❌ Account disabled. Please contact the district educational office."
        });
      }

      // Verify password against stored hash
      const isMatch = verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "❌ Incorrect password. Please try again."
        });
      }

      // Update last login
      db.updateUserLastLogin(user.id);
      const updatedUser = db.getUserById(user.id);

      // Issue session token
      const token = generateToken({
        id: updatedUser.id,
        role: updatedUser.role,
        mobileNumber: updatedUser.mobileNumber,
        fullName: updatedUser.fullName
      });

      return res.status(200).json({
        success: true,
        message: "✓ Login successful.",
        user: sanitizeUser(updatedUser),
        token
      });
    } catch (err) {
      console.error('Error in login:', err);
      return res.status(500).json({ success: false, message: "Login failed due to server error." });
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const { mobileNumber } = req.body;
      const val = otpService.validateMobile(mobileNumber);
      if (!val.valid) {
        return res.status(400).json({ success: false, message: val.message });
      }
      const cleanMobile = val.mobileNumber;

      const user = db.getUserByMobile(cleanMobile);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "❌ No account found with this mobile number."
        });
      }

      const result = await otpService.sendOtp(cleanMobile, 'FORGOT_PASSWORD');
      return res.status(result.status).json(result);
    } catch (err) {
      console.error('Error in forgotPassword:', err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { mobileNumber, otpCode, newPassword, confirmPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long."
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match."
        });
      }

      const val = otpService.validateMobile(mobileNumber);
      if (!val.valid) {
        return res.status(400).json({ success: false, message: val.message });
      }
      const cleanMobile = val.mobileNumber;

      const otpRes = await otpService.verifyOtp(cleanMobile, otpCode, 'FORGOT_PASSWORD');
      if (!otpRes.success) {
        return res.status(otpRes.status).json(otpRes);
      }

      const user = db.getUserByMobile(cleanMobile);
      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found." });
      }

      const newPasswordHash = hashPassword(newPassword);
      db.updateUser(user.id, { passwordHash: newPasswordHash });

      return res.status(200).json({
        success: true,
        message: "✓ Password updated successfully. You can now login."
      });
    } catch (err) {
      console.error('Error in resetPassword:', err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }

  /**
   * GET /api/auth/me
   */
  async me(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Unauthorized. Missing token." });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ success: false, message: "Session expired. Please login again." });
      }

      const user = db.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      return res.status(200).json({
        success: true,
        user: sanitizeUser(user)
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
    return res.status(200).json({
      success: true,
      message: "✓ Logged out successfully."
    });
  }

  /**
   * GET /api/official/link-status
   */
  async linkStatus(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ success: false, message: "Session expired." });
      }

      const status = await officialDataService.getStatus(decoded.id);
      return res.status(200).json({ success: true, ...status });
    } catch (err) {
      console.error('Error in linkStatus:', err);
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
