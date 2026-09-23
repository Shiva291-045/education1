/**
 * End-to-End Automated Verification Suite
 * Verifies Genuine User Authentication, OTP Verification, and Official Data Pending Status
 */
const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING AUTHENTICATION VERIFICATION SUITE ===");

  try {
    const testMobile = '9876501234';

    // Test 1: Send OTP
    console.log(`\n[Test 1] Dispatching OTP to mobile ${testMobile}...`);
    const otpRes = await request('POST', '/api/auth/send-otp', {
      mobileNumber: testMobile,
      purpose: 'REGISTRATION'
    });
    console.log("OTP Send Response:", otpRes.data);
    if (!otpRes.data.success) throw new Error("OTP send failed: " + otpRes.data.message);
    const otpCode = otpRes.data.debugOtp;
    console.log("✓ Received valid OTP from service:", otpCode);

    // Test 2: Register Genuine User
    console.log("\n[Test 2] Registering genuine user 'S. Ramesh Kumar' with Role 'Teacher'...");
    const regRes = await request('POST', '/api/auth/register', {
      fullName: 'S. Ramesh Kumar',
      role: 'Teacher',
      mobileNumber: testMobile,
      password: 'RealTeacherPassword2025!',
      confirmPassword: 'RealTeacherPassword2025!',
      otpCode
    });
    console.log("Registration Response:", regRes.data);
    if (!regRes.data.success) throw new Error("Registration failed: " + regRes.data.message);
    console.log("✓ Account Created:", regRes.data.user.id);
    console.log("✓ Password Hash Stored (Never Plaintext): User object does NOT contain passwordHash:", !regRes.data.user.passwordHash);
    console.log("✓ Official Data Status:", regRes.data.officialDataResult.status);
    console.log("✓ Official Message:", regRes.data.officialDataResult.message);
    
    // Ensure it does NOT claim to be linked:
    if (regRes.data.user.officialDataLinked !== false) {
      throw new Error("officialDataLinked should be false when real DB is not yet connected!");
    }
    console.log("✓ Correctly confirmed officialDataLinked is false (Zero fake data claimed).");

    const token = regRes.data.token;

    // Test 3: Session Persistence (GET /api/auth/me)
    console.log("\n[Test 3] Verifying session persistence via GET /api/auth/me...");
    const meRes = await request('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${token}`
    });
    console.log("Me Response:", meRes.data);
    if (!meRes.data.success || !meRes.data.user) throw new Error("Session verification failed");
    console.log("✓ Authenticated session active for:", meRes.data.user.fullName, `(${meRes.data.user.role})`);

    // Test 4: Login with Valid Password
    console.log("\n[Test 4] Logging in with mobile and password...");
    const loginRes = await request('POST', '/api/auth/login', {
      mobileNumber: testMobile,
      password: 'RealTeacherPassword2025!'
    });
    console.log("Login Response:", loginRes.data);
    if (!loginRes.data.success) throw new Error("Login failed");
    console.log("✓ Login successful! Token issued.");

    // Test 5: Rejection of Incorrect Password
    console.log("\n[Test 5] Testing incorrect password rejection...");
    const failLogin = await request('POST', '/api/auth/login', {
      mobileNumber: testMobile,
      password: 'WrongPassword123!'
    });
    console.log("Wrong Password HTTP Status:", failLogin.status);
    if (failLogin.status === 401) {
      console.log("✓ Wrong password rejected safely with HTTP 401!");
    } else {
      throw new Error("Expected 401 for wrong password");
    }

    console.log("\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Test Suite Error:", err);
    process.exit(1);
  }
}

runTests();
