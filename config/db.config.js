const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

module.exports = mongoose;