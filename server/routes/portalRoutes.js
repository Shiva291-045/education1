const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Portal Data & Statistics Routes
router.get('/portal-data', (req, res) => authController.portalData(req, res));
router.get('/official/link-status', (req, res) => authController.linkStatus(req, res));

// Search schools endpoint for "Find a School" search widget
router.get('/schools/search', (req, res) => {
  const { mandal, type } = req.query;
  // Standard public catalog categories
  const schools = [
    { name: "Zilla Parishad High School, Jangaon", type: "Government", mandal: "Jangaon", medium: "Telugu & English" },
    { name: "Govt High School, Bachannapet", type: "Government", mandal: "Bachannapet", medium: "Telugu & English" },
    { name: "Kasturba Gandhi Balika Vidyalaya (KGBV)", type: "Residential", mandal: "Jangaon", medium: "English" },
    { name: "Telangana State Model School, Narmetta", type: "Model School", mandal: "Narmetta", medium: "English" },
    { name: "MPPS Primary School, Station Ghanpur", type: "Primary", mandal: "Station Ghanpur", medium: "Telugu" }
  ];
  let filtered = schools;
  if (mandal && mandal !== 'all') {
    filtered = filtered.filter(s => s.mandal.toLowerCase().includes(mandal.toLowerCase()));
  }
  if (type && type !== 'all') {
    filtered = filtered.filter(s => s.type.toLowerCase().includes(type.toLowerCase()));
  }
  res.json({ success: true, count: filtered.length, schools: filtered });
});

module.exports = router;
