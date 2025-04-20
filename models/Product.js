const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  stock: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [String], // مصفوفة صور بدل صورة وحدة
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},
  { timestamps: true }
)

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema)
