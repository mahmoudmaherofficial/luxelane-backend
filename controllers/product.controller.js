const { getFileUrl } = require('../config/multer.config');
const Product = require('../models/product.model');
const fs = require('fs')
const path = require('path')

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
  const { id } = req.params;

  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      price,
      stock,
      description,
      size,
      category,
    } = req.body || {};

    const standardOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sortedSizes = (Array.isArray(size) ? size : [size || existingProduct.size]).sort((a, b) => {
      const indexA = standardOrder.indexOf(a.toUpperCase());
      const indexB = standardOrder.indexOf(b.toUpperCase());
      return indexA !== -1 && indexB !== -1 ? indexA - indexB :
        indexA !== -1 ? -1 :
          indexB !== -1 ? 1 :
            parseInt(a.match(/\d+/), 10) - parseInt(b.match(/\d+/), 10);
    });

    const updatedData = {
      name: name || existingProduct.name,
      price: price || existingProduct.price,
      stock: stock || existingProduct.stock,
      description: description || existingProduct.description,
      size: sortedSizes,
      category: category || existingProduct.category,
      images: [...existingProduct.images, ...(req.files ? req.files.map(file => getFileUrl(file.filename)) : [])],
    };

    Object.assign(existingProduct, updatedData);
    const updatedProduct = await existingProduct.save();

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product' });
  }
};


// Delete Product Image
exports.deleteProductImage = async (req, res) => {
  const { productId, imageName } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updatedImages = product.images.filter((img) => {
      const fileName = img.split('/').pop();
      return fileName !== imageName;
    });

    product.images = updatedImages;
    await product.save();

    const imagePath = path.join(__dirname, '..', 'uploads', imageName);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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

