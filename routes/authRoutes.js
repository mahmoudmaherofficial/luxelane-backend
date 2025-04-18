// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

// =================== 🔐 Authentication =================== //

// Register new user
router.post('/register', upload.single('profile_image'), authController.register);

// Login
router.post('/login', authController.login);

// Logout (dummy)
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
