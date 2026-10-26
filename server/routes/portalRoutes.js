let router;
try {
  const express = require('express');
  router = express.Router();
  const authController = require('../controllers/authController');
  const teacherController = require('../controllers/teacherController');
  const schoolStrengthController = require('../controllers/schoolStrengthController');

  // Protected Schools Information Routes (DEO & APO Only)
  router.get('/schools/information', (req, res) => schoolStrengthController.getStrengthDashboard(req, res));
  router.get('/schools/information/mandal/:mandal', (req, res) => schoolStrengthController.getMandalStrength(req, res, req.params.mandal));
  router.put('/schools/information/mandal/:mandal', (req, res) => schoolStrengthController.updateMandal(req, res, req.params.mandal));
  router.put('/schools/information/district/:code', (req, res) => schoolStrengthController.updateDistrict(req, res, req.params.code));

  // Legacy/Alias routes mapped to the same controller
  router.get('/schools/strength', (req, res) => schoolStrengthController.getStrengthDashboard(req, res));
  router.get('/schools/strength/mandal/:mandal', (req, res) => schoolStrengthController.getMandalStrength(req, res, req.params.mandal));
  router.put('/schools/strength/mandal/:mandal', (req, res) => schoolStrengthController.updateMandal(req, res, req.params.mandal));
  router.put('/schools/strength/district/:code', (req, res) => schoolStrengthController.updateDistrict(req, res, req.params.code));

  // Teacher Service Record Routes
  router.get('/teacher/service-record', (req, res) => teacherController.getServiceRecord(req, res));
  router.get('/teacher/preview-record', (req, res) => teacherController.getPreviewRecord(req, res));

  // Teachers Information Directory & Retirements Routes
  router.get('/teachers/retirements', (req, res) => teacherController.getRetirements(req, res));
  router.get('/teachers', (req, res) => teacherController.getTeachersDirectory(req, res));
  router.get('/teachers/profile/:treasuryCode', (req, res) => teacherController.getTeacherProfile(req, res, req.params.treasuryCode));
  router.put('/teachers/profile/:treasuryCode', (req, res) => teacherController.updateTeacherProfile(req, res, req.params.treasuryCode));
  router.get('/teachers/:treasuryCode', (req, res) => teacherController.getTeacherProfile(req, res, req.params.treasuryCode));
  router.put('/teachers/:treasuryCode', (req, res) => teacherController.updateTeacherProfile(req, res, req.params.treasuryCode));

  // Portal Data & Statistics Routes
  router.get('/portal-data', (req, res) => authController.portalData(req, res));
  router.get('/official/link-status', (req, res) => authController.linkStatus(req, res));

  // Search schools endpoint for "Find a School" search widget
  router.get('/schools/search', (req, res) => schoolStrengthController.searchSchools(req, res));
} catch (e) {
  router = {};
}

module.exports = router;
