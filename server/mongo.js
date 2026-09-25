const dns = require('dns');
try {
  // Ensure reliable DNS resolution for MongoDB Atlas SRV records on Windows
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch (e) {}

const { loadEnv } = require('./loadEnv');
loadEnv();

let client = null;
let mongoDb = null;
let connecting = null;

function getMongoUri() {
  return (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
}

function isMongoConfigured() {
  return Boolean(getMongoUri());
}

function isMongoConnected() {
  return Boolean(mongoDb);
}

function getMongoDb() {
  return mongoDb;
}

function getCollection(name) {
  return mongoDb ? mongoDb.collection(name) : null;
}

async function connectMongo() {
  if (mongoDb) return mongoDb;
  if (connecting) return connecting;

  const uri = getMongoUri();
  if (!uri) {
    console.log('[MongoDB] MONGODB_URI is not set. WebAuthn challenges and portal data will use local persistence until MongoDB Atlas is configured in .env.');
    return null;
  }

  connecting = (async () => {
    const { MongoClient } = require('mongodb');
    const mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    await mongoClient.connect();
    const dbName = process.env.MONGODB_DB_NAME || 'education';
    mongoDb = mongoClient.db(dbName);
    client = mongoClient;

    // 1. WebAuthn Challenges Collection
    const challenges = mongoDb.collection('webauthn_challenges');
    await challenges.createIndex({ userId: 1, registrationType: 1, consumed: 1, createdAt: -1 });
    await challenges.createIndex({ enrollmentToken: 1 }, { unique: true, sparse: true });
    await challenges.createIndex({ challenge: 1 }, { unique: true });
    await challenges.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // 2. Users Collection
    const users = mongoDb.collection('users');
    await users.createIndex({ id: 1 }, { unique: true });
    await users.createIndex({ mobileNumber: 1 });
    await users.createIndex({ employeeId: 1 }, { sparse: true });

    // 3. Sessions Collection
    const sessions = mongoDb.collection('sessions');
    await sessions.createIndex({ sessionId: 1 }, { unique: true });
    await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // 4. Teacher Service Records Collection
    const teacherRecords = mongoDb.collection('teacher_service_records');
    await teacherRecords.createIndex({ treasuryCode: 1 }, { unique: true, sparse: true });
    await teacherRecords.createIndex({ employeeId: 1 }, { sparse: true });

    console.log(`[MongoDB] Connected successfully to Atlas cluster (${mongoDb.databaseName}).`);
    console.log(`[MongoDB] Collections verified: users, sessions, webauthn_challenges, teacher_service_records.`);
    return mongoDb;
  })();

  try {
    return await connecting;
  } catch (err) {
    connecting = null;
    mongoDb = null;
    client = null;
    console.error('[MongoDB] Connection failed:', err.message);
    throw err;
  }
}

async function closeMongo() {
  connecting = null;
  mongoDb = null;
  if (client) {
    try {
      await client.close();
    } catch (err) {
      console.warn('[MongoDB] Close warning:', err.message);
    }
    client = null;
  }
}

// -------------------------------------------------------------
// MongoDB Atlas Persistence Helpers for Database Layer
// -------------------------------------------------------------

async function syncUserToMongo(userDoc) {
  if (!mongoDb || !userDoc || !userDoc.id) return;
  try {
    const col = mongoDb.collection('users');
    await col.updateOne({ id: userDoc.id }, { $set: userDoc }, { upsert: true });
  } catch (err) {
    console.error('[MongoDB] Error saving user to Atlas:', err.message);
  }
}

async function removeUserFromMongo(userId) {
  if (!mongoDb || !userId) return;
  try {
    const col = mongoDb.collection('users');
    await col.deleteOne({ id: userId });
  } catch (err) {
    console.error('[MongoDB] Error deleting user from Atlas:', err.message);
  }
}

async function syncSessionToMongo(sessionDoc) {
  if (!mongoDb || !sessionDoc || !sessionDoc.sessionId) return;
  try {
    const col = mongoDb.collection('sessions');
    await col.updateOne({ sessionId: sessionDoc.sessionId }, { $set: sessionDoc }, { upsert: true });
  } catch (err) {
    console.error('[MongoDB] Error saving session to Atlas:', err.message);
  }
}

async function removeSessionFromMongo(sessionId) {
  if (!mongoDb || !sessionId) return;
  try {
    const col = mongoDb.collection('sessions');
    await col.deleteOne({ sessionId });
  } catch (err) {
    console.error('[MongoDB] Error deleting session from Atlas:', err.message);
  }
}

async function syncTeacherRecordToMongo(recordDoc) {
  if (!mongoDb || !recordDoc || !recordDoc.treasuryCode) return;
  try {
    const col = mongoDb.collection('teacher_service_records');
    await col.updateOne({ treasuryCode: recordDoc.treasuryCode }, { $set: recordDoc }, { upsert: true });
  } catch (err) {
    console.error('[MongoDB] Error saving teacher record to Atlas:', err.message);
  }
}

async function getTeacherRecordFromMongo(treasuryCode) {
  if (!mongoDb || !treasuryCode) return null;
  try {
    const col = mongoDb.collection('teacher_service_records');
    return await col.findOne({ treasuryCode: String(treasuryCode) });
  } catch (err) {
    console.error('[MongoDB] Error fetching teacher record from Atlas:', err.message);
    return null;
  }
}

async function initialSeedIfEmpty(initialData) {
  if (!mongoDb) return;
  try {
    const usersCol = mongoDb.collection('users');
    const userCount = await usersCol.countDocuments();
    if (userCount === 0 && initialData && Array.isArray(initialData.users) && initialData.users.length > 0) {
      console.log(`[MongoDB] Initializing Atlas with ${initialData.users.length} existing users from local store...`);
      await usersCol.insertMany(initialData.users);
      console.log('[MongoDB] ✓ Users seeded successfully into MongoDB Atlas.');
    }

    const recCol = mongoDb.collection('teacher_service_records');
    const recCount = await recCol.countDocuments();
    if (recCount === 0) {
      const teacherService = require('./services/teacherService');
      const sample1 = teacherService.SAMPLE_RECORD_2126324;
      const sample2 = teacherService.SAMPLE_RECORD_100234;
      const samples = [sample1, sample2].filter(Boolean);
      if (samples.length > 0) {
        console.log(`[MongoDB] Initializing Atlas with ${samples.length} official Teacher Service Records...`);
        await recCol.insertMany(samples);
        console.log('[MongoDB] ✓ Teacher Service Records seeded successfully into MongoDB Atlas.');
      }
    }
  } catch (err) {
    console.error('[MongoDB] Seed warning:', err.message);
  }
}

async function loadFromMongo() {
  if (!mongoDb) return null;
  try {
    const usersCol = mongoDb.collection('users');
    const sessionsCol = mongoDb.collection('sessions');
    const users = await usersCol.find({}).toArray();
    const sessions = await sessionsCol.find({ expiresAt: { $gt: Date.now() } }).toArray();
    return { users, sessions };
  } catch (err) {
    console.error('[MongoDB] Error loading state from Atlas:', err.message);
    return null;
  }
}

module.exports = {
  getMongoUri,
  isMongoConfigured,
  isMongoConnected,
  getMongoDb,
  getCollection,
  connectMongo,
  closeMongo,
  syncUserToMongo,
  removeUserFromMongo,
  syncSessionToMongo,
  removeSessionFromMongo,
  syncTeacherRecordToMongo,
  getTeacherRecordFromMongo,
  initialSeedIfEmpty,
  loadFromMongo
};
