const Item = require('../models/itemModel');

const MAX_COMMENT_DEPTH = 6;

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

// Build comment tree with one Mongo query per depth level instead of one per node.
async function buildCommentTree(rootId) {
    const byId = new Map();
    let frontier = [rootId];
    let depth = 0;

    while (frontier.length > 0 && depth < MAX_COMMENT_DEPTH) {
        const level = await Item.find({
            parent: { $in: frontier },
            deleted: { $ne: true },
            dead: { $ne: true },
        })
            .sort({ time: 1 })
            .lean();

        if (level.length === 0) {
            break;
        }

        for (const comment of level) {
            byId.set(comment.id, { ...comment, kids: [] });
        }

        frontier = level.map((comment) => comment.id);
        depth += 1;
    }

    const topLevel = [];

    for (const comment of byId.values()) {
        if (comment.parent === rootId) {
            topLevel.push(comment);
            continue;
        }

        const parent = byId.get(comment.parent);
        if (parent) {
            parent.kids.push(comment);
        }
    }

    return topLevel;
}

// Return the story and its top-level comments in the shape currently used by FE.
async function getItemWithComments(id) {
    const story = await Item.findOne({ id }).lean();

    if (!story) {
        return null;
    }

    const comments = await buildCommentTree(story.id);

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
