const Category = require('../models/category.model');

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = new Category({
      name,
      description,
      createdBy: req.user.userId,
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllCategories = async (req, res) => {
  const { page, limit } = req.query;
  const options = {};

  if (page && limit) {
    const skip = (page - 1) * limit;
    options.limit = parseInt(limit, 10);
    options.skip = parseInt(skip, 10);
  }

  try {
    const categories = await Category.find({}, null, options).sort({ createdAt: -1 });

    const totalItems = await Category.countDocuments();
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;
    const currentPage = page ? parseInt(page, 10) : 1;

    res.json({
      data: categories,
      totalItems,
      totalPages,
      currentPage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.categoryId,
      req.body,
      { new: true }
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

