const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('../src/models/itemModel');

dotenv.config();

const fs = require('fs');
const path = require('path');

const MOCK_DATA_DIR = path.resolve(__dirname, '../../be-mock/mock_data');


async function readJSONFile(fileName) {
    const filePath = path.join(MOCK_DATA_DIR, fileName);
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
}
seedItems().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});


function normalizeItem(raw, parentId) {
    const kids = Array.isArray(raw.kids)
        ? raw.kids.map((kid) => (typeof kid === 'number' ? kid : kid.id))
        : [];

    const parts = Array.isArray(raw.parts)
        ? raw.parts.map((part) => (typeof part === 'number' ? part : part.id))
        : [];

    return {
        id: raw.id,
        deleted: Boolean(raw.deleted),
        type: raw.type || (raw.title || raw.url ? 'story' : 'comment'),
        by: raw.by,
        time: raw.time,
        text: raw.text || '',
        dead: Boolean(raw.dead),
        parent: raw.parent ?? parentId,
        poll: raw.poll,
        kids,
        url: raw.url,
        score: raw.score || 0,
        title: raw.title,
        parts,
        descendants: raw.descendants || 0,
    };
}


function flattenItem(raw, parentId, result = []) {
    if (!raw || typeof raw.id !== 'number') {
        return result;
    }

    const normalized = normalizeItem(raw, parentId);
    result.push(normalized);

    if (Array.isArray(raw.kids)) {
        raw.kids.forEach((kid) => {
            if (typeof kid === 'object') {
                flattenItem(kid, raw.id, result);
            }
        });
    }

    return result;
}

async function seedItems() {
    const topStories = await readJSONFile('topstories.json');
    const itemDetail = await readJSONFile('44057612.json');

    const [story, ...comments] = itemDetail;

    const flattened = [];

    flattened.push(
        normalizeItem({
            ...story,
            kids: comments.map((comment) => comment.id),
        })
    );

    comments.forEach((comment) => {
        flattenItem(comment, story.id, flattened);
    });


    console.log('topstories:', topStories.length);
    console.log('item detail:', itemDetail.length);
    console.log('flattened:', flattened.length);

    await mongoose.connect(process.env.MONGO_URI);

    await Item.bulkWrite(
        flattened.map((item) => ({
            updateOne: {
                filter: { id: item.id },
                update: { $set: item },
                upsert: true,
            },
        }))
    );

    console.log(`Seeded ${flattened.length} items`);

    await mongoose.disconnect();
}
