const Item = require('../models/itemModel');

// Translate a feed name from the route into a MongoDB query.
function getFeedQuery(type) {
    if (type === 'job') {
        return { type: 'job', deleted: false, dead: false };
    }

    if (type === 'ask') {
        return {
            type: 'story',
            deleted: false,
            dead: false,
            title: /^Ask HN/i,
        };
    }

    if (type === 'show') {
        return {
            type: 'story',
            deleted: false,
            dead: false,
            title: /^Show HN/i,
        };
    }

    return {
        type: 'story',
        deleted: false,
        dead: false,
    };
}

// Keep feed ordering in one place so controllers do not know query details.
function getFeedSort(type) {
    if (type === 'new') {
        return { time: -1 };
    }

    return { score: -1, time: -1 };
}

// Return one paginated feed using the same response envelope as the mock API.
async function getStories(type, page = 1, limit = 30) {
    const offset = (page - 1) * limit;

    const items = await Item.find(getFeedQuery(type))
        .sort(getFeedSort(type))
        .skip(offset)
        .limit(limit)
        .lean();

    return {
        type,
        page,
        count: items.length,
        items,
    };
}

// Expand child ids into nested comment objects for the frontend comment page.
async function buildCommentTree(ids = []) {
    if (!ids.length) return [];

    const comments = await Item.find({ id: { $in: ids } }).lean();
    const byId = new Map(comments.map((comment) => [comment.id, comment]));

    return Promise.all(
        ids
            .map((id) => byId.get(id))
            .filter(Boolean)
            .map(async (comment) => ({
                ...comment,
                kids: await buildCommentTree(comment.kids || []),
            }))
    );
}

// Return the story and its top-level comments in the shape currently used by FE.
async function getItemWithComments(id) {
    const story = await Item.findOne({ id }).lean();

    if (!story) {
        return null;
    }

    const comments = await buildCommentTree(story.kids || []);

    return {
        item: [
            {
                ...story,
                kids: story.kids || [],
            },
            ...comments,
        ],
    };
}

module.exports = {
    getStories,
    getItemWithComments,
};
