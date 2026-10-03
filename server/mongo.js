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

    // 5. Mobile Import Collection (education.mobile_import)
    try {
      const mobileImport = mongoDb.collection('mobile_import');
      await mobileImport.createIndex({ 'TREASURY CODE': 1 });
      await mobileImport.createIndex({ 'treasuryCode': 1 });
      await loadMobileImportCache();
    } catch (e) {
      console.warn('[MongoDB] mobile_import index setup note:', e.message);
    }

    console.log(`[MongoDB] Connected successfully to Atlas cluster (${mongoDb.databaseName}).`);
    console.log(`[MongoDB] Collections verified: users, sessions, webauthn_challenges, teacher_service_records, mobile_import.`);
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
    const { _id, ...cleanDoc } = userDoc;
    await col.updateOne({ id: userDoc.id }, { $set: cleanDoc }, { upsert: true });
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

    // 3. Seed mobile_import collection if empty
    await seedMobileImportIfEmpty();
  } catch (err) {
    console.error('[MongoDB] Seed warning:', err.message);
  }
}

// -------------------------------------------------------------
// MongoDB Atlas education.mobile_import Helpers
// -------------------------------------------------------------

let mobileImportCache = null;

function cleanMobileVal(raw) {
  if (raw === undefined || raw === null) return null;
  let str = String(raw).trim();
  if (!str || str === '-' || str === '—') return null;
  if (str.endsWith('.0')) {
    str = str.slice(0, -2);
  }
  return str;
}

function extractMobileVal(doc) {
  if (!doc) return null;
  const raw = doc['MOBILE_NO'] !== undefined ? doc['MOBILE_NO']
    : (doc['MOBILE NO.'] !== undefined ? doc['MOBILE NO.']
    : (doc['MOBILE NO'] !== undefined ? doc['MOBILE NO']
    : (doc['MOBILE_NO.'] !== undefined ? doc['MOBILE_NO.']
    : (doc['mobile_no'] !== undefined ? doc['mobile_no']
    : (doc['mobileNumber'] !== undefined ? doc['mobileNumber']
    : (doc['mobile'] !== undefined ? doc['mobile'] : null))))));
  return cleanMobileVal(raw);
}

function extractTreasuryCodeVal(doc) {
  if (!doc) return null;
  const raw = doc['TREASURY CODE'] !== undefined ? doc['TREASURY CODE']
    : (doc[' TREASURY CODE'] !== undefined ? doc[' TREASURY CODE']
    : (doc['TREASURY_CODE'] !== undefined ? doc['TREASURY_CODE']
    : (doc['treasuryCode'] !== undefined ? doc['treasuryCode']
    : (doc['employeeId'] !== undefined ? doc['employeeId'] : null))));
  if (raw === undefined || raw === null) return null;
  return String(raw).trim();
}

async function loadMobileImportCache() {
  if (!mongoDb) return null;
  try {
    const col = mongoDb.collection('mobile_import');
    const count = await col.countDocuments();
    if (count === 0) {
      return null;
    }
    const docs = await col.find({}).toArray();
    const cache = new Map();
    for (const doc of docs) {
      const code = extractTreasuryCodeVal(doc);
      const mobile = extractMobileVal(doc);
      if (code && mobile && !mobile.includes('*') && !mobile.includes('X')) {
        cache.set(code, mobile);
      }
    }
    mobileImportCache = cache;
    console.log(`[MongoDB] Loaded ${cache.size} phone numbers from education.mobile_import into memory cache.`);
    return mobileImportCache;
  } catch (err) {
    console.warn('[MongoDB] Warning loading mobile_import cache:', err.message);
    return null;
  }
}

async function seedMobileImportIfEmpty() {
  if (!mongoDb) return;
  try {
    const mobileCol = mongoDb.collection('mobile_import');
    const mobileCount = await mobileCol.countDocuments();
    if (mobileCount === 0) {
      const path = require('path');
      const fs = require('fs');
      const excelPath = path.join(__dirname, '..', 'TEST MANDAL WISE T DATA (1).xlsx');
      if (fs.existsSync(excelPath)) {
        const xlsx = require('xlsx');
        const wb = xlsx.readFile(excelPath);
        const map = new Map();
        for (const name of wb.SheetNames) {
          const rows = xlsx.utils.sheet_to_json(wb.Sheets[name]);
          rows.forEach(r => {
            const code = extractTreasuryCodeVal(r);
            const mobile = extractMobileVal(r);
            if (code && mobile && !mobile.includes('*') && !mobile.includes('X')) {
              map.set(code, {
                'TREASURY CODE': isNaN(Number(code)) ? code : Number(code),
                'MOBILE_NO': isNaN(Number(mobile)) ? mobile : Number(mobile),
                'TEACHER_NAME': r[" TEACHER'S NAME"] || r.TEACHERS_NAME || '',
                'MANDAL': r[' MANDAL'] || r.MANDAL || ''
              });
            }
          });
        }
        if (map.size > 0) {
          console.log(`[MongoDB] Initializing Atlas mobile_import with ${map.size} teacher mobile records...`);
          await mobileCol.insertMany([...map.values()]);
          console.log('[MongoDB] ✓ mobile_import collection seeded successfully into Atlas.');
          await loadMobileImportCache();
        }
      }
    }
  } catch (e) {
    console.warn('[MongoDB] Mobile import seed warning:', e.message);
  }
}

/**
 * Fetch authentic mobile number from education.mobile_import collection in MongoDB Atlas.
 * Matches treasuryCode with TREASURY CODE handling both String and Number conversion robustly.
 */
async function getMobileFromImport(treasuryCode) {
  if (!treasuryCode) return null;
  const strCode = String(treasuryCode).trim();

  // 1. In-memory cache check
  if (mobileImportCache && mobileImportCache.has(strCode)) {
    return mobileImportCache.get(strCode);
  }

  // 2. Direct MongoDB collection query
  if (mongoDb) {
    try {
      const col = mongoDb.collection('mobile_import');
      const numCode = Number(strCode);
      const orConditions = [
        { 'TREASURY CODE': strCode },
        { 'TREASURY CODE': ` ${strCode}` },
        { ' TREASURY CODE': strCode },
        { 'TREASURY_CODE': strCode },
        { 'treasuryCode': strCode }
      ];
      if (!isNaN(numCode)) {
        orConditions.push({ 'TREASURY CODE': numCode });
        orConditions.push({ ' TREASURY CODE': numCode });
        orConditions.push({ 'TREASURY_CODE': numCode });
        orConditions.push({ 'treasuryCode': numCode });
      }

      const doc = await col.findOne({ $or: orConditions });
      if (doc) {
        const mobile = extractMobileVal(doc);
        if (mobile && !mobile.includes('*') && !mobile.includes('X')) {
          if (!mobileImportCache) mobileImportCache = new Map();
          mobileImportCache.set(strCode, mobile);
          return mobile;
        }
      }
    } catch (err) {
      console.warn('[MongoDB] Error querying mobile_import collection:', err.message);
    }
  }

  return null;
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
  loadFromMongo,
  getMobileFromImport,
  loadMobileImportCache
};
