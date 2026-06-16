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
// Keep the tree shallow + narrow. Real HN threads have 600+ deep comments
// which bloat the DB and slow the read path. Migration to ObjectId refs
// (scripts/migrateToObjectId.js) runs after seeding, so the saved numeric
// id / parent / kids stay as Numbers until then.
const MAX_COMMENT_DEPTH = 2;
const MAX_COMMENTS_PER_ITEM = 5;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${url}`);
  }
  return res.json();
}

function toDoc(data) {
  return {
    id: data.id,
    deleted: Boolean(data.deleted),
    type: data.type || 'story',
    by: data.by || '',
    time: data.time || Math.floor(Date.now() / 1000),
    text: data.text || '',
    dead: Boolean(data.dead),
    parent: data.parent ?? null,
    poll: data.poll,
    kids: Array.isArray(data.kids) ? data.kids : [],
    url: data.url || '',
    score: data.score || 0,
    title: data.title || '',
    parts: Array.isArray(data.parts) ? data.parts : [],
    descendants: data.descendants || 0,
  };
}

async function upsertItem(data) {
  const doc = toDoc(data);
  // Raw collection write bypasses Mongoose strict mode so numeric `id`,
  // `parent`, and `kids` persist as Numbers until migrateToObjectId.js
  // rewrites them into ObjectId refs.
  await Item.collection.updateOne(
    { id: doc.id },
    { $set: doc, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  return doc;
}

async function walkItem(id, depth, seen, withComments) {
  if (seen.has(id)) {
    return;
  }
  seen.add(id);

  const data = await fetchJson(`${HN_BASE}/item/${id}.json`);
  if (!data) {
    return;
  }

  await upsertItem(data);

  if (!withComments || depth >= MAX_COMMENT_DEPTH || !Array.isArray(data.kids)) {
    return;
  }

  const limitedKids = data.kids.slice(0, MAX_COMMENTS_PER_ITEM);
  for (const kidId of limitedKids) {
    try {
      await walkItem(kidId, depth + 1, seen, withComments);
    } catch (err) {
      console.warn(`kid ${kidId} failed: ${err.message}`);
    }
  }
}

async function seedFromHN() {
  const args = process.argv.slice(2);
  const count = parseInt(args[0], 10) || 10;
  const feedArg = (args[1] || 'top').toLowerCase();
  const withComments = !args.includes('--no-comments');
  const reset = args.includes('--reset');
  const feedEndpoint = FEED_TO_ENDPOINT[feedArg];

  if (!feedEndpoint) {
    console.error(`Invalid feed "${feedArg}". Use one of: ${Object.keys(FEED_TO_ENDPOINT).join(', ')}`);
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing. Check .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  if (reset) {
    const { deletedCount } = await Item.collection.deleteMany({});
    console.log(`--reset: dropped ${deletedCount} existing items`);
  }

  const ids = await fetchJson(`${HN_BASE}/${feedEndpoint}.json`);
  const targetIds = (Array.isArray(ids) ? ids : []).slice(0, count);
  const seen = new Set();

  for (const id of targetIds) {
    try {
      await walkItem(id, 0, seen, withComments);
      console.log(`seeded ${id}; total seen=${seen.size}`);
    } catch (err) {
      console.warn(`item ${id} failed: ${err.message}`);
    }
  }

  console.log(`Done. Upserted ${seen.size} items total.`);
  await mongoose.disconnect();
}

seedFromHN().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
