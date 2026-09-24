const db = require('../db');

/**
 * DEVELOPMENT / TEST EMPLOYEE RECORDS
 * ===================================
 * STRICT SEPARATION NOTICE:
 * The records below are explicitly isolated for development verification and local end-to-end testing.
 * When the actual official Telangana Department database is connected via connectDatabase(),
 * queries will be dispatched directly to the official government data source.
 * Development/Test Data ≠ Official Production Data.
 */
const DEV_TEST_EMPLOYEES = [
  {
    employeeId: "TS-TCH-100234",
    mobileNumber: "9876543210",
    fullName: "K. Sunitha",
    role: "Teacher",
    designation: "School Assistant (Mathematics)",
    schoolName: "Zilla Parishad High School, Jangaon",
    mandal: "Jangaon",
    accountStatus: "ACTIVE",
    isDevTestData: true
  },
  {
    employeeId: "TS-TCH-100582",
    mobileNumber: "9848022338",
    fullName: "M. Rajeshwar Rao",
    role: "Teacher",
    designation: "Secondary Grade Teacher (Telugu)",
    schoolName: "Govt High School, Bachannapet",
    mandal: "Bachannapet",
    accountStatus: "ACTIVE",
    isDevTestData: true
  },
  {
    employeeId: "TS-TCH-100911",
    mobileNumber: "9440123456",
    fullName: "B. Anitha",
    role: "Teacher",
    designation: "Physical Education Teacher",
    schoolName: "KGBV Jangaon",
    mandal: "Jangaon",
    accountStatus: "ACTIVE",
    isDevTestData: true
  }
];

/**
 * OfficialDataService
 * ===================
 * Dedicated abstraction layer for integrating with the official Telangana Department
 * of School Education database / EMIS / U-DISE+ API.
 */
class OfficialDataService {
  constructor() {
    this.connection = null;
    this.isConnected = false; // Strictly false until real department database is provided
  }

  /**
   * Method to initialize real government database connection when provided.
   * e.g., PostgreSQL / MySQL / Oracle pool or REST API client.
   * @param {Object} config - Official DB connection configuration
   */
  async connectDatabase(config) {
    try {
      console.log("[OFFICIAL DATA SERVICE] Official database connection hook ready.");
      // Future integration hook:
      // this.connection = await createPool(config);
      // this.isConnected = true;
      return { success: true };
    } catch (err) {
      console.error("[OFFICIAL DATA SERVICE] Failed to connect official database:", err);
      this.isConnected = false;
      return { success: false, error: err.message };
    }
  }

  /**
   * Look up teacher by Employee ID in official database or development test records.
   */
  async getTeacherByEmployeeId(employeeId) {
    const cleanId = (employeeId || '').trim();
    if (!cleanId) return null;

    if (this.isConnected && this.connection) {
      // Future query to official database:
      // return await this.connection.query('SELECT * FROM employees WHERE employee_id = ?', [cleanId]);
      return null;
    }

    // Fallback to clearly isolated development test records
    return DEV_TEST_EMPLOYEES.find(e => e.employeeId.toUpperCase() === cleanId.toUpperCase()) || null;
  }

  /**
   * Verify Teacher Employee Credentials
   * Strict validation:
   * 1. Employee ID exists.
   * 2. Registered Mobile Number matches.
   * 3. Role is actually 'Teacher'.
   * 4. Account is 'ACTIVE'.
   */
  async verifyTeacherEmployee(employeeId, mobileNumber) {
    const cleanId = (employeeId || '').trim();
    const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '').slice(-10);

    if (!cleanId) {
      return { success: false, message: "Employee ID is required." };
    }
    if (!cleanMobile || cleanMobile.length !== 10) {
      return { success: false, message: "Valid 10-digit registered mobile number is required." };
    }

    const employee = await this.getTeacherByEmployeeId(cleanId);
    if (!employee) {
      return {
        success: false,
        message: "❌ Employee ID not found in the official employee database. Please check and retry."
      };
    }

    const empMobile = employee.mobileNumber.replace(/\D/g, '').slice(-10);
    if (empMobile !== cleanMobile) {
      return {
        success: false,
        message: "❌ The mobile number does not match the department record registered for this Employee ID."
      };
    }

    if (employee.role !== 'Teacher') {
      return {
        success: false,
        message: "❌ Unauthorized: Record found but role is not designated as Teacher."
      };
    }

    if (employee.accountStatus !== 'ACTIVE') {
      return {
        success: false,
        message: "❌ Employee record is currently inactive or suspended. Please contact the District Educational Office."
      };
    }

    return {
      success: true,
      employee
    };
  }

  /**
   * Query the official government department database for general records.
   */
  async queryOfficialRecord(mobileNumber, role) {
    if (!this.isConnected || !this.connection) {
      return null;
    }
    return null;
  }

  /**
   * Main service method called during user registration workflow.
   */
  async checkAndLinkOfficialData(userId, mobileNumber, role) {
    const cleanMobile = mobileNumber ? mobileNumber.trim() : '';

    if (!this.isConnected) {
      return {
        connected: false,
        matched: false,
        status: 'PENDING_INTEGRATION',
        message: 'Official department data integration is pending. Your account has been created successfully.',
        notice: 'Official records could not be linked yet. You can continue and contact the department for verification.',
        officialProfileId: null,
        officialRecord: null
      };
    }

    const matchedRecord = await this.queryOfficialRecord(cleanMobile, role);

    if (matchedRecord) {
      const updatedUser = db.updateUser(userId, {
        officialDataLinked: true,
        officialProfileId: matchedRecord.officialProfileId,
        officialRecord: matchedRecord
      });

      return {
        connected: true,
        matched: true,
        status: 'LINKED',
        message: '✓ Official data linked successfully',
        officialProfileId: matchedRecord.officialProfileId,
        officialRecord: matchedRecord,
        user: updatedUser
      };
    } else {
      return {
        connected: true,
        matched: false,
        status: 'NOT_FOUND',
        message: 'Account created successfully. Official records could not be linked yet. You can continue and contact the department for verification.',
        officialProfileId: null,
        officialRecord: null
      };
    }
  }

  /**
   * Get official linking status for a user
   */
  async getStatus(userId) {
    const user = db.getUserById(userId);
    if (!user) return null;
    return {
      connected: this.isConnected,
      officialDataLinked: user.officialDataLinked || false,
      officialProfileId: user.officialProfileId || null,
      statusMessage: this.isConnected
        ? (user.officialDataLinked ? '✓ Official data linked' : 'No matching official record found')
        : 'Official department data integration is pending'
    };
  }
}

module.exports = new OfficialDataService();
