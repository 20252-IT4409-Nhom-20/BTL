const fs = require('fs/promises');
const path = require('path');

const MOCK_DATA_DIR = path.resolve(__dirname, '../../../be-mock/mock_data');
const STORY_TYPES = new Set(['story', 'ask', 'show', 'job', 'poll']);

async function readMockJson(fileName) {
  const filePath = path.join(MOCK_DATA_DIR, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function getStories(req, res) {
  try {
    const stories = await readMockJson('topstories.json');
    return res.json(stories);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to read top stories' });
  }
}

async function getItem(req, res) {
  try {
    const item = await readMockJson(`${req.params.id}.json`);
    return res.json(item);
  } catch (err) {
    return res.status(404).json({ message: `Item ${req.params.id} not found` });
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
