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

async function connectMongo() {
  if (mongoDb) return mongoDb;
  if (connecting) return connecting;

  const uri = getMongoUri();
  if (!uri) {
    console.log('[MongoDB] MONGODB_URI is not set. WebAuthn challenges will use on-disk persistence until MongoDB is configured.');
    return null;
  }

  connecting = (async () => {
    const { MongoClient } = require('mongodb');
    const mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    await mongoClient.connect();
    const dbName = process.env.MONGODB_DB_NAME || undefined;
    mongoDb = dbName ? mongoClient.db(dbName) : mongoClient.db();
    client = mongoClient;

    const challenges = mongoDb.collection('webauthn_challenges');
    await challenges.createIndex({ userId: 1, registrationType: 1, consumed: 1, createdAt: -1 });
    await challenges.createIndex({ enrollmentToken: 1 }, { unique: true, sparse: true });
    await challenges.createIndex({ challenge: 1 }, { unique: true });
    await challenges.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    console.log(`[MongoDB] Connected (${mongoDb.databaseName}). WebAuthn challenges persist in collection webauthn_challenges.`);
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

module.exports = {
  getMongoUri,
  isMongoConfigured,
  isMongoConnected,
  getMongoDb,
  connectMongo,
  closeMongo
};
