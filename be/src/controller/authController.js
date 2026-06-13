const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const auth = require('../middleware/authMiddleware');
const APIError = require('../utils/APIError');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  const { username, email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    if (!username || !normalizedEmail || !password) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Username, email, and password are required');
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      throw new APIError(400, 'USER_EXISTS', 'User already exists');
    }

    const newUser = await User.create({ username, email: normalizedEmail, password, role: 'user' });
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { username, email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedUsername = String(username || '').trim();

  try {
    if (!password || (!normalizedEmail && !normalizedUsername)) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Credentials required');
    }

    const query = normalizedEmail
      ? { email: normalizedEmail }
      : { username: normalizedUsername };
    const user = await User.findOne(query);
    if (!user) {
      throw new APIError(400, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    if (user.isBanned) {
      throw new APIError(403, 'USER_BANNED', user.banReason ? `Account is banned: ${user.banReason}` : 'Account is banned');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new APIError(400, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ message: 'Login successful', token, user: userResponse });
  } catch (err) {
    return next(err);
  }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) throw new APIError(404, 'USER_NOT_FOUND', 'User not found');
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
