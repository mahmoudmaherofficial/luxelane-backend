// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/roles');

// الحصول على كل التصنيفات (مفتوح للجميع)
router.get('/', categoryController.getAllCategories);
router.get('/:categoryId', categoryController.getCategory)

// العمليات الإدارية - للأدمن فقط
router.post('/', authMiddleware(ROLES.ADMIN, ROLES.SELLER), categoryController.createCategory);
router.put('/:categoryId', authMiddleware(ROLES.ADMIN, ROLES.SELLER), categoryController.updateCategory);
router.delete('/:categoryId', authMiddleware(ROLES.ADMIN, ROLES.SELLER), categoryController.deleteCategory);

module.exports = router;
