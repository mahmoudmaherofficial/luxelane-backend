const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { userId, products, address, phoneNumber, secondaryPhoneNumber } = req.body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate products and calculate total amount
    let totalAmount = 0;
    const validatedProducts = [];
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }
      validatedProducts.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price
      });
      totalAmount += product.price * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      user: userId,
      products: validatedProducts,
      totalAmount,
      address,
      phoneNumber,
      secondaryPhoneNumber
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get all orders (admin or user-specific)
exports.getOrders = async (req, res) => {
  try {
    const { userId } = req.query;
    let orders;

    if (userId) {
      // Get orders for a specific user
      orders = await Order.find({ user: userId })
        .populate('user', 'username email')
        .populate('products.product', 'name price');
    } else {
      // Get all orders (admin)
      orders = await Order.find()
        .populate('user', 'username email')
        .populate('products.product', 'name price');
    }

    // Define the desired status order
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    // Sort orders based on statusOrder
    orders.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'username email')
      .populate('products.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Get orders for the currently logged-in user
exports.getCurrentUserOrders = async (req, res) => {
  try {
    // Assume req.user is set by authentication middleware (e.g., JWT)
    const userId = req.user.userId;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch orders for the current user
    const orders = await Order.find({ user: userId })
      .populate('user', 'username email')
      .populate('products.product', 'name price');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user orders', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Handle stock adjustments based on status change
    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Restore stock when cancelling
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    } else if (order.status === 'cancelled' && status !== 'cancelled') {
      // Deduct stock when moving from cancelled to another status
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
        }
        product.stock -= item.quantity;
        await product.save();
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restore product stock for order
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await order.deleteOne();
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

