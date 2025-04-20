const { getFileUrl } = require('../middleware/upload')
const Product = require('../models/Product')

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Product.countDocuments()
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .populate('category', 'name')
      .populate('createdBy', 'username')

    res.json({
      data: products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'username')

    if (!product) return res.status(404).json({ error: 'Product not found' })

    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, price,stock, description, category } = req.body;
    const images = req.files;

    if (!name || !price || !description || !category || !stock) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const fileUrls = images.map((file) => getFileUrl(file.filename))

    const newProduct = await Product.create({
      name,
      description,
      category,
      price,
      stock,
      images: fileUrls,
      createdBy: req.user._id,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(product)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product' })
  }
}

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
}
