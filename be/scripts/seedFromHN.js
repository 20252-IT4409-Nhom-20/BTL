require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../src/models/itemModel');

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';
const FEED_TO_ENDPOINT = {
  top: 'topstories',
  new: 'newstories',
  best: 'beststories',
  ask: 'askstories',
  show: 'showstories',
  job: 'jobstories',
};
const MAX_COMMENT_DEPTH = 6;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

function toDoc(data) {
  return {
    id: data.id,
    type: data.type || 'story',
    by: data.by || '',
    time: data.time || Math.floor(Date.now() / 1000),
    title: data.title || '',
    url: data.url || '',
    text: data.text || '',
    parent: data.parent || null,
    kids: Array.isArray(data.kids) ? data.kids : [],
    score: data.score || 0,
    descendants: data.descendants || 0,
    dead: !!data.dead,
    deleted: !!data.deleted,
  };
}

async function upsertItem(data) {
  const doc = toDoc(data);
  await Item.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
  return doc;
}

async function walk(id, depth, seen, withComments) {
  if (seen.has(id)) return;
  seen.add(id);

  const data = await fetchJson(`${HN_BASE}/item/${id}.json`);
  if (!data) return;

  await upsertItem(data);

  if (!withComments) return;
  if (depth >= MAX_COMMENT_DEPTH) return;
  if (!Array.isArray(data.kids) || data.kids.length === 0) return;

  for (const kidId of data.kids) {
    try {
      await walk(kidId, depth + 1, seen, withComments);
    } catch (err) {
      console.warn(`  ! kid ${kidId} failed: ${err.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const count = parseInt(args[0], 10) || 10;
  const feedArg = (args[1] || 'top').toLowerCase();
  const withComments = !args.includes('--no-comments');

  const feedKey = FEED_TO_ENDPOINT[feedArg];
  if (!feedKey) {
    console.error(`Invalid feed "${feedArg}". Use one of: ${Object.keys(FEED_TO_ENDPOINT).join(', ')}`);
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing. Check .env');
    process.exit(1);
  }

  console.log(`Connecting to Mongo…`);
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected. Seeding top ${count} from "${feedArg}" (${withComments ? 'with' : 'no'} comments)…`);

  const ids = await fetchJson(`${HN_BASE}/${feedKey}.json`);
  const targetIds = (ids || []).slice(0, count);
  const seen = new Set();

  for (const id of targetIds) {
    const t0 = Date.now();
    try {
      await walk(id, 0, seen, withComments);
      console.log(`  ✓ ${id} (seen=${seen.size}, ${Date.now() - t0}ms)`);
    } catch (err) {
      console.warn(`  ✗ ${id} failed: ${err.message}`);
    }
  }

  console.log(`Done. Upserted ${seen.size} items total.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
