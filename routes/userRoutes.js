// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// =================== 👨‍💻 Users (Only Admins) =================== //

// الحصول على قائمة جميع المستخدمين (الأدمن فقط)
router.get('/', authMiddleware(1995), userController.getAllUsers);  // فقط للأدمن

// الحصول على مستخدم واحد حسب الـ ID (الأدمن فقط)
router.get('/:userId', authMiddleware(1995), userController.getUserById);

// إنشاء مستخدم جديد (الأدمن فقط)
router.post('/', authMiddleware(1995), userController.createUser);  // فقط للأدمن

// تعديل بيانات مستخدم آخر (الأدمن فقط)
router.put('/:userId', authMiddleware(1995), userController.updateUser);  // فقط للأدمن

// حذف مستخدم (الأدمن فقط)
router.delete('/:userId', authMiddleware(1995), userController.deleteUser);  // فقط للأدمن

module.exports = router;
