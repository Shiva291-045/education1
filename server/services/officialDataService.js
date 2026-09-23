const db = require('../db');

/**
 * OfficialDataService
 * ===================
 * Dedicated abstraction layer for integrating with the official Telangana Department
 * of School Education database / EMIS / U-DISE+ API.
 * 
 * NOTE: The official database connection is currently pending until the real department
 * data source / credentials are provided by the administrator.
 * 
 * Once the real database is provided:
 * 1. Set `this.isConnected = true` and configure the database client in `connectDatabase()`.
 * 2. Implement the query in `queryOfficialRecord()`.
 * 
 * The rest of the authentication architecture (Registration, OTP verification, Passwords,
 * Tokens, Dashboards) is completely decoupled and will remain unchanged.
 */
class OfficialDataService {
  constructor() {
    // Database connection handle (placeholder for future official database driver)
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
      // Future integration hook:
      // this.connection = await createPool(config);
      // this.isConnected = true;
      console.log("[OFFICIAL DATA SERVICE] Official database connection hook ready.");
      return { success: true };
    } catch (err) {
      console.error("[OFFICIAL DATA SERVICE] Failed to connect official database:", err);
      this.isConnected = false;
      return { success: false, error: err.message };
    }
  }

  /**
   * Query the official government department database.
   * Currently returns null until the genuine database is connected.
   */
  async queryOfficialRecord(mobileNumber, role) {
    if (!this.isConnected || !this.connection) {
      // Database not yet connected
      return null;
    }

    // Future query execution against genuine department records:
    // return await this.connection.query(
    //   'SELECT * FROM official_department_records WHERE mobile = ? AND role = ?',
    //   [mobileNumber, role]
    // );
    return null;
  }

  /**
   * Main service method called during user registration workflow.
   * Step: Check Official Department Data -> Link Official Data
   */
  async checkAndLinkOfficialData(userId, mobileNumber, role) {
    const cleanMobile = mobileNumber ? mobileNumber.trim() : '';

    // If the official database is NOT connected yet:
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

    // If official database IS connected, perform the genuine lookup:
    const matchedRecord = await this.queryOfficialRecord(cleanMobile, role);

    if (matchedRecord) {
      // Genuine record found in official department database:
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
      // Database connected, but no matching official record found:
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
