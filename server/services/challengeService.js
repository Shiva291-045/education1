const crypto = require('crypto');
const db = require('../db');
const mongo = require('../mongo');

const REGISTRATION_TYPE = 'WEBAUTHN_REGISTRATION';
const AUTHENTICATION_TYPE = 'WEBAUTHN_AUTHENTICATION';
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const COLLECTION = 'webauthn_challenges';

function toExpiresAtMs(value) {
  if (value == null) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function serializeDoc(doc) {
  const now = Date.now();
  const expiresAtMs = now + CHALLENGE_TTL_MS;
  return {
    userId: String(doc.userId).trim(),
    challenge: doc.challenge,
    registrationType: doc.registrationType,
    createdAt: new Date(now),
    createdAtIso: new Date(now).toISOString(),
    expiresAt: new Date(expiresAtMs),
    expiresAtMs,
    consumed: false,
    consumedAt: null,
    enrollmentToken: doc.enrollmentToken
  };
}

class ChallengeService {
  collection() {
    const mongoDb = mongo.getMongoDb();
    return mongoDb ? mongoDb.collection(COLLECTION) : null;
  }

  usesMongo() {
    return Boolean(this.collection());
  }

  /**
   * Persist a cryptographically secure challenge for 10 minutes.
   * MongoDB is authoritative when connected. Disk is local-dev fallback only.
   */
  async createChallenge(userId, registrationType) {
    const cleanUserId = String(userId).trim();
    const challenge = crypto.randomBytes(32).toString('base64url');
    const enrollmentToken = crypto.randomBytes(32).toString('hex');
    const challengeDoc = serializeDoc({
      userId: cleanUserId,
      challenge,
      registrationType,
      enrollmentToken
    });

    const col = this.collection();
    if (col) {
      try {
        await col.updateMany(
          { userId: cleanUserId, registrationType, consumed: false },
          { $set: { consumed: true, consumedAt: new Date(), superseded: true } }
        );
        await col.insertOne({ ...challengeDoc });
      } catch (err) {
        console.error('[CHALLENGE SERVICE] MongoDB write error:', err.message);
        throw new Error('Failed to persist WebAuthn challenge.');
      }
    } else {
      if (process.env.NODE_ENV === 'production' && mongo.isMongoConfigured()) {
        throw new Error('Failed to persist WebAuthn challenge.');
      }
      try {
        db.saveChallenge({
          ...challengeDoc,
          createdAt: challengeDoc.createdAtIso,
          expiresAt: challengeDoc.expiresAtMs
        });
      } catch (err) {
        console.error('[CHALLENGE SERVICE] Disk write error:', err.message);
        throw new Error('Failed to persist WebAuthn challenge.');
      }
    }

    console.log(`[CHALLENGE SERVICE] Stored ${registrationType} challenge for user ${cleanUserId} via ${col ? 'mongodb' : 'disk'}.`);
    return {
      challenge,
      enrollmentToken,
      expiresAt: challengeDoc.expiresAtMs,
      registrationType,
      userId: cleanUserId
    };
  }

  async createRegistrationChallenge(userId) {
    return this.createChallenge(userId, REGISTRATION_TYPE);
  }

  async createLoginChallenge(userId) {
    return this.createChallenge(userId, AUTHENTICATION_TYPE);
  }

  normalizeFound(doc) {
    if (!doc) return null;
    const expires = doc.expiresAt != null ? doc.expiresAt : doc.expiresAtMs;
    const expiresMs = toExpiresAtMs(expires);
    return {
      ...doc,
      userId: String(doc.userId),
      challenge: doc.challenge,
      registrationType: doc.registrationType,
      consumed: Boolean(doc.consumed),
      expiresAt: expires,
      expiresAtMs: expiresMs,
      enrollmentToken: doc.enrollmentToken
    };
  }

  async findByChallengeValue(challenge) {
    if (!challenge) return null;
    const col = this.collection();
    if (col) {
      try {
        const doc = await col.findOne({ challenge });
        if (doc) return this.normalizeFound(doc);
      } catch (err) {
        console.error('[CHALLENGE SERVICE] MongoDB challenge lookup error:', err.message);
      }
      return null;
    }
    return this.normalizeFound(db.getChallengeByValue(challenge));
  }

  async findStoredChallenge(userId, registrationType) {
    const cleanUserId = String(userId).trim();
    const col = this.collection();
    if (col) {
      try {
        const active = await col.findOne(
          { userId: cleanUserId, registrationType, consumed: false },
          { sort: { createdAt: -1 } }
        );
        if (active) return this.normalizeFound(active);
        const latest = await col.findOne(
          { userId: cleanUserId, registrationType },
          { sort: { createdAt: -1 } }
        );
        return this.normalizeFound(latest);
      } catch (err) {
        console.error('[CHALLENGE SERVICE] MongoDB read error:', err.message);
        return null;
      }
    }
    return this.normalizeFound(db.getChallenge(cleanUserId, registrationType));
  }

  async getByEnrollmentToken(token) {
    if (!token) return null;
    const col = this.collection();
    if (col) {
      try {
        const doc = await col.findOne({ enrollmentToken: token });
        return this.normalizeFound(doc);
      } catch (err) {
        console.error('[CHALLENGE SERVICE] MongoDB token read error:', err.message);
        return null;
      }
    }
    return this.normalizeFound(db.getChallengeByEnrollmentToken(token));
  }

  validateChallengeDoc(doc) {
    if (!doc) {
      return {
        valid: false,
        error: 'CHALLENGE_NOT_FOUND',
        message: 'Challenge not found.'
      };
    }
    if (doc.consumed) {
      return {
        valid: false,
        error: 'CHALLENGE_ALREADY_CONSUMED',
        message: 'Challenge already consumed.'
      };
    }
    const expiryTime = toExpiresAtMs(doc.expiresAt != null ? doc.expiresAt : doc.expiresAtMs);
    if (!expiryTime || Date.now() >= expiryTime) {
      return {
        valid: false,
        error: 'CHALLENGE_EXPIRED',
        message: 'Challenge expired.'
      };
    }
    return {
      valid: true,
      challenge: doc.challenge,
      doc
    };
  }

  /**
   * Retrieve the exact stored challenge. Does not consume or delete it.
   */
  async getValidChallenge(userId, registrationType = REGISTRATION_TYPE) {
    const doc = await this.findStoredChallenge(userId, registrationType);
    return this.validateChallengeDoc(doc);
  }

  async getValidLoginChallenge(userId) {
    return this.getValidChallenge(userId, AUTHENTICATION_TYPE);
  }

  async consumeChallenge(userId, challenge, registrationType = REGISTRATION_TYPE) {
    const cleanUserId = String(userId).trim();
    const consumedAt = new Date();
    const col = this.collection();
    if (col) {
      try {
        await col.updateOne(
          { userId: cleanUserId, challenge, registrationType, consumed: false },
          { $set: { consumed: true, consumedAt } }
        );
      } catch (err) {
        console.error('[CHALLENGE SERVICE] MongoDB consume error:', err.message);
        throw err;
      }
      return true;
    }
    db.consumeChallenge(cleanUserId, challenge, registrationType);
    return true;
  }

  async consumeLoginChallenge(userId, challenge) {
    return this.consumeChallenge(userId, challenge, AUTHENTICATION_TYPE);
  }
}

module.exports = new ChallengeService();
module.exports.REGISTRATION_TYPE = REGISTRATION_TYPE;
module.exports.AUTHENTICATION_TYPE = AUTHENTICATION_TYPE;
module.exports.CHALLENGE_TTL_MS = CHALLENGE_TTL_MS;
