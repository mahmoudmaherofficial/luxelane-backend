const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  description: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  size: {
    type: [String], // e.g., ["S", "M", "L"]
    default: [],
  },
  colors: {
    type: [String], // e.g., ["Red", "Blue"]
    default: [],
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: { type: [String], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);