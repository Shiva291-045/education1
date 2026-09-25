const { MongoClient } = require('mongodb');
const { loadEnv } = require('./loadEnv');

loadEnv();

async function testConnection() {
  const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
  const dbName = process.env.MONGODB_DB_NAME || 'education';

  console.log('====================================================');
  console.log('MongoDB Atlas Connection Diagnostic Tool');
  console.log('====================================================');

  if (!uri) {
    console.error('\n❌ Error: MONGODB_URI is not set in your .env file.');
    console.log('\nPlease add your MongoDB Atlas connection string to .env:');
    console.log('  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/education?retryWrites=true&w=majority');
    console.log('  MONGODB_DB_NAME=education\n');
    console.log('Steps to obtain it from MongoDB Atlas:');
    console.log('  1. Log into https://cloud.mongodb.com');
    console.log('  2. Click "Database" in the left sidebar.');
    console.log('  3. Click the "Connect" button next to your cluster.');
    console.log('  4. Choose "Drivers" (Node.js).');
    console.log('  5. Copy the connection string and replace <password> with your database user password.');
    console.log('  6. In "Network Access", ensure your IP is whitelisted (or 0.0.0.0/0 for anywhere).\n');
    process.exit(1);
  }

  // Mask password for display
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:********@');
  console.log(`\nConnecting to: ${maskedUri}`);
  console.log(`Target Database: ${dbName}`);
  console.log('Waiting for response from MongoDB Atlas (timeout 10s)...');

  const start = Date.now();
  let client;

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    await client.connect();
    const db = client.db(dbName);
    const pingResult = await db.command({ ping: 1 });
    const latency = Date.now() - start;

    console.log(`\n✅ Connected successfully in ${latency}ms!`);
    console.log(`Database ping:`, pingResult);

    const collections = await db.listCollections().toArray();
    console.log(`Existing collections in "${dbName}":`, collections.map(c => c.name));

    await client.close();
    console.log('\n🎉 MongoDB Atlas is properly linked and ready for the education portal!');
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Failed to connect to MongoDB Atlas (${Date.now() - start}ms):`);
    console.error(`Error message: ${err.message}`);

    console.log('\nTroubleshooting guide:');
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.log('👉 Authentication failed: Verify your database username and password in Atlas ("Database Access").');
      console.log('   Note: If your password contains special characters like @, #, $, or %, they must be URL-encoded.');
    } else if (err.message.includes('Server selection timed out') || err.message.includes('ETIMEDOUT') || err.message.includes('ENOTFOUND')) {
      console.log('👉 Network timeout / IP block:');
      console.log('   1. In MongoDB Atlas, go to "Network Access" in the left menu.');
      console.log('   2. Click "Add IP Address".');
      console.log('   3. Choose "Allow Access from Anywhere" (0.0.0.0/0) or add your current IP address.');
      console.log('   4. Wait 1-2 minutes for Atlas to deploy the network rule, then re-test.');
    } else {
      console.log('👉 Check that your cluster is running and your connection string is formatted properly.');
    }

    if (client) {
      try { await client.close(); } catch (e) {}
    }
    process.exit(1);
  }
}

testConnection();
