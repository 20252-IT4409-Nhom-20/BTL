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

  try {
    const stories = await storiesService.getStories(type, page, limit);
    return res.json(stories);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to read stories' });
  }
}

async function getItem(req, res) {
  const id = req.params.id;
  
  try {
    const item = await storiesService.getItemWithComments(id);
    if (!item) {
      return res.status(404).json({ message: `Item ${id} not found` });
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to read item' });
  }
}

async function createStory(req, res) {
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

  try {
    const story = await storiesService.createStory({
        title,
        url,
        text,
        type,
        by: req.user?.username || 'anonymous'
    });
    return res.status(201).json(story);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create story' });
  }
}

async function createComment(req, res) {
  const { text, parent_id: parentId, root_id: rootId } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  if (!parentId) {
    return res.status(400).json({ message: 'Parent ID is required' });
  }

  try {
    const comment = await storiesService.createComment({
        text,
        parentId,
        rootId,
        by: req.user?.username || 'anonymous'
    });
    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create comment' });
  }
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
