const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// تعريف الـ Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: '' },
  role: {
    type: Number,
    enum: [1995, 1996, 2004], // تحديد الأدوار كـ Strings
    default: 'user'
  },
});

// دالة لتشفير كلمة المرور قبل حفظها في قاعدة البيانات
// قبل حفظ أي مستخدم في قاعدة البيانات
userSchema.pre('save', async function (next) {
  // تحقق من أن كلمة المرور لم يتم تعديلها
  if (!this.isModified('password')) {
    // إذا لم تكن كلمة المرور قد تم تعديلها، فما يهمنا هو حفظها في قاعدة البيانات
    return next();
  }

  // لتشفير كلمة المرور، نحتاج إلى ملح يولد عشوائيًا
  const salt = await bcrypt.genSalt(10);

  // بعد ذلك، نستخدم دالة bcrypt.hash() لتشفير كلمة المرور
  // ونعطيها كلمة المرور الأصلية، والملح، ثم ننتظر النتيجة
  this.password = await bcrypt.hash(this.password, salt);

  // بعد أن ننهي تشفير كلمة المرور، نستدعي الدالة next() لكي نواصل تنفيذ
  // باقي كود المiddleware
  next();
});

// دالة لمقارنة كلمة المرور
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
