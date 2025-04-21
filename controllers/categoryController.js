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
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    let categories
    let totalCategories = await Category.countDocuments()
    let totalPages = 1
    let currentPage = 1

    if (!isNaN(page) && !isNaN(limit)) {
      const skip = (page - 1) * limit

      categories = await Category.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      totalPages = Math.ceil(totalCategories / limit)
      currentPage = page
    } else {
      categories = await Category.find().sort({ createdAt: -1 })
    }

    res.json({
      data: categories,
      totalPages,
      currentPage,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}


// الحصول على تصنيف حسب الـ ID (الأدمن فقط)
exports.getCategory = async (req, res) => {
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
