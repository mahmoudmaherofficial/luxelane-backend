const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    const userId = req.user.userId; // Assuming user is authenticated

    // Validate product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available` });
    }
    if (!product.size.includes(size)) {
      return res.status(400).json({ message: 'Invalid size' });
    }
    if (!product.colors.includes(color)) {
      return res.status(400).json({ message: 'Invalid color' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (itemIndex > -1) {
      // Update quantity if item exists
      cart.items[itemIndex].quantity += quantity;
      if (cart.items[itemIndex].quantity > product.stock) {
        return res.status(400).json({ message: `Cannot add more than ${product.stock} items` });
      }
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity, size, color });
    }

    await cart.save();
    // Re-populate product data to ensure it's included in the response
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.status(200).json({ message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    // Filter out items with null products (invalid references)
    cart.items = cart.items.filter(item => item.product !== null);
    await cart.save(); // Save the cleaned cart
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available` });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1); // Remove item if quantity is 0
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    // Re-populate product data to ensure it's included in the response
    const updatedCart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    res.status(200).json({ message: 'Cart updated', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId, size, color } = req.body;
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.size === size && item.color === color)
    );

    await cart.save();
    // Re-populate product data to ensure it's included in the response
    const updatedCart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    res.status(200).json({ message: 'Item removed from cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.status(200).json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
