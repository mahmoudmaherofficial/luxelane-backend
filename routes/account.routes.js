// routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware'); // تحقق من التوكن
const accountController = require('../controllers/account.controller');

// =================== 👤 Account =================== //

router.get('/', authMiddleware(), accountController.getAccount);

router.put('/', authMiddleware(), accountController.updateAccount);

router.delete('/', authMiddleware(), accountController.deleteAccount);

module.exports = router;
