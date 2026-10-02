const db = require('../db');
const authConfig = require('../config/authConfig');
const schoolStrengthService = require('../services/schoolStrengthService');

function getSessionUser(req) {
  const fromCookie = authConfig.getCookie(req, 'deo_session_id');
  let sessionId = fromCookie;
  if (!sessionId) {
    const authHeader = req.headers.authorization;
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
  const previewRole = req.headers['x-preview-role'];
  const previewMandal = req.headers['x-preview-mandal'];
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

class SchoolStrengthController {
  /**
   * GET /api/schools/strength
   * Query params: ?mandal=...&management=...&stage=...
   */
  async getStrengthDashboard(req, res) {
    try {
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please log in as DEO, APO, or MEO to access school strength records."
        });
      }

      const urlObj = new URL(req.url, 'http://localhost');
      const query = {
        mandal: urlObj.searchParams.get('mandal'),
        management: urlObj.searchParams.get('management'),
        stage: urlObj.searchParams.get('stage')
      };

      const result = schoolStrengthService.getDashboardData(query, user);
      if (!result.success) {
        return res.status(result.status || 403).json(result);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error('[SchoolStrengthController] Error in getStrengthDashboard:', err);
      return res.status(500).json({ success: false, message: "Internal server error fetching school strength records." });
    }
  }

  /**
   * GET /api/schools/strength/mandal/:mandal
   */
  async getMandalStrength(req, res, mandalParam) {
    try {
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required."
        });
      }

      const decodedMandal = decodeURIComponent(mandalParam).trim();
      const result = schoolStrengthService.getDashboardData({ mandal: decodedMandal }, user);
      if (!result.success) {
        return res.status(result.status || 403).json(result);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error('[SchoolStrengthController] Error in getMandalStrength:', err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }

  /**
   * PUT /api/schools/strength/mandal/:mandal
   * Body: { [managementName]: strengthValue, ... }
   */
  async updateMandal(req, res, mandalParam) {
    try {
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please log in to edit mandal strength particulars."
        });
      }

      const decodedMandal = decodeURIComponent(mandalParam).trim();
      const updates = req.body || {};

      const result = schoolStrengthService.updateMandalData(decodedMandal, updates, user);
      return res.status(result.status || (result.success ? 200 : 400)).json(result);
    } catch (err) {
      console.error('[SchoolStrengthController] Error in updateMandal:', err);
      return res.status(500).json({ success: false, message: "Internal server error updating mandal particulars." });
    }
  }

  /**
   * PUT /api/schools/strength/district/:code
   * Body: { schoolsCount, stages: { ... } }
   */
  async updateDistrict(req, res, codeParam) {
    try {
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please log in as DEO or APO."
        });
      }

      const updates = req.body || {};
      const result = schoolStrengthService.updateDistrictData(codeParam, updates, user);
      return res.status(result.status || (result.success ? 200 : 400)).json(result);
    } catch (err) {
      console.error('[SchoolStrengthController] Error in updateDistrict:', err);
      return res.status(500).json({ success: false, message: "Internal server error updating district particulars." });
    }
  }
}

module.exports = new SchoolStrengthController();
