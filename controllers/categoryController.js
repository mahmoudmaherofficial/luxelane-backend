// controllers/categoryController.js
const Category = require('../models/Category');

// إنشاء تصنيف جديد
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// الحصول على جميع التصنيفات
// controllers/categoryController.js

exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalCategories = await Category.countDocuments()
    const totalPages = Math.ceil(totalCategories / limit)

    res.json({
      categories,
      totalPages,
      currentPage: page,
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

// الحصول على تصنيف حسب الـ ID (الأدمن فقط)
exports.getCategoryById = async (req, res) => {
  const { categoryId } = req.params

  try {
    const category = await Category.findById(categoryId)
    if (!category) return res.status(404).json({ error: 'Category not found' })

    res.json(category)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// تحديث تصنيف
exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findByIdAndUpdate(categoryId, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// حذف تصنيف
exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
