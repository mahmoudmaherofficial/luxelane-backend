const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getFileUrl } = require('../config/multer.config');

const createTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion || 0 },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const handleError = (res, err, customMessage = null) => {
  const errorMessage = customMessage || err.message || 'An error occurred';
  return res.status(500).json({ error: errorMessage });
};

exports.register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      image: req.imageUrl || '',
      role: 2004,
      tokenVersion: 0,
    });

    await user.save();

    const { accessToken, refreshToken } = createTokens(user);

    res.cookie('accessToken', accessToken, {
      // httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.status(201).json({ accessToken, user: { id: user._id, username, email, role: user.role } });
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
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { accessToken, refreshToken } = createTokens(user);
    console.log('Tokens generated:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

    res.cookie('accessToken', accessToken, {
      // httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    console.log('Cookies set:', res.getHeaders()['set-cookie']);

    res.status(200).json({ accessToken, user: { id: user._id, username: user.username, email, role: user.role } });
  } catch (err) {
    handleError(res, err, 'Error occurred during login');
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      });
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    if (decoded.tokenVersion !== (user.tokenVersion || 0)) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      });
      return res.status(403).json({ error: 'Invalid refresh token version' });
    }

    const { accessToken } = createTokens(user);

    res.cookie('accessToken', accessToken, {
      // httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      });
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('accessToken', {
      // httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    });

    req.user = null;

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during logout' });
  }
};
