const db = require('../db');
const authConfig = require('../config/authConfig');
const teacherService = require('../services/teacherService');

function getSessionIdFromReq(req) {
  const fromCookie = authConfig.getCookie(req, 'deo_session_id');
  if (fromCookie) return fromCookie;
  const authHeader = req.headers && req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

class TeacherController {
  /**
   * GET /api/teacher/service-record
   * Retrieves the authentic Teacher Service Record for the currently authenticated teacher.
   * View-only, protected, strictly returns the caller's own record.
   */
  async getServiceRecord(req, res) {
    try {
      const sessionId = getSessionIdFromReq(req);
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required to view Teacher Service Record."
        });
      }

      const session = db.getSession(sessionId);
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Session expired or invalid. Please login again."
        });
      }

      const user = db.getUserById(session.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User account not found."
        });
      }

      // Authorization: Teachers access their own record. Officers (APO, DEO, MEO) can access in view-only mode.
      const isTeacher = (user.role === 'Teacher');
      const isOfficer = (user.role === 'APO' || user.role === 'DEO' || user.role === 'MEO');
      if (!isTeacher && !isOfficer) {
        return res.status(403).json({
          success: false,
          message: "Access restricted: Teacher Service Record is accessible only to authenticated teachers and education officers."
        });
      }

      const forPrint = Boolean(req.query && (req.query.print === 'true' || req.query.print === '1'));
      const serviceRecord = teacherService.getServiceRecordForUser(user, { maskSensitive: !forPrint });

      return res.status(200).json({
        success: true,
        readOnly: true,
        teacher: {
          id: user.id,
          employeeId: user.employeeId,
          fullName: user.fullName,
          designation: user.designation,
          schoolName: user.schoolName,
          mandal: user.mandal,
          role: user.role
        },
        serviceRecord
      });
    } catch (err) {
      console.error('[TEACHER CONTROLLER] Error in getServiceRecord:', err);
      return res.status(500).json({
        success: false,
        message: "Internal server error retrieving Teacher Service Record."
      });
    }
  }

  /**
   * GET /api/teacher/preview-record
   * Read-only preview endpoint for sample reference teacher (P. Suresh Babu, 2126324)
   * used when in visitor preview mode on the portal dashboard.
   */
  async getPreviewRecord(req, res) {
    try {
      const record = JSON.parse(JSON.stringify(teacherService.SAMPLE_RECORD_2126324));
      return res.status(200).json({
        success: true,
        readOnly: true,
        isPreview: true,
        serviceRecord: record
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Error retrieving preview record." });
    }
  }
}

module.exports = new TeacherController();
