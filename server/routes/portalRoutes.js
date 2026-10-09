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

  // Portal Data & Statistics Routes
  router.get('/portal-data', (req, res) => authController.portalData(req, res));
  router.get('/official/link-status', (req, res) => authController.linkStatus(req, res));
  router.post('/passkey/register/start', (req, res) => authController.passkeyRegisterStart(req, res));
  router.post('/passkey/register/finish', (req, res) => authController.passkeyRegisterFinish(req, res));
  router.post('/passkey/login/start', (req, res) => authController.passkeyLoginStart(req, res));
  router.post('/passkey/login/finish', (req, res) => authController.passkeyLoginFinish(req, res));

  // Search schools endpoint for "Find a School" search widget
  router.get('/schools/search', (req, res) => schoolStrengthController.searchSchools(req, res));
} catch (e) {
  router = {};
}

module.exports = router;
