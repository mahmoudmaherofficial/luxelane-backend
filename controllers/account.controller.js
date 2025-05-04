// controllers/accountController.js
const User = require('../models/user.model');


exports.getAccount = async (req, res) => {
  console.log('GET /account - Start');
  try {
    const userId = req.user?.userId;
    console.log('User ID from token:', userId);

    if (!userId) {
      console.log('GET /account - Error: Missing user ID');
      return res.status(401).json({ error: 'Unauthorized: Missing user ID in token' });
    }

    const user = await User.findById(userId).select('-password');
    console.log('Found user:', user);

    if (!user) {
      console.log('GET /account - Error: User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('GET /account - Success');
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching account:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.updateAccount = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.userId;

    // Check if username already exists for another user
    if (updates.username) {
      const existingUsername = await User.findOne({
        _id: { $ne: userId },
        username: updates.username
      });

      if (existingUsername) {
        return res.status(409).json({
          error: 'Username is already in use'
        });
      }
    }

    // Check if email already exists for another user 
    if (updates.email) {
      const existingEmail = await User.findOne({
        _id: { $ne: userId },
        email: updates.email
      });

      if (existingEmail) {
        return res.status(409).json({
          error: 'Email is already in use'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
