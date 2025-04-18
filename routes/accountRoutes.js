// routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // تحقق من التوكن
const accountController = require('../controllers/accountController');

// =================== 👤 Account =================== //

// عرض معلومات الحساب (المستخدم الذي قام بتسجيل الدخول فقط)
router.get('/', authMiddleware(), accountController.getAccount);

// تحديث بيانات الحساب (المستخدم الذي قام بتسجيل الدخول فقط)
router.put('/', authMiddleware(), accountController.updateAccount);

// حذف الحساب (المستخدم الذي قام بتسجيل الدخول فقط)
router.delete('/', authMiddleware(), accountController.deleteAccount);

module.exports = router;
