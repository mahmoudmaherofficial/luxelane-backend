const { getFileUrl } = require('../config/multer.config');
const Product = require('../models/product.model');
const fs = require('fs');
const path = require('path');

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
  const { name, price, discount, stock, description, category, size, colors } = req.body;
  const imageUrls = req.imageUrls || []; // دي روابط الصور من Cloudinary

  if (!name || !price || !description || !category || !stock || !size || !colors) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const standardSizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sortedSizes = [...size].sort((a, b) => {
    const upperA = a.toUpperCase();
    const upperB = b.toUpperCase();

    const indexA = standardSizeOrder.indexOf(upperA);
    const indexB = standardSizeOrder.indexOf(upperB);

    const extractNumber = (val) => {
      const match = val.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : Infinity;
    };

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return extractNumber(upperA) - extractNumber(upperB);
  });

  const sortedColors = [...colors].sort((a, b) => a.localeCompare(b));

  try {
    const newProduct = await Product.create({
      name,
      description,
      category,
      price,
      discount,
      stock,
      size: sortedSizes,
      colors: sortedColors,
      images: imageUrls, // مباشرة بدون map
      createdBy: req.user.userId,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Product creation error:', error);
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

    const { name, price, discount, stock, description, size, colors, category } = req.body || {};

    const standardSizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sortedSizes = (Array.isArray(size) ? size : [size || existingProduct.size]).sort((a, b) => {
      const indexA = standardSizeOrder.indexOf(a.toUpperCase());
      const indexB = standardSizeOrder.indexOf(b.toUpperCase());
      return indexA !== -1 && indexB !== -1 ? indexA - indexB :
        indexA !== -1 ? -1 :
          indexB !== -1 ? 1 :
            parseInt(a.match(/\d+/) || Infinity, 10) - parseInt(b.match(/\d+/) || Infinity, 10);
    });

    const sortedColors = (Array.isArray(colors) ? colors : [colors || existingProduct.colors]).sort((a, b) => a.localeCompare(b));

    const newImages = req.imageUrls || []; // روابط الصور الجديدة من Cloudinary

    const updatedData = {
      name: name || existingProduct.name,
      price: price || existingProduct.price,
      discount: discount || existingProduct.discount,
      stock: stock || existingProduct.stock,
      description: description || existingProduct.description,
      size: sortedSizes,
      colors: sortedColors,
      category: category || existingProduct.category,
      images: [...existingProduct.images, ...newImages], // دمج الصور القديمة مع الجديدة
    };

    Object.assign(existingProduct, updatedData);
    const updatedProduct = await existingProduct.save();

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Update error:', err);
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

    if (updatedImages.length === product.images.length) {
      return res.status(404).json({ message: 'Image not found' });
    }

    product.images = updatedImages;
    await product.save();

    const imagePath = path.join(__dirname, '..', 'Uploads', imageName);
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