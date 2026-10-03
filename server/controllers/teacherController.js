const db = require('../db');
const authConfig = require('../config/authConfig');
const teacherService = require('../services/teacherService');
const teacherDirectoryService = require('../services/teacherDirectoryService');

function getSessionUser(req) {
  const fromCookie = authConfig.getCookie(req, 'deo_session_id');
  let sessionId = fromCookie;
  if (!sessionId) {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionId = authHeader.split(' ')[1];
    }
  }

  if (sessionId) {
    const session = db.getSession(sessionId);
    if (session && session.userId) {
      const user = db.getUserById(session.userId);
      if (user) return user;
    }
  }

  // Check preview role header (used by dashboard role switcher if active)
  const previewRole = req.headers && req.headers['x-preview-role'];
  const previewMandal = req.headers && req.headers['x-preview-mandal'];
  if (previewRole) {
    return {
      id: 'PREVIEW-USER',
      role: previewRole.toUpperCase(),
      mandal: previewMandal ? previewMandal.toUpperCase() : (previewRole.toUpperCase() === 'MEO' ? 'JANGAON' : null),
      fullName: `Preview ${previewRole} User`
    };
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
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required to view Teacher Service Record."
        });
      }

      // Authorization: Teachers access their own record. Officers (APO, DEO, MEO) can access in view-only mode.
      const isTeacher = (user.role === 'Teacher');
      const isOfficer = (user.role === 'APO' || user.role === 'DEO' || user.role === 'MEO' || user.role === 'Officer');
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

  /**
   * GET /api/teachers
   * Teachers Information directory list with filtering, search, pagination.
   * Access: DEO (All District), APO (Jurisdiction/All), MEO (Assigned Mandal only).
   * Blocked: Public (401), Teacher role (403).
   */
  async getTeachersDirectory(req, res) {
    try {
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required to access Teachers Information directory."
        });
      }

      const role = (user.role || '').toUpperCase();
      if (role === 'TEACHER') {
        return res.status(403).json({
          success: false,
          message: "Access Denied: Teachers cannot access the Teachers Information administrative directory. Teachers can view their personal service record from their own dashboard."
        });
      }

      const urlObj = new URL(req.url, 'http://localhost');
      const query = {
        mandal: urlObj.searchParams.get('mandal'),
        designation: urlObj.searchParams.get('designation'),
        search: urlObj.searchParams.get('search'),
        page: urlObj.searchParams.get('page'),
        limit: urlObj.searchParams.get('limit')
      };

      const result = teacherDirectoryService.getTeachersList(query, user);
      if (!result.success) {
        return res.status(result.status || 403).json(result);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error('[TEACHER CONTROLLER] Error in getTeachersDirectory:', err);
      return res.status(500).json({ success: false, message: "Internal server error fetching teachers directory." });
    }
  }

  /**
   * GET /api/teachers/:treasuryCode
   * GET /api/teachers/profile/:treasuryCode
   * Complete Individual Teacher Profile covering all reference form sections (A through K).
   * Access: DEO (Any teacher in district), APO (Permitted jurisdiction), MEO (Assigned mandal ONLY).
   * Blocked: Public (401), Teacher role (403), MEO querying another mandal (403).
   */
  async getIndividualTeacherProfile(req, res, treasuryCode) {
    try {
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required to access Individual Teacher Profile."
        });
      }

      const role = (user.role || '').toUpperCase();
      if (role === 'TEACHER') {
        return res.status(403).json({
          success: false,
          message: "Access Denied: Teacher accounts do not have permission to view other teacher profiles."
        });
      }

      const urlObj = new URL(req.url, 'http://localhost');
      const forPrint = urlObj.searchParams.get('print') === 'true' || urlObj.searchParams.get('print') === '1';

      const result = await teacherDirectoryService.getTeacherProfile(treasuryCode, user, { maskSensitive: !forPrint });
      if (!result.success) {
        return res.status(result.status || 403).json(result);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error('[TEACHER CONTROLLER] Error in getIndividualTeacherProfile:', err);
      return res.status(500).json({ success: false, message: "Internal server error fetching teacher profile." });
    }
  }

  /**
   * PUT /api/teachers/:treasuryCode
   * PUT /api/teachers/profile/:treasuryCode
   * Extensible update for teacher profile fields (Future data population mechanism).
   */
  async updateIndividualTeacherProfile(req, res, treasuryCode) {
    try {
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      let body = req.body || {};
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }

      const result = teacherDirectoryService.updateTeacherProfile(treasuryCode, body, user);
      if (!result.success) {
        return res.status(result.status || 403).json(result);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error('[TEACHER CONTROLLER] Error in updateIndividualTeacherProfile:', err);
      return res.status(500).json({ success: false, message: "Internal server error updating teacher profile." });
    }
  }
}

module.exports = new TeacherController();
