const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const image = require('../middleware/multerConfig');

// =================== 🔐 Authentication =================== //

// Register new user
router.post('/register', image.uploadSingle, authController.register);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

module.exports = router;