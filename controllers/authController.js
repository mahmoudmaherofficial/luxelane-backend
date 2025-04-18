const User = require('../models/User');
const jwt = require('jsonwebtoken');

// دالة لإنشاء التوكن
const createToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// دالة الموحدة للتعامل مع الأخطاء
const handleError = (res, err, customMessage = null) => {
  const errorMessage = customMessage || err.message || 'An error occurred';
  return res.status(400).json({ error: errorMessage });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const profile_image = req.file ? `/uploads/${req.file.filename}` : '';

    const user = await User.create({
      username,
      email,
      password,
      profile_image,
      role: 2004 // Role: User
    });

    const token = createToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    handleError(res, err, 'Error occurred while registering the user');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = createToken(user);
    res.status(200).json({ token, user });
  } catch (err) {
    handleError(res, err, 'Error occurred during login');
  }
};

exports.getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
