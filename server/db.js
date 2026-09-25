const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'education_db.json');

// Initial clean database state: ONLY genuine authentication data and session store
const defaultState = {
  users: [],
  sessions: [],
  webauthnChallenges: [],
  notifications: [
    {
      id: "NOTIF-1",
      date: "15 Sep 2025",
      category: "Examinations",
      title: "SSC Public Examinations – Time Table Released",
      tagColor: "blue",
      isNew: true,
      fileUrl: "#"
    },
    {
      id: "NOTIF-2",
      date: "12 Sep 2025",
      category: "Teachers",
      title: "Teacher Transfers – Guidelines and Format",
      tagColor: "amber",
      isNew: true,
      fileUrl: "#"
    },
    {
      id: "NOTIF-3",
      date: "08 Sep 2025",
      category: "Schools",
      title: "School Infrastructure Grants – Utilization Certificates",
      tagColor: "blue",
      isNew: true,
      fileUrl: "#"
    },
    {
      id: "NOTIF-4",
      date: "01 Sep 2025",
      category: "General",
      title: "Revised Academic Calendar for 2025-26",
      tagColor: "cyan",
      isNew: true,
      fileUrl: "#"
    }
  ],
  statistics: {
    schools: "1,248",
    teachers: "3,842",
    students: "1,45,620",
    mandals: "29",
    passPercentage: "94.2%",
    governmentSchools: "385",
    studentsPerTeacher: "378",
    schoolsWithDigitalFacilities: "72%"
  }
};

class Database {
  constructor() {
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
      } else {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        // Ensure no fake official records exist
        if (parsed.official_records) {
          delete parsed.official_records;
        }
        if (!parsed.users) parsed.users = [];
        if (!parsed.sessions) parsed.sessions = [];
        if (!parsed.webauthnChallenges) parsed.webauthnChallenges = [];
        // Remove otps array if present (OTP workflow completely removed)
        if (parsed.otps) delete parsed.otps;

        // Ensure every user has passkeys array
        parsed.users.forEach(u => {
          if (!u.passkeys) u.passkeys = [];
        });

        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
    }
  }

  read() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.init();
      }
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (!data.sessions) data.sessions = [];
      if (!data.users) data.users = [];
      if (!data.webauthnChallenges) data.webauthnChallenges = [];
      return data;
    } catch (err) {
      console.error('Database read error:', err);
      return defaultState;
    }
  }

  write(data) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_FILE);
      return true;
    } catch (err) {
      console.error('Database write error:', err);
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    }
  }

  // ==========================================
  // USER AUTHENTICATION PERSISTENCE
  // ==========================================
  getUserByMobile(mobileNumber) {
    const data = this.read();
    const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '').slice(-10);
    return data.users.find(u => {
      const uMob = (u.mobileNumber || '').replace(/\D/g, '').slice(-10);
      return uMob === cleanMobile;
    }) || null;
  }

  getUserByEmployeeId(employeeId) {
    const data = this.read();
    const cleanId = (employeeId || '').trim().toUpperCase();
    return data.users.find(u => (u.employeeId || '').toUpperCase() === cleanId) || null;
  }

  getUserByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim();
    // Try employee ID first
    let user = this.getUserByEmployeeId(clean);
    if (!user) {
      // Try mobile number
      user = this.getUserByMobile(clean);
    }
    if (!user) {
      // Try ID
      user = this.getUserById(clean);
    }
    return user;
  }

  getUserById(id) {
    const data = this.read();
    return data.users.find(u => u.id === id) || null;
  }

  createUser(userData) {
    const data = this.read();
    const newUser = {
      id: `USER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: userData.fullName.trim(),
      role: userData.role,
      mobileNumber: userData.mobileNumber.trim(),
      employeeId: userData.employeeId ? userData.employeeId.trim().toUpperCase() : null,
      passwordHash: userData.passwordHash,
      accountStatus: userData.accountStatus || 'PENDING_VERIFICATION',
      passkeys: [],
      officialDataLinked: false,
      officialProfileId: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    data.users.push(newUser);
    this.write(data);
    try {
      const mongo = require('./mongo');
      mongo.syncUserToMongo(newUser);
    } catch (e) {}
    return newUser;
  }

  upsertTeacherUser(employee) {
    const data = this.read();
    let user = data.users.find(u => (u.employeeId || '').toUpperCase() === employee.employeeId.toUpperCase());
    if (!user) {
      user = {
        id: `TCH-${employee.employeeId}`,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        role: 'Teacher',
        mobileNumber: employee.mobileNumber,
        accountStatus: 'ACTIVE',
        officialDataLinked: true,
        designation: employee.designation,
        schoolName: employee.schoolName,
        mandal: employee.mandal,
        passkeys: [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      data.users.push(user);
    } else {
      user.lastLogin = new Date().toISOString();
      user.fullName = employee.fullName;
      user.mobileNumber = employee.mobileNumber;
      user.accountStatus = employee.accountStatus || 'ACTIVE';
      user.designation = employee.designation;
      user.schoolName = employee.schoolName;
      user.mandal = employee.mandal;
      if (!user.passkeys) user.passkeys = [];
    }
    this.write(data);
    try {
      const mongo = require('./mongo');
      mongo.syncUserToMongo(user);
    } catch (e) {}
    return user;
  }

  updateUser(id, updates) {
    const data = this.read();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    data.users[index] = { ...data.users[index], ...updates };
    this.write(data);
    try {
      const mongo = require('./mongo');
      mongo.syncUserToMongo(data.users[index]);
    } catch (e) {}
    return data.users[index];
  }

  updateUserLastLogin(id) {
    return this.updateUser(id, { lastLogin: new Date().toISOString() });
  }

  // ==========================================
  // WEBAUTHN / PASSKEY CREDENTIAL MANAGEMENT
  // ==========================================
  addPasskey(userId, passkeyData) {
    const data = this.read();
    const user = data.users.find(u => u.id === userId);
    if (!user) return null;
    if (!user.passkeys) user.passkeys = [];

    // Check if credential ID already exists
    const existingIndex = user.passkeys.findIndex(p => p.credentialId === passkeyData.credentialId);
    if (existingIndex >= 0) {
      user.passkeys[existingIndex] = { ...user.passkeys[existingIndex], ...passkeyData };
    } else {
      user.passkeys.push(passkeyData);
    }

    this.write(data);
    try {
      const mongo = require('./mongo');
      mongo.syncUserToMongo(user);
    } catch (e) {}
    return user;
  }

  getUserPasskeys(userId) {
    const user = this.getUserById(userId);
    return (user && user.passkeys) ? user.passkeys : [];
  }

  getUserByCredentialId(credentialId) {
    const data = this.read();
    for (const user of data.users) {
      if (user.passkeys && user.passkeys.some(p => p.credentialId === credentialId)) {
        return user;
      }
    }
    return null;
  }

  updatePasskeyCounter(userId, credentialId, newCounter) {
    const data = this.read();
    const user = data.users.find(u => u.id === userId);
    if (!user || !user.passkeys) return false;
    const pk = user.passkeys.find(p => p.credentialId === credentialId);
    if (pk) {
      pk.counter = newCounter;
      this.write(data);
      try {
        const mongo = require('./mongo');
        mongo.syncUserToMongo(user);
      } catch (e) {}
      return true;
    }
    return false;
  }

  // ==========================================
  // SERVER-SIDE SESSION MANAGEMENT
  // ==========================================
  createSession(userId, role, metadata = {}) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours validity

    const session = {
      sessionId,
      userId,
      role,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      metadata
    };

    const data = this.read();
    if (!data.sessions) data.sessions = [];
    // Prune expired sessions
    data.sessions = data.sessions.filter(s => s.expiresAt > now);
    data.sessions.push(session);
    this.write(data);
    try {
      const mongo = require('./mongo');
      mongo.syncSessionToMongo(session);
    } catch (e) {}
    return session;
  }

  getSession(sessionId) {
    if (!sessionId) return null;
    const data = this.read();
    if (!data.sessions) return null;
    const session = data.sessions.find(s => s.sessionId === sessionId);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.destroySession(sessionId);
      return null;
    }
    return session;
  }

  destroySession(sessionId) {
    if (!sessionId) return false;
    const data = this.read();
    if (!data.sessions) return true;
    data.sessions = data.sessions.filter(s => s.sessionId !== sessionId);
    this.write(data);
    try {
      const mongo = require('./mongo');
      mongo.removeSessionFromMongo(sessionId);
    } catch (e) {}
    return true;
  }

  async syncFromMongo() {
    try {
      const mongo = require('./mongo');
      if (!mongo.isMongoConnected()) return;
      const state = await mongo.loadFromMongo();
      if (!state) return;
      const data = this.read();
      let changed = false;
      if (Array.isArray(state.users) && state.users.length > 0) {
        state.users.forEach(u => {
          const idx = data.users.findIndex(existing => existing.id === u.id);
          if (idx >= 0) {
            data.users[idx] = { ...data.users[idx], ...u };
          } else {
            data.users.push(u);
          }
          changed = true;
        });
      }
      if (Array.isArray(state.sessions) && state.sessions.length > 0) {
        state.sessions.forEach(s => {
          if (!data.sessions.some(existing => existing.sessionId === s.sessionId)) {
            data.sessions.push(s);
            changed = true;
          }
        });
      }
      if (changed) {
        this.write(data);
        console.log(`[MongoDB] Synchronized ${data.users.length} users with MongoDB Atlas.`);
      }
    } catch (err) {
      console.warn('[MongoDB] Sync error:', err.message);
    }
  }

  getPortalData() {
    const data = this.read();
    return {
      statistics: data.statistics,
      notifications: data.notifications
    };
  }

  // ==========================================
  // WEBAUTHN CHALLENGE PERSISTENCE
  // ==========================================
  saveChallenge(challengeDoc) {
    const data = this.read();
    if (!data.webauthnChallenges) data.webauthnChallenges = [];
    const nowIso = new Date().toISOString();
    data.webauthnChallenges.forEach((item) => {
      if (
        item.userId === challengeDoc.userId
        && item.registrationType === challengeDoc.registrationType
        && !item.consumed
      ) {
        item.consumed = true;
        item.consumedAt = nowIso;
        item.superseded = true;
      }
    });
    data.webauthnChallenges.push(challengeDoc);
    this.write(data);
    return challengeDoc;
  }

  getChallenge(userId, registrationType) {
    const data = this.read();
    const matches = (data.webauthnChallenges || []).filter((item) => (
      String(item.userId) === String(userId) && item.registrationType === registrationType
    ));
    matches.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    const active = matches.find((item) => !item.consumed);
    return active || matches[0] || null;
  }

  getChallengeByEnrollmentToken(token) {
    if (!token) return null;
    const data = this.read();
    return (data.webauthnChallenges || []).find((item) => item.enrollmentToken === token) || null;
  }

  getChallengeByValue(challenge) {
    if (!challenge) return null;
    const data = this.read();
    return (data.webauthnChallenges || []).find((item) => item.challenge === challenge) || null;
  }

  consumeChallenge(userId, challenge, registrationType) {
    const data = this.read();
    if (!data.webauthnChallenges) return false;
    const found = data.webauthnChallenges.find((item) => (
      String(item.userId) === String(userId)
      && item.challenge === challenge
      && item.registrationType === registrationType
    ));
    if (!found) return false;
    found.consumed = true;
    found.consumedAt = new Date().toISOString();
    this.write(data);
    return true;
  }
}

module.exports = new Database();
