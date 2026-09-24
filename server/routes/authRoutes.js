const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Direct registration without OTP
router.post('/register', (req, res) => authController.register(req, res));

// Dedicated Teacher login
router.post('/teacher/login', (req, res) => authController.teacherLogin(req, res));

// Real WebAuthn / Passkey routes
router.post('/webauthn/register-options', (req, res) => authController.webauthnRegisterOptions(req, res));
router.post('/webauthn/register-verify', (req, res) => authController.webauthnRegisterVerify(req, res));
router.post('/webauthn/login-options', (req, res) => authController.webauthnLoginOptions(req, res));
router.post('/webauthn/login-verify', (req, res) => authController.webauthnLoginVerify(req, res));

// Fallback Password Login
router.post('/login', (req, res) => authController.login(req, res));

// Session authentication & Logout
router.get('/me', (req, res) => authController.me(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

module.exports = router;
