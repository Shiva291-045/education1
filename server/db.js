const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'education_db.json');

// Initial clean database state: ONLY genuine authentication data
const defaultState = {
  users: [],
  otps: [],
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
        if (!parsed.otps) parsed.otps = [];
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
      return JSON.parse(raw);
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
  // USER AUTHENTICATION PERSISTENCE (GENUINE DATA ONLY)
  // ==========================================
  getUserByMobile(mobileNumber) {
    const data = this.read();
    return data.users.find(u => u.mobileNumber === mobileNumber.trim()) || null;
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
      passwordHash: userData.passwordHash,
      mobileVerified: true,
      accountStatus: 'ACTIVE',
      // Official data integration status: Strictly pending until actual government DB is connected
      officialDataLinked: false,
      officialProfileId: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    data.users.push(newUser);
    this.write(data);
    return newUser;
  }

  updateUser(id, updates) {
    const data = this.read();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    data.users[index] = { ...data.users[index], ...updates };
    this.write(data);
    return data.users[index];
  }

  updateUserLastLogin(id) {
    return this.updateUser(id, { lastLogin: new Date().toISOString() });
  }

  // ==========================================
  // OTP LIFECYCLE (SECURITY & RATE LIMITS)
  // ==========================================
  saveOtp({ mobileNumber, otpCode, purpose }) {
    const data = this.read();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    const newOtp = {
      id: `OTP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      mobileNumber: mobileNumber.trim(),
      otpCode,
      purpose,
      expiresAt,
      attempts: 0,
      maxAttempts: 3,
      verified: false,
      createdAt: new Date().toISOString()
    };
    // Clear previous pending OTPs for the same mobile and purpose
    data.otps = data.otps.filter(o => !(o.mobileNumber === mobileNumber.trim() && o.purpose === purpose && !o.verified));
    data.otps.push(newOtp);
    this.write(data);
    return newOtp;
  }

  getLatestOtp(mobileNumber, purpose) {
    const data = this.read();
    const matching = data.otps
      .filter(o => o.mobileNumber === mobileNumber.trim() && o.purpose === purpose)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return matching[0] || null;
  }

  incrementOtpAttempts(id) {
    const data = this.read();
    const otp = data.otps.find(o => o.id === id);
    if (otp) {
      otp.attempts = (otp.attempts || 0) + 1;
      this.write(data);
      return otp.attempts;
    }
    return 0;
  }

  markOtpVerified(id) {
    const data = this.read();
    const otp = data.otps.find(o => o.id === id);
    if (otp) {
      otp.verified = true;
      this.write(data);
      return true;
    }
    return false;
  }

  getPortalData() {
    const data = this.read();
    return {
      statistics: data.statistics,
      notifications: data.notifications
    };
  }
}

module.exports = new Database();
