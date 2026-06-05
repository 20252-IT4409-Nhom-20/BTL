const Item = require('../models/itemModel');

function canModifyItem(user, item) {
  if (!user || !item) return false;

  if (['admin', 'moderator'].includes(user.role)) {
    return true;
  }

  return item.by === user.username;
}

async function assertCanModifyItem(user, itemId) {
  const item = await Item.findById(itemId).select('by');

  if (!item) {
    const err = new Error('Item not found');
    err.statusCode = 404;
    throw err;
  }

  if (!canModifyItem(user, item)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return item;
}

module.exports = {
  canModifyItem,
  assertCanModifyItem,
};
