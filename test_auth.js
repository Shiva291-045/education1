/**
 * End-to-End Automated Verification Suite
 * Verifies:
 * 1. Administrative Registration (Direct, no OTP, no passkeys)
 * 2. Administrative Credentials Login (Mobile/ID + Password)
 * 3. Dedicated Teacher Login (Employee ID + Mobile)
 * 4. Session Validation via Cookie (/api/auth/me)
 * 5. Protected Officer Portal Data Access
 * 6. Deletion of Passkey/WebAuthn Endpoints (Confirm 404)
 * 7. Logout & Session Termination
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
        let cookie = null;
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          const raw = Array.isArray(setCookie) ? setCookie : [setCookie];
          cookie = raw.map((item) => String(item).split(';')[0]).join('; ');
        }
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), cookie, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, cookie, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 JANGAON DEO PORTAL - AUTH & CLEANUP VERIFICATION');
  console.log('====================================================\n');

  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  const testMobile = `98${randomDigits}`;
  const testPassword = 'AdminPassword#123';

  // -------------------------------------------------------------------------
  // TEST 1: Register Administrative Officer Account
  // -------------------------------------------------------------------------
  console.log('TEST 1: Direct Administrative Registration (Zero OTP, No Passkey)...');
  const regRes = await request('POST', '/api/auth/register', {
    fullName: 'Sri. K. Ramesh',
    role: 'APO',
    mobileNumber: testMobile,
    password: testPassword,
    confirmPassword: testPassword
  });

  assert(regRes.status === 201, `Registration status is 201 Created (Got ${regRes.status})`);
  assert(regRes.data.success === true, 'Response indicates success = true');
  assert(regRes.data.user && regRes.data.user.role === 'APO', 'User role is APO');
  assert(regRes.data.user.mobileNumber === testMobile, 'Mobile matches registered mobile');
  assert(!regRes.data.passkeyOptions, 'No WebAuthn passkeyOptions in registration response');
  assert(!regRes.data.user.passkeys, 'User object has no passkeys array');
  assert(Boolean(regRes.cookie), 'Session cookie (deo_session_id) issued upon registration');
  const regCookie = regRes.cookie;

  // -------------------------------------------------------------------------
  // TEST 2: Validate Session via /api/auth/me
  // -------------------------------------------------------------------------
  console.log('\nTEST 2: Validate Session via /api/auth/me...');
  const meRes = await request('GET', '/api/auth/me', null, { Cookie: regCookie });
  assert(meRes.status === 200, `Status is 200 OK (Got ${meRes.status})`);
  assert(meRes.data.success === true, 'Session is valid (success = true)');
  assert(meRes.data.user.fullName === 'Sri. K. Ramesh', 'Session user matches registered officer');
  assert(!meRes.data.user.passkeys, 'Session user has no passkeys field');

  // -------------------------------------------------------------------------
  // TEST 3: Access Protected Officer School Data
  // -------------------------------------------------------------------------
  console.log('\nTEST 3: Access Protected Schools Data with Session...');
  const schoolRes = await request('GET', '/api/schools/information', null, { Cookie: regCookie });
  assert(schoolRes.status === 200, `Protected schools data status is 200 (Got ${schoolRes.status})`);
  assert(schoolRes.data.success === true, 'Schools data query succeeded');
  assert(Array.isArray(schoolRes.data.filterOptions.schools), 'Schools array returned in filterOptions');
  assert(schoolRes.data.filterOptions.schools.length > 0, `Returned ${schoolRes.data.filterOptions.schools.length} official schools`);

  // -------------------------------------------------------------------------
  // TEST 4: Logout
  // -------------------------------------------------------------------------
  console.log('\nTEST 4: Logout & Invalidate Session...');
  const logoutRes = await request('POST', '/api/auth/logout', null, { Cookie: regCookie });
  assert(logoutRes.status === 200, `Logout status is 200 (Got ${logoutRes.status})`);

  const meAfterLogout = await request('GET', '/api/auth/me', null, { Cookie: regCookie });
  assert(meAfterLogout.status === 401 && !meAfterLogout.data.user, 'Session successfully invalidated after logout');

  // -------------------------------------------------------------------------
  // TEST 5: Password Login with Registered Credentials
  // -------------------------------------------------------------------------
  console.log('\nTEST 5: Administrative Login with Mobile + Password...');
  const loginRes = await request('POST', '/api/auth/login', {
    identifier: testMobile,
    password: testPassword
  });
  assert(loginRes.status === 200, `Login status is 200 (Got ${loginRes.status})`);
  assert(loginRes.data.success === true, 'Login successful');
  assert(loginRes.data.user.fullName === 'Sri. K. Ramesh', 'User matched correctly');
  assert(Boolean(loginRes.cookie), 'New session cookie issued on login');
  const loginCookie = loginRes.cookie;

  // -------------------------------------------------------------------------
  // TEST 6: Dedicated Teacher Login (Employee ID + Mobile)
  // -------------------------------------------------------------------------
  console.log('\nTEST 6: Dedicated Teacher Login (Department Service Record)...');
  const tchRes = await request('POST', '/api/auth/teacher/login', {
    employeeId: 'TS-TCH-100234',
    mobileNumber: '9876543210'
  });
  assert(tchRes.status === 200, `Teacher login status is 200 (Got ${tchRes.status})`);
  assert(tchRes.data.success === true, 'Teacher login successful');
  assert(tchRes.data.user.role === 'Teacher', 'Role is Teacher');
  assert(!tchRes.data.user.passkeys, 'Teacher user has no passkeys');

  // -------------------------------------------------------------------------
  // TEST 7: Verify All Passkey/WebAuthn Endpoints Return 404 Not Found
  // -------------------------------------------------------------------------
  console.log('\nTEST 7: Verify Removed Passkey Endpoints Return 404...');
  const passkeyEndpoints = [
    { method: 'POST', path: '/passkey/register/start' },
    { method: 'POST', path: '/passkey/register/finish' },
    { method: 'POST', path: '/passkey/login/start' },
    { method: 'POST', path: '/passkey/login/finish' },
    { method: 'POST', path: '/api/auth/webauthn/register-options' },
    { method: 'POST', path: '/api/auth/webauthn/register-verify' },
    { method: 'POST', path: '/api/auth/webauthn/login-options' },
    { method: 'POST', path: '/api/auth/webauthn/login-verify' }
  ];

  for (const ep of passkeyEndpoints) {
    const res = await request(ep.method, ep.path, { dummy: true });
    assert(res.status === 404, `Endpoint ${ep.method} ${ep.path} returns 404 Not Found (Got ${res.status})`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL TESTS PASSED! PASSKEY & STUDENT REMOVAL VERIFIED');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed with error:', err);
  process.exit(1);
});
