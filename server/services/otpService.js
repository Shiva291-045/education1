const db = require('../db');

class OtpService {
  /**
   * Validate Indian 10-digit mobile number
   */
  validateMobile(mobileNumber) {
    if (!mobileNumber) return { valid: false, message: "Mobile number is required." };
    const cleaned = mobileNumber.toString().trim().replace(/\D/g, '');
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleaned)) {
      return {
        valid: false,
        message: "Invalid mobile number. Please enter a valid 10-digit Indian mobile number."
      };
    }
    return { valid: true, mobileNumber: cleaned };
  }

  /**
   * Generate and dispatch 6-digit OTP
   */
  async sendOtp(mobileNumber, purpose = 'REGISTRATION') {
    const val = this.validateMobile(mobileNumber);
    if (!val.valid) {
      return { success: false, status: 400, message: val.message };
    }
    const cleanMobile = val.mobileNumber;

    // Check resend cooldown (60 seconds)
    const recentOtp = db.getLatestOtp(cleanMobile, purpose);
    if (recentOtp && !recentOtp.verified) {
      const elapsed = Date.now() - new Date(recentOtp.createdAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsed < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - elapsed) / 1000);
        return {
          success: false,
          status: 429,
          message: `Please wait ${waitSec} seconds before requesting a new OTP.`
        };
      }
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in database
    const otpRecord = db.saveOtp({
      mobileNumber: cleanMobile,
      otpCode,
      purpose
    });

    // Department SMS Gateway Dispatch
    const smsMessage = `[GOVERNMENT OF TELANGANA - DEO JANGAON] Your OTP for ${purpose.toLowerCase()} is ${otpCode}. Valid for 5 minutes. Do not share with anyone.`;
    console.log(`\n======================================================`);
    console.log(`[SMS GATEWAY DISPATCH] To: +91-${cleanMobile}`);
    console.log(smsMessage);
    console.log(`======================================================\n`);

    return {
      success: true,
      status: 200,
      message: "OTP sent successfully to your mobile number.",
      mobileNumber: cleanMobile,
      expiresInSeconds: 300,
      // For immediate ease of local testing & demonstration without SMS gateway credits:
      debugOtp: otpCode
    };
  }

  /**
   * Verify entered 6-digit OTP
   */
  async verifyOtp(mobileNumber, otpCode, purpose = 'REGISTRATION') {
    const val = this.validateMobile(mobileNumber);
    if (!val.valid) {
      return { success: false, status: 400, message: val.message };
    }
    const cleanMobile = val.mobileNumber;

    if (!otpCode || otpCode.trim().length !== 6) {
      return { success: false, status: 400, message: "Please enter a valid 6-digit OTP." };
    }

    const otpRecord = db.getLatestOtp(cleanMobile, purpose);
    if (!otpRecord) {
      return {
        success: false,
        status: 404,
        message: "No OTP request found for this mobile number. Please click 'Send OTP'."
      };
    }

    if (otpRecord.verified) {
      return {
        success: false,
        status: 400,
        message: "This OTP has already been verified. Please proceed or request a new OTP."
      };
    }

    // Check expiration
    if (Date.now() > otpRecord.expiresAt) {
      return {
        success: false,
        status: 410,
        message: "OTP has expired. Please click 'Resend OTP' to get a new code."
      };
    }

    // Check attempt limit
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return {
        success: false,
        status: 429,
        message: "Maximum OTP attempts exceeded (3/3). Please request a new OTP."
      };
    }

    // Increment attempts
    const newAttemptCount = db.incrementOtpAttempts(otpRecord.id);

    // Verify code match
    if (otpRecord.otpCode !== otpCode.trim()) {
      const remaining = otpRecord.maxAttempts - newAttemptCount;
      return {
        success: false,
        status: 400,
        message: `Invalid OTP. Please try again.${remaining > 0 ? ` (${remaining} attempts remaining)` : ' Maximum attempts reached. Please request a new OTP.'}`
      };
    }

    // Mark as verified
    db.markOtpVerified(otpRecord.id);

    return {
      success: true,
      status: 200,
      message: "✓ OTP verified successfully."
    };
  }
}

module.exports = new OtpService();
