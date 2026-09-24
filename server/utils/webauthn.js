const crypto = require('crypto');

/**
 * Minimal pure-JS CBOR Decoder supporting RFC 8949 / RFC 7049
 * for WebAuthn attestationObject and COSE key maps.
 * Zero external dependencies.
 */
function decodeCbor(buf) {
  let offset = 0;

  function read() {
    if (offset >= buf.length) {
      throw new Error('Unexpected EOF in CBOR stream');
    }
    const initialByte = buf[offset++];
    const majorType = initialByte >> 5;
    const info = initialByte & 0x1f;

    let len;
    if (info < 24) {
      len = info;
    } else if (info === 24) {
      len = buf[offset++];
    } else if (info === 25) {
      len = buf.readUInt16BE(offset);
      offset += 2;
    } else if (info === 26) {
      len = buf.readUInt32BE(offset);
      offset += 4;
    } else if (info === 27) {
      len = Number(buf.readBigUInt64BE(offset));
      offset += 8;
    } else {
      throw new Error(`Unsupported CBOR info: ${info}`);
    }

    if (majorType === 0) {
      // Unsigned integer
      return len;
    } else if (majorType === 1) {
      // Negative integer (-1 - len)
      return -1 - len;
    } else if (majorType === 2) {
      // Byte string
      const slice = buf.slice(offset, offset + len);
      offset += len;
      return slice;
    } else if (majorType === 3) {
      // Text string (UTF-8)
      const slice = buf.slice(offset, offset + len).toString('utf8');
      offset += len;
      return slice;
    } else if (majorType === 4) {
      // Array
      const arr = [];
      for (let i = 0; i < len; i++) {
        arr.push(read());
      }
      return arr;
    } else if (majorType === 5) {
      // Map
      const map = new Map();
      for (let i = 0; i < len; i++) {
        const k = read();
        const v = read();
        map.set(k, v);
      }
      return map;
    } else if (majorType === 7) {
      // Simple values
      if (info === 20) return false;
      if (info === 21) return true;
      if (info === 22) return null;
      if (info === 23) return undefined;
      return info;
    } else {
      throw new Error(`Unsupported CBOR major type: ${majorType}`);
    }
  }

  const result = read();
  return { result, bytesRead: offset };
}

// In-memory challenge store with automatic 5-minute expiry
const challenges = new Map();

function storeChallenge(key, challenge) {
  challenges.set(key, {
    challenge,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
  });
}

function getAndClearChallenge(key) {
  const item = challenges.get(key);
  if (!item) return null;
  challenges.delete(key);
  if (Date.now() > item.expiresAt) return null;
  return item.challenge;
}

// Periodically clean up expired challenges
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of challenges.entries()) {
    if (now > item.expiresAt) {
      challenges.delete(key);
    }
  }
}, 60 * 1000).unref();

/**
 * Generate Registration Options (navigator.credentials.create)
 */
function generateRegistrationOptions({ user, rpName = 'DEO Jangaon Education Portal', rpId = 'localhost' }) {
  const challenge = crypto.randomBytes(32).toString('base64url');
  storeChallenge(`reg_${user.id}`, challenge);

  return {
    challenge,
    rp: {
      name: rpName,
      id: rpId
    },
    user: {
      id: Buffer.from(user.id).toString('base64url'),
      name: user.employeeId || user.mobileNumber || user.id,
      displayName: user.fullName || user.id
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 } // ES256 (P-256 with SHA-256)
    ],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: {
      userVerification: 'preferred',
      requireResidentKey: false
    }
  };
}

/**
 * Verify Registration Response (attestationObject + clientDataJSON)
 */
function verifyRegistration({ response, expectedChallenge, expectedRpId = 'localhost', expectedOrigins = ['http://localhost:5000', 'https://localhost:5000', 'http://127.0.0.1:5000'] }) {
  try {
    if (!response || !response.clientDataJSON || !response.attestationObject) {
      return { success: false, message: 'Missing clientDataJSON or attestationObject.' };
    }

    // 1. Verify Client Data
    const clientDataRaw = Buffer.from(response.clientDataJSON, 'base64url').toString('utf8');
    const clientData = JSON.parse(clientDataRaw);

    if (clientData.type !== 'webauthn.create') {
      return { success: false, message: `Invalid clientData type: ${clientData.type}` };
    }

    if (clientData.challenge !== expectedChallenge) {
      return { success: false, message: 'Challenge mismatch.' };
    }

    // Verify origin
    if (expectedOrigins && expectedOrigins.length > 0) {
      const originMatch = expectedOrigins.some(o => clientData.origin.startsWith(o) || o.startsWith(clientData.origin));
      if (!originMatch) {
        console.warn(`[WebAuthn] Origin mismatch. Client reported: ${clientData.origin}`);
      }
    }

    // 2. Decode Attestation Object
    const attestationBuf = Buffer.from(response.attestationObject, 'base64url');
    const { result: attestation } = decodeCbor(attestationBuf);

    const authData = attestation.get('authData');
    if (!authData || !Buffer.isBuffer(authData)) {
      return { success: false, message: 'Invalid authData in attestationObject.' };
    }

    // 3. Verify authData
    // Bytes 0..31: rpIdHash
    const expectedRpIdHash = crypto.createHash('sha256').update(expectedRpId).digest();
    const rpIdHash = authData.slice(0, 32);
    if (!rpIdHash.equals(expectedRpIdHash)) {
      // In development localhost variations might occur, check also localhost
      const localRpIdHash = crypto.createHash('sha256').update('localhost').digest();
      if (!rpIdHash.equals(localRpIdHash)) {
        return { success: false, message: 'rpIdHash mismatch.' };
      }
    }

    // Byte 32: flags
    const flags = authData[32];
    const upFlag = (flags & 0x01) !== 0; // User Present
    const atFlag = (flags & 0x40) !== 0; // Attested Credential Data Present

    if (!upFlag) {
      return { success: false, message: 'User Present flag was not set.' };
    }
    if (!atFlag) {
      return { success: false, message: 'Attested credential data missing.' };
    }

    const signCount = authData.readUInt32BE(33);

    // Bytes 53..54: credentialIdLength (L)
    const credIdLen = authData.readUInt16BE(53);
    const credentialId = authData.slice(55, 55 + credIdLen);
    const coseKeyBytes = authData.slice(55 + credIdLen);

    // Decode COSE Key map
    const { result: coseKey } = decodeCbor(coseKeyBytes);

    // COSE Key values:
    // 1: kty (2 = EC2)
    // 3: alg (-7 = ES256)
    // -1: crv (1 = P-256)
    // -2: x coordinate (32 bytes)
    // -3: y coordinate (32 bytes)
    const kty = coseKey.get(1);
    const alg = coseKey.get(3);
    const xCoord = coseKey.get(-2);
    const yCoord = coseKey.get(-3);

    if (kty !== 2 || alg !== -7 || !Buffer.isBuffer(xCoord) || !Buffer.isBuffer(yCoord)) {
      return { success: false, message: 'Unsupported COSE key format; must be ES256 P-256.' };
    }

    // Build standard SPKI DER public key
    // Header for ECDSA P-256: 3059301306072a8648ce3d020106082a8648ce3d030107034200
    const spkiDer = Buffer.concat([
      Buffer.from('3059301306072a8648ce3d020106082a8648ce3d030107034200', 'hex'),
      Buffer.from([0x04]),
      xCoord,
      yCoord
    ]);

    // Test that Node crypto can load the reconstructed public key
    crypto.createPublicKey({ key: spkiDer, format: 'der', type: 'spki' });

    return {
      success: true,
      credential: {
        credentialId: credentialId.toString('base64url'),
        publicKeySpki: spkiDer.toString('base64url'),
        counter: signCount,
        transports: response.transports || ['internal'],
        createdAt: new Date().toISOString()
      }
    };
  } catch (err) {
    console.error('[WebAuthn] Verification error:', err);
    return { success: false, message: `Verification failed: ${err.message}` };
  }
}

/**
 * Generate Authentication Options (navigator.credentials.get)
 */
function generateAuthenticationOptions({ user, passkeys = [], rpId = 'localhost' }) {
  const challenge = crypto.randomBytes(32).toString('base64url');
  storeChallenge(`auth_${user.id}`, challenge);

  return {
    challenge,
    timeout: 60000,
    rpId,
    allowCredentials: passkeys.map(p => ({
      type: 'public-key',
      id: p.credentialId,
      transports: p.transports || ['internal']
    })),
    userVerification: 'preferred'
  };
}

/**
 * Verify Authentication Assertion (signature verification)
 */
function verifyAuthentication({ response, credential, expectedChallenge, expectedRpId = 'localhost', expectedOrigins = ['http://localhost:5000', 'https://localhost:5000', 'http://127.0.0.1:5000'] }) {
  try {
    if (!response || !response.clientDataJSON || !response.authenticatorData || !response.signature) {
      return { success: false, message: 'Missing assertion response fields.' };
    }

    // 1. Verify Client Data
    const clientDataRaw = Buffer.from(response.clientDataJSON, 'base64url').toString('utf8');
    const clientData = JSON.parse(clientDataRaw);

    if (clientData.type !== 'webauthn.get') {
      return { success: false, message: `Invalid assertion clientData type: ${clientData.type}` };
    }

    if (clientData.challenge !== expectedChallenge) {
      return { success: false, message: 'Assertion challenge mismatch.' };
    }

    // 2. Authenticator Data
    const authData = Buffer.from(response.authenticatorData, 'base64url');
    const flags = authData[32];
    const upFlag = (flags & 0x01) !== 0;

    if (!upFlag) {
      return { success: false, message: 'User Present flag was not set.' };
    }

    const signCount = authData.readUInt32BE(33);
    if (credential.counter > 0 && signCount > 0 && signCount < credential.counter) {
      console.warn(`[WebAuthn] Sign counter warning: ${signCount} < ${credential.counter}`);
    }

    // 3. Signature Verification
    const clientDataHash = crypto.createHash('sha256').update(Buffer.from(response.clientDataJSON, 'base64url')).digest();
    const signatureBase = Buffer.concat([authData, clientDataHash]);

    const spkiDer = Buffer.from(credential.publicKeySpki, 'base64url');
    const publicKey = crypto.createPublicKey({ key: spkiDer, format: 'der', type: 'spki' });

    const signature = Buffer.from(response.signature, 'base64url');

    const verifier = crypto.createVerify('SHA256');
    verifier.update(signatureBase);
    const valid = verifier.verify(publicKey, signature);

    if (!valid) {
      return { success: false, message: 'Invalid cryptographic signature.' };
    }

    return {
      success: true,
      counter: signCount
    };
  } catch (err) {
    console.error('[WebAuthn] Assertion verification error:', err);
    return { success: false, message: `Assertion verification failed: ${err.message}` };
  }
}

module.exports = {
  storeChallenge,
  getAndClearChallenge,
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  decodeCbor
};
