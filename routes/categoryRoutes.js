// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// الحصول على كل التصنيفات (مفتوح للجميع)
router.get('/', categoryController.getAllCategories);

// العمليات الإدارية - للأدمن فقط
router.get('/:categoryId', authMiddleware(1995, 1996), categoryController.getCategory)
router.post('/', authMiddleware(1995, 1996), categoryController.createCategory);
router.put('/:categoryId', authMiddleware(1995, 1996), categoryController.updateCategory);
router.delete('/:categoryId', authMiddleware(1995, 1996), categoryController.deleteCategory);

module.exports = router;
