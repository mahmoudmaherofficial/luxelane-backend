// controllers/userController.js
const User = require('../models/User');

// الحصول على جميع المستخدمين (الأدمن فقط)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // استعلام للحصول على المستخدمين
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)

    // حساب العدد الإجمالي للمستخدمين
    const totalUsers = await User.countDocuments()

    // حساب العدد الإجمالي للصفحات
    const totalPages = Math.ceil(totalUsers / limit)

    // // سجل المعلومات للتحقق
    // console.log(`Total Users: ${totalUsers}, Total Pages: ${totalPages}, Current Page: ${page}, Limit: ${limit}`)

    res.json({
      data: users,
      totalPages,
      currentPage: page,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// الحصول على مستخدم واحد حسب الـ ID (للأدمن فقط)
exports.getUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// إنشاء مستخدم جديد (الأدمن فقط)
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // تحقق من وجود المستخدم
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// تعديل بيانات مستخدم (الأدمن فقط)
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// حذف مستخدم (الأدمن فقط)
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
