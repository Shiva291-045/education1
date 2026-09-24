/**
 * End-to-End Automated Verification Suite
 * Verifies OTP-free Registration, Real WebAuthn Passkey creation & assertion,
 * Dedicated Teacher Employee ID login, Password fallback, and Session management.
 */
const http = require('http');
const crypto = require('crypto');

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
        let cookie = null;
        if (res.headers['set-cookie']) {
          const raw = res.headers['set-cookie'];
          cookie = Array.isArray(raw) ? raw[0].split(';')[0] : raw.split(';')[0];
        }
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), cookie });
        } catch {
          resolve({ status: res.statusCode, data, cookie });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Minimal CBOR encoder for creating a genuine WebAuthn test attestation
function encodeCbor(val) {
  if (typeof val === 'string') {
    const buf = Buffer.from(val, 'utf8');
    if (buf.length < 24) return Buffer.concat([Buffer.from([0x60 | buf.length]), buf]);
    return Buffer.concat([Buffer.from([0x78, buf.length]), buf]);
  }
  if (Buffer.isBuffer(val)) {
    if (val.length < 24) return Buffer.concat([Buffer.from([0x40 | val.length]), val]);
    if (val.length < 256) return Buffer.concat([Buffer.from([0x58, val.length]), val]);
    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16BE(val.length, 0);
    return Buffer.concat([Buffer.from([0x59]), lenBuf, val]);
  }
  if (typeof val === 'number') {
    if (val >= 0) {
      if (val < 24) return Buffer.from([val]);
      return Buffer.from([0x18, val]);
    } else {
      const n = -1 - val;
      if (n < 24) return Buffer.from([0x20 | n]);
      return Buffer.from([0x38, n]);
    }
  }
  if (val instanceof Map || (typeof val === 'object' && val !== null && !Array.isArray(val))) {
    const entries = (val instanceof Map) ? Array.from(val.entries()) : Object.entries(val);
    const head = entries.length < 24 ? Buffer.from([0xa0 | entries.length]) : Buffer.from([0xb8, entries.length]);
    const parts = [head];
    for (const [k, v] of entries) {
      parts.push(encodeCbor(k));
      parts.push(encodeCbor(v));
    }
    return Buffer.concat(parts);
  }
  throw new Error("Unsupported type for test CBOR: " + typeof val);
}

async function runTests() {
  console.log("=== STARTING PASSKEY & AUTHENTICATION VERIFICATION SUITE ===");

  try {
    const testAdminMobile = '98' + Math.floor(10000000 + Math.random() * 90000000);

    // -------------------------------------------------------------
    // Test 1: Direct Registration without OTP
    // -------------------------------------------------------------
    console.log(`\n[Test 1] Testing direct registration (NO OTP) for Administrative role 'APO'...`);
    const regRes = await request('POST', '/api/auth/register', {
      fullName: 'B. Srinivas Rao',
      role: 'APO',
      mobileNumber: testAdminMobile,
      password: 'OfficialPassword2025!',
      confirmPassword: 'OfficialPassword2025!'
    });

    if (!regRes.data.success) {
      throw new Error("Registration failed: " + JSON.stringify(regRes.data));
    }
    console.log("✓ Account created without OTP! User ID:", regRes.data.user.id);
    console.log("✓ WebAuthn Passkey options received from server. Challenge length:", regRes.data.passkeyOptions.challenge.length);
    console.log("✓ RP configuration:", regRes.data.passkeyOptions.rp);

    const createdUserId = regRes.data.user.id;
    const regChallenge = regRes.data.passkeyOptions.challenge;

    // -------------------------------------------------------------
    // Test 2: Role restrictions (Reject Teacher in public registration)
    // -------------------------------------------------------------
    console.log("\n[Test 2] Testing rejection of 'Teacher' in public registration form...");
    const teacherRejectRes = await request('POST', '/api/auth/register', {
      fullName: 'Teacher Should Not Register Here',
      role: 'Teacher',
      mobileNumber: '99' + Math.floor(10000000 + Math.random() * 90000000),
      password: 'SomePassword2025!',
      confirmPassword: 'SomePassword2025!'
    });

    if (teacherRejectRes.status === 400 && !teacherRejectRes.data.success) {
      console.log("✓ 'Teacher' correctly rejected in public registration with HTTP 400:", teacherRejectRes.data.message);
    } else {
      throw new Error("Expected 'Teacher' to be rejected in public registration form!");
    }

    // -------------------------------------------------------------
    // Test 3: Real WebAuthn Passkey Registration Verification
    // -------------------------------------------------------------
    console.log("\n[Test 3] Performing real WebAuthn Passkey registration verification...");
    // Generate real P-256 key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const jwk = publicKey.export({ format: 'jwk' });
    const xCoord = Buffer.from(jwk.x, 'base64url');
    const yCoord = Buffer.from(jwk.y, 'base64url');

    // Build COSE key map: { 1: 2 (EC2), 3: -7 (ES256), -1: 1 (P-256), -2: x, -3: y }
    const coseKeyMap = new Map();
    coseKeyMap.set(1, 2);
    coseKeyMap.set(3, -7);
    coseKeyMap.set(-1, 1);
    coseKeyMap.set(-2, xCoord);
    coseKeyMap.set(-3, yCoord);
    const coseKeyBytes = encodeCbor(coseKeyMap);

    // Build authenticator data
    const rpIdHash = crypto.createHash('sha256').update('localhost').digest();
    const flags = Buffer.from([0x45]); // UP (0x01) + UV (0x04) + AT (0x40) = 0x45
    const signCount = Buffer.alloc(4);
    signCount.writeUInt32BE(1, 0);
    const aaguid = Buffer.alloc(16, 0);
    const credentialId = crypto.randomBytes(32);
    const credIdLen = Buffer.alloc(2);
    credIdLen.writeUInt16BE(credentialId.length, 0);

    const authData = Buffer.concat([
      rpIdHash,
      flags,
      signCount,
      aaguid,
      credIdLen,
      credentialId,
      coseKeyBytes
    ]);

    // Build attestationObject CBOR: { fmt: "none", attStmt: {}, authData: authData }
    const attestationMap = new Map();
    attestationMap.set('fmt', 'none');
    attestationMap.set('attStmt', new Map());
    attestationMap.set('authData', authData);
    const attestationObject = encodeCbor(attestationMap);

    // Build clientDataJSON
    const clientDataJSON = JSON.stringify({
      type: 'webauthn.create',
      challenge: regChallenge,
      origin: 'http://localhost:5000'
    });

    const verifyPasskeyRes = await request('POST', '/api/auth/webauthn/register-verify', {
      userId: createdUserId,
      response: {
        id: credentialId.toString('base64url'),
        rawId: credentialId.toString('base64url'),
        clientDataJSON: Buffer.from(clientDataJSON).toString('base64url'),
        attestationObject: attestationObject.toString('base64url'),
        transports: ['internal']
      }
    });

    if (!verifyPasskeyRes.data.success) {
      throw new Error("Passkey registration verification failed: " + JSON.stringify(verifyPasskeyRes.data));
    }
    console.log("✓ WebAuthn Passkey cryptographically verified and registered!");
    console.log("✓ Session established:", verifyPasskeyRes.data.sessionId);
    console.log("✓ Cookie received:", verifyPasskeyRes.cookie);

    let sessionCookie = verifyPasskeyRes.cookie;

    // -------------------------------------------------------------
    // Test 4: WebAuthn Passkey Login Verification
    // -------------------------------------------------------------
    console.log("\n[Test 4] Performing WebAuthn Passkey Login (navigator.credentials.get)...");
    const loginOptRes = await request('POST', '/api/auth/webauthn/login-options', {
      identifier: testAdminMobile
    });
    if (!loginOptRes.data.success) {
      throw new Error("Failed to get passkey login options: " + JSON.stringify(loginOptRes.data));
    }
    console.log("✓ Retrieved Passkey Login options. Challenge:", loginOptRes.data.options.challenge);
    const loginChallenge = loginOptRes.data.options.challenge;

    // Client signs the authenticatorData + hash(clientDataJSON)
    const loginClientDataJSON = JSON.stringify({
      type: 'webauthn.get',
      challenge: loginChallenge,
      origin: 'http://localhost:5000'
    });
    const clientDataHash = crypto.createHash('sha256').update(Buffer.from(loginClientDataJSON)).digest();

    const loginAuthData = Buffer.concat([
      rpIdHash,
      Buffer.from([0x05]), // UP + UV
      Buffer.from([0, 0, 0, 2]) // signCount: 2
    ]);

    const signatureBase = Buffer.concat([loginAuthData, clientDataHash]);
    const signer = crypto.createSign('SHA256');
    signer.update(signatureBase);
    const signature = signer.sign(privateKey);

    const loginVerifyRes = await request('POST', '/api/auth/webauthn/login-verify', {
      identifier: testAdminMobile,
      userId: createdUserId,
      response: {
        id: credentialId.toString('base64url'),
        clientDataJSON: Buffer.from(loginClientDataJSON).toString('base64url'),
        authenticatorData: loginAuthData.toString('base64url'),
        signature: signature.toString('base64url')
      }
    });

    if (!loginVerifyRes.data.success) {
      throw new Error("Passkey login verification failed: " + JSON.stringify(loginVerifyRes.data));
    }
    console.log("✓ WebAuthn Passkey signature verified! Login successful for:", loginVerifyRes.data.user.fullName);
    sessionCookie = loginVerifyRes.cookie;

    // -------------------------------------------------------------
    // Test 5: Dedicated Teacher Login (Employee ID + Mobile Number)
    // -------------------------------------------------------------
    console.log("\n[Test 5] Testing dedicated Teacher Login using Employee ID + Registered Mobile Number...");
    const teacherLoginRes = await request('POST', '/api/auth/teacher/login', {
      employeeId: 'TS-TCH-100234',
      mobileNumber: '9876543210'
    });

    if (!teacherLoginRes.data.success) {
      throw new Error("Teacher login failed: " + JSON.stringify(teacherLoginRes.data));
    }
    console.log("✓ Teacher authenticated successfully:", teacherLoginRes.data.user.fullName);
    console.log("✓ Verified Role:", teacherLoginRes.data.user.role);
    console.log("✓ Designation:", teacherLoginRes.data.user.designation);
    console.log("✓ School:", teacherLoginRes.data.user.schoolName);

    // Test rejection with mismatched mobile number
    console.log("\n[Test 5b] Testing rejection of Teacher Login with mismatched phone number...");
    const wrongMobRes = await request('POST', '/api/auth/teacher/login', {
      employeeId: 'TS-TCH-100234',
      mobileNumber: '9123456780'
    });
    if (wrongMobRes.status === 401 && !wrongMobRes.data.success) {
      console.log("✓ Mismatched mobile number correctly rejected with HTTP 401:", wrongMobRes.data.message);
    } else {
      throw new Error("Expected HTTP 401 rejection for mismatched teacher mobile!");
    }

    // -------------------------------------------------------------
    // Test 6: Fallback Password Login
    // -------------------------------------------------------------
    console.log("\n[Test 6] Testing Fallback Password Login for Administrative User...");
    const pwdLoginRes = await request('POST', '/api/auth/login', {
      identifier: testAdminMobile,
      password: 'OfficialPassword2025!'
    });
    if (!pwdLoginRes.data.success) {
      throw new Error("Password fallback login failed: " + JSON.stringify(pwdLoginRes.data));
    }
    console.log("✓ Password fallback login successful for:", pwdLoginRes.data.user.fullName);

    // Wrong password test
    const wrongPwdRes = await request('POST', '/api/auth/login', {
      identifier: testAdminMobile,
      password: 'WrongPassword123!'
    });
    if (wrongPwdRes.status === 401) {
      console.log("✓ Incorrect password rejected safely with HTTP 401.");
    } else {
      throw new Error("Expected HTTP 401 for incorrect password!");
    }

    // -------------------------------------------------------------
    // Test 7: Session Persistence (GET /api/auth/me) & Logout
    // -------------------------------------------------------------
    console.log("\n[Test 7] Verifying Session persistence via Cookie and Session Invalidation...");
    const meRes = await request('GET', '/api/auth/me', null, {
      'Cookie': sessionCookie
    });
    if (!meRes.data.success || !meRes.data.user) {
      throw new Error("Session verification via cookie failed!");
    }
    console.log("✓ Session cookie verified active for:", meRes.data.user.fullName, `(${meRes.data.user.role})`);

    const logoutRes = await request('POST', '/api/auth/logout', null, {
      'Cookie': sessionCookie
    });
    if (!logoutRes.data.success) {
      throw new Error("Logout failed!");
    }
    console.log("✓ Logged out successfully.");

    const meAfterLogout = await request('GET', '/api/auth/me', null, {
      'Cookie': sessionCookie
    });
    if (meAfterLogout.status === 401) {
      console.log("✓ Server-side session correctly invalidated (HTTP 401 after logout).");
    } else {
      throw new Error("Expected session to be invalidated after logout!");
    }

    console.log("\n🎉 ALL PASSKEY & AUTHENTICATION VERIFICATION TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Test Suite Error:", err);
    process.exit(1);
  }
}

runTests();
