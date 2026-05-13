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

  try {
    const ids = await fetchJson(`${HN_BASE}/${endpoint}.json`);
    const sliced = (ids || []).slice(0, limit);
    const items = await Promise.all(
      sliced.map((id) => fetchJson(`${HN_BASE}/item/${id}.json`))
    );
    return res.json({ type, count: items.length, items: items.filter(Boolean) });
  } catch (err) {
    return res.status(502).json({ message: 'Failed to fetch stories', error: err.message });
  }
});

router.get('/item/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }
  try {
    const item = await fetchJson(`${HN_BASE}/item/${id}.json`);
    return res.json({ item });
  } catch (err) {
    return res.status(502).json({ message: 'Failed to fetch item', error: err.message });
  }
});

module.exports = router;
