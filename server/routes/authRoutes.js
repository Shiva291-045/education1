const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Direct registration without OTP
router.post('/register', (req, res) => authController.register(req, res));

// Dedicated Teacher login (Employee ID + Mobile Number)
router.post('/teacher/login', (req, res) => authController.teacherLogin(req, res));

// Administrative / General Password Login
router.post('/login', (req, res) => authController.login(req, res));

// Session authentication & Logout
router.get('/me', (req, res) => authController.me(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

module.exports = router;
