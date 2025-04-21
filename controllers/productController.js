const { getFileUrl } = require('../middleware/upload')
const Product = require('../models/Product')

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit);
    const offset = isPaginated ? (page - 1) * limit : 0;

    const totalItems = await Product.countDocuments();

    let productQuery = Product.find()
      .populate('category', 'name')
      .populate('createdBy', 'username');

    if (isPaginated) {
      productQuery = productQuery.skip(offset).limit(limit);
    }

    const products = await productQuery;

    res.json({
      data: products,
      ...(isPaginated && {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      }),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

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
    const { name, price, stock, description, category, size } = req.body;
    const images = req.files;

    if (!name || !price || !description || !category || !stock || !size) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const fileUrls = images?.map((file) => getFileUrl(file.filename));

    // ترتيب المقاسات
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

      // الاتنين موجودين في المقاسات المعروفة
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;

      // واحد منهم معروف
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // الاتنين مش معروفين → قارن بالأرقام
      return extractNumber(upperA) - extractNumber(upperB);
    });

    const newProduct = await Product.create({
      name,
      description,
      category,
      price,
      stock,
      size: sortedSizes,
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
