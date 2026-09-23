const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication & OTP Routes
router.post('/send-otp', (req, res) => authController.sendOtp(req, res));
router.post('/verify-otp', (req, res) => authController.verifyOtp(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
router.get('/me', (req, res) => authController.me(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

module.exports = router;
