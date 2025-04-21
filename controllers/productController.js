const { getFileUrl } = require('../middleware/upload');
const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);

  let offset = 0;
  let products;

  try {
    const totalItems = await Product.countDocuments();

    if (page && limit) {
      offset = (page - 1) * limit;
      products = await Product.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('category', 'name')
        .populate('createdBy', 'username');
    } else {
      products = await Product.find()
        .sort({ createdAt: -1 })
        .populate('category', 'name')
        .populate('createdBy', 'username');
    }

    res.json({
      data: products,
      totalItems,
      currentPage: page || 1,
      totalPages: page && limit ? Math.ceil(totalItems / limit) : 1,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'username');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  const { name, price, stock, description, category, size } = req.body;
  const images = req.files;

  if (!name || !price || !description || !category || !stock || !size) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const fileUrls = images?.map((file) => getFileUrl(file.filename));

  const standardOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sortedSizes = [...size].sort((a, b) => {
    const upperA = a.toUpperCase();
    const upperB = b.toUpperCase();

    const indexA = standardOrder.indexOf(upperA);
    const indexB = standardOrder.indexOf(upperB);

    const extractNumber = (val) => {
      const match = val.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : Infinity;
    };

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return extractNumber(upperA) - extractNumber(upperB);
  });

  try {
    const newProduct = await Product.create({
      name,
      description,
      category,
      price,
      stock,
      size: sortedSizes,
      images: fileUrls,
      createdBy: req.user.userId,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

