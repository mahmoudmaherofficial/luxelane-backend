const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const orderStatus = require('../utils/orderStatus');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { userId, products, totalAmount, address, phoneNumber, secondaryPhoneNumber } = req.body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate products and calculate total amount
    let calculatedTotal = 0;
    const validatedProducts = [];
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }
      const discount = product.discount || 0;
      const discountedPrice = product.price - discount;
      // Allow minor floating-point differences (e.g., 79.999 vs 80.00)
      if (Math.abs(item.price - discountedPrice) > 0.01) {
        return res.status(400).json({ message: `Invalid price for product ${product.name}: expected ${discountedPrice}, got ${item.price}` });
      }
      validatedProducts.push({
        product: item.product,
        quantity: item.quantity,
        price: discountedPrice,
        discount: discount
      });
      calculatedTotal += discountedPrice * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Validate totalAmount
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ message: `Total amount mismatch: expected ${calculatedTotal.toFixed(2)}, got ${totalAmount}` });
    }

    // Create order
    const order = new Order({
      user: userId,
      products: validatedProducts,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
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
    const { page, limit } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let orders;
    let totalItems;
    let totalPages = 1;
    let currentPage = 1;

    // Get total number of orders
    totalItems = await Order.countDocuments();

    // Fetch all orders without pagination or sorting in the query
    orders = await Order.find()
      .populate('user', 'username email')
      .populate('products.product', 'name price discount');

    // Define the desired status order: pending first, cancelled/delivered last
    const statusOrder = orderStatus;

    // Sort orders in JavaScript based on statusOrder
    orders.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

    // Check if pagination is requested (both page and limit must be valid numbers)
    const isPaginated = !isNaN(pageNum) && !isNaN(limitNum) && pageNum > 0 && limitNum > 0;

    if (isPaginated) {
      // Apply pagination in JavaScript after sorting
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      orders = orders.slice(startIndex, endIndex);

      totalPages = Math.ceil(totalItems / limitNum);
      currentPage = pageNum;
    } else {
      // Set pagination metadata for non-paginated response
      totalPages = 1;
      currentPage = 1;
    }

    res.status(200).json({
      data: orders,
      totalItems,
      totalPages,
      currentPage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'username email')
      .populate('products.product', 'name price discount');

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
    const userId = req.user.userId;
    

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user: userId })
      .populate('user', 'username email')
      .populate('products.product', 'name price discount');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user orders', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = orderStatus;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    } else if (order.status === 'cancelled' && status !== 'cancelled') {
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
