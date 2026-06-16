const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const APIError = require('../utils/APIError');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new APIError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id || decoded?.userId || decoded?._id;
    if (!userId) {
      throw new APIError(401, 'UNAUTHORIZED', 'Invalid token payload');
    }

    const user = await User.findById(userId).select('username role isBanned');
    if (!user) {
      throw new APIError(401, 'UNAUTHORIZED', 'User not found');
    }

    if (user.isBanned) {
      throw new APIError(403, 'USER_BANNED', 'Account is banned');
    }

    req.userId = userId;
    req.user = {
      id: userId,
      username: user.username,
      role: user.role || decoded?.role || 'user',
    };

    return next();
  } catch (err) {
    if (err instanceof APIError) {
      return next(err);
    }

    return next(new APIError(401, 'UNAUTHORIZED', 'Invalid or expired token'));

  }
};
