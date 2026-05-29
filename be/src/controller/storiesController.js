const Item = require('../models/itemModel');

const STORY_TYPES = new Set(['story', 'ask', 'show', 'job', 'poll']);
const FEED_TYPES = new Set(['top', 'new', 'best', 'ask', 'show', 'job']);

const FEED_TYPE_TO_ITEM_TYPE = {
  top: 'story',
  new: 'story',
  best: 'story',
  ask: 'ask',
  show: 'show',
  job: 'job',
};

const FEED_SORT = {
  top: { score: -1, time: -1 },
  new: { time: -1 },
  best: { score: -1 },
  ask: { score: -1, time: -1 },
  show: { score: -1, time: -1 },
  job: { time: -1 },
};

const MAX_COMMENT_DEPTH = 6;

/**
 * BFS-build comment tree under rootId.
 * One Mongo query per depth level using { parent: { $in: [...] } } —
 * O(depth) round-trips instead of O(N).
 */
async function buildCommentTree(rootId) {
  const byId = new Map();
  let frontier = [rootId];
  let depth = 0;

  while (frontier.length > 0 && depth < MAX_COMMENT_DEPTH) {
    const level = await Item.find({
      parent: { $in: frontier },
      deleted: { $ne: true },
      dead: { $ne: true },
    })
      .sort({ time: 1 })
      .lean();
    if (level.length === 0) break;

    for (const node of level) {
      node.kids = [];
      byId.set(node.id, node);
    }
    frontier = level.map((n) => n.id);
    depth += 1;
  }

  // Wire children into their parent's kids array
  const topLevel = [];
  for (const node of byId.values()) {
    if (node.parent === rootId) {
      topLevel.push(node);
    } else {
      const parent = byId.get(node.parent);
      if (parent) parent.kids.push(node);
    }
  }
  return topLevel;
}

async function getStories(req, res) {
  const { type } = req.params;
  if (!FEED_TYPES.has(type)) {
    return res.status(400).json({ message: 'Invalid story type' });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const itemType = FEED_TYPE_TO_ITEM_TYPE[type];
  const sort = FEED_SORT[type] || { score: -1 };

  try {
    const items = await Item.find({
      type: itemType,
      parent: null,
      deleted: { $ne: true },
      dead: { $ne: true },
    })
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .lean();
    return res.json({ type, page, count: items.length, items });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to read stories' });
  }
}

async function getItem(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }
  try {
    const root = await Item.findOne({ id }).lean();
    if (!root) {
      return res.status(404).json({ message: `Item ${id} not found` });
    }
    
    const comments = await buildCommentTree(id);
    root.kids = [];
    return res.json({ item: [root, ...comments] });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to read item' });
  }
}

function createStory(req, res) {
  const { title, url, text, type = 'story' } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!STORY_TYPES.has(type)) {
    return res.status(400).json({ message: 'Invalid story type' });
  }

  if (!url && !text) {
    return res.status(400).json({ message: 'Either url or text is required' });
  }

  const now = Math.floor(Date.now() / 1000);

  return res.status(201).json({
    message: 'Story creation placeholder. Persist this to the database later.',
    story: {
      id: now,
      type,
      title: title.trim(),
      url: url || undefined,
      text: text || undefined,
      by: req.user?.id || 'authenticated-user',
      time: now,
      score: 0,
      descendants: 0,
    },
  });
}

function createComment(req, res) {
  const { text, parent_id: parentId } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  const now = Math.floor(Date.now() / 1000);

  return res.status(201).json({
    message: 'Comment creation placeholder. Persist this to the database later.',
    comment: {
      id: now,
      type: 'comment',
      by: req.user?.id || 'authenticated-user',
      time: now,
      text: text.trim(),
      parent: Number(parentId || req.params.id),
      kids: [],
    },
  });
}

function voteStory(req, res) {
  return res.json({
    message: 'Vote placeholder. Toggle the authenticated user vote in the database later.',
    storyId: Number(req.params.id),
    voted: true,
    scoreDelta: 1,
  });
}

function deleteStory(req, res) {
  return res.json({
    message: 'Delete story placeholder. Enforce author/admin ownership in the database later.',
    storyId: Number(req.params.id),
    deleted: true,
  });
}

module.exports = {
  getStories,
  getItem,
  createStory,
  createComment,
  voteStory,
  deleteStory,
};
