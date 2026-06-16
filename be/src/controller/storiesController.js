const storiesService = require('../services/storiesService');
const APIError = require('../utils/APIError');

const CREATABLE_STORY_TYPES = new Set(['story', 'job', 'poll']);
const FEED_TYPES = new Set(['top', 'new', 'best', 'ask', 'show', 'job']);

async function getStories(req, res, next) {
  const { type } = req.params;

  try {
    if (!FEED_TYPES.has(type)) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Invalid story type');
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const stories = await storiesService.getStories(type, page, limit);
    return res.json(stories);
  } catch (err) {
    return next(err);
  }
}

async function getItem(req, res, next) {
  const id = req.params.id;
  
  try {
    const item = await storiesService.getItemWithComments(id);
    if (!item) {
      throw new APIError(404, 'NOT_FOUND', `Item ${id} not found`);
    }

    return res.json(item);
  } catch (err) {
    return next(err);
  }
}

async function createStory(req, res, next) {
  const { title, url, text, type = 'story' } = req.body || {};

  try {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Title is required');
    }

    if (!CREATABLE_STORY_TYPES.has(type)) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Invalid story type');
    }
    if (!url && !text) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Either url or text is required');
    }

    const story = await storiesService.createStory({
        title,
        url,
        text,
        type,
        by: req.user?.username || 'anonymous'
    });
    return res.status(201).json(story);
  } catch (err) {
    return next(err);
  }
}

async function createComment(req, res, next) {
  const { text, parent_id: parentId, root_id: rootId } = req.body || {};

  try {
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Comment text is required');
    }

    if (!parentId) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Parent ID is required');
    }

    const comment = await storiesService.createComment({
        text,
        parentId,
        rootId,
        by: req.user?.username || 'anonymous'
    });
    return res.status(201).json(comment);
  } catch (err) {
    return next(err);
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

async function deleteStory(req, res) {
  try {
    const result = await storiesService.deleteItem({
      itemId: req.params.id,
      actor: req.user,
    });
    return res.json(result);
  } catch (err) {
    if (err instanceof storiesService.StoriesServiceError) {
      return res.status(err.status).json({ message: err.message, code: err.code });
    }
    console.error('[DeleteStory Error]:', err);
    return res.status(500).json({ message: 'Failed to delete item' });
  }
}

async function editItem(req, res) {
  try {
    const item = await storiesService.editItem({
      itemId: req.params.id,
      updates: req.body || {},
      actor: req.user,
    });
    return res.json(item);
  } catch (err) {
    if (err instanceof storiesService.StoriesServiceError) {
      return res.status(err.status).json({ message: err.message, code: err.code });
    }
    console.error('[EditItem Error]:', err);
    return res.status(500).json({ message: 'Failed to edit item' });
  }
}

module.exports = {
  getStories,
  getItem,
  createStory,
  createComment,
  voteStory,
  deleteStory,
  editItem,
};
