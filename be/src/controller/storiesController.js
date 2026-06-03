const storiesService = require('../services/storiesService');

const CREATABLE_STORY_TYPES = new Set(['story', 'job', 'poll']);
const FEED_TYPES = new Set(['top', 'new', 'best', 'ask', 'show', 'job']);

async function getStories(req, res) {
  const { type } = req.params;
  if (!FEED_TYPES.has(type)) {
    return res.status(400).json({ message: 'Invalid story type' });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const itemType = FEED_TYPE_TO_ITEM_TYPE[type];
  const sort = FEED_SORT[type] || { score: -1 };

  try {
    const stories = await storiesService.getStories(type, page, limit);
    return res.json(stories);
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
    const item = await storiesService.getItemWithComments(id);
    if (!item) {
      return res.status(404).json({ message: `Item ${req.params.id} not found` });
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to read item' });
  }
}

function createStory(req, res) {
  const { title, url, text, type = 'story' } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!CREATABLE_STORY_TYPES.has(type)) {
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
