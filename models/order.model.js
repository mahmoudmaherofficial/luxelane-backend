const mongoose = require('mongoose');
const orderStatus = require('../utils/orderStatus');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: orderStatus,
    default: 'pending'
  },
  address: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: true
  },
  secondaryPhoneNumber: {
    type: String,
    trim: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);