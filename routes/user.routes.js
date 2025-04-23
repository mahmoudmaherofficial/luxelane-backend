// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');

// =================== 👨‍💻 Users (Admins Only) =================== //

// حماية كل المسارات أدمن فقط
router.use(authMiddleware(1995));

// الحصول على قائمة جميع المستخدمين
router.get('/', userController.getAllUsers);

// الحصول على مستخدم واحد حسب الـ ID
router.get('/:userId', userController.getUser);

// إنشاء مستخدم جديد
router.post('/', userController.createUser);

// تعديل بيانات مستخدم
router.put('/:userId', userController.updateUser);

// حذف مستخدم
router.delete('/:userId', userController.deleteUser);

module.exports = router;
