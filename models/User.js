const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// تعريف الـ Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_image: { type: String, default: '' },
  role: {
    type: Number,
    enum: [1995, 1996, 2004], // تحديد الأدوار كـ Strings
    default: 'user'
  },
  otp: String,
  otpExpires: Date
});

// دالة لتشفير كلمة المرور قبل حفظها في قاعدة البيانات
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// دالة لمقارنة كلمة المرور
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
