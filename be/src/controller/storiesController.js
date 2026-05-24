const express = require('express');

const router = express.Router();

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

const TYPE_TO_ENDPOINT = {
  top: 'topstories',
  new: 'newstories',
  best: 'beststories',
  ask: 'askstories',
  show: 'showstories',
  job: 'jobstories',
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Upstream ${res.status} for ${url}`);
  return res.json();
}

router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const endpoint = TYPE_TO_ENDPOINT[type];
  if (!endpoint) {
    return res.status(400).json({ message: 'Invalid story type' });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  try {
    const ids = await fetchJson(`${HN_BASE}/${endpoint}.json`);
    const sliced = (ids || []).slice(offset, offset + limit);
    const items = await Promise.all(
      sliced.map((id) => fetchJson(`${HN_BASE}/item/${id}.json`))
    );
    return res.json({ type, page, count: items.length, items: items.filter(Boolean) });
  } catch (err) {
    return res.status(502).json({ message: 'Failed to fetch stories', error: err.message });
  }
});

const MAX_COMMENT_DEPTH = 6;

async function fetchCommentTree(id, depth) {
  const node = await fetchJson(`${HN_BASE}/item/${id}.json`);
  if (!node) return null;
  if (depth >= MAX_COMMENT_DEPTH || !Array.isArray(node.kids) || node.kids.length === 0) {
    node.kids = [];
    return node;
  }
  const children = await Promise.all(
    node.kids.map((kidId) => fetchCommentTree(kidId, depth + 1))
  );
  node.kids = children.filter(Boolean);
  return node;
}

router.get('/item/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }
  try {
    const story = await fetchJson(`${HN_BASE}/item/${id}.json`);
    if (!story) return res.status(404).json({ message: 'Item not found' });
    const kidIds = Array.isArray(story.kids) ? story.kids : [];
    const comments = (
      await Promise.all(kidIds.map((kidId) => fetchCommentTree(kidId, 1)))
    ).filter(Boolean);
    const storyWithoutKids = { ...story, kids: [] };
    return res.json({ item: [storyWithoutKids, ...comments] });
  } catch (err) {
    return res.status(502).json({ message: 'Failed to fetch item', error: err.message });
  }
});

module.exports = router;
