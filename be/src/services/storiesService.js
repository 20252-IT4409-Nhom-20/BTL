const Item = require('../models/itemModel');
const mongoose = require('mongoose');

const MAX_COMMENT_DEPTH = 6;
const EDIT_WINDOW_SECONDS = 2 * 60 * 60; // 2 hours
const EDITABLE_FIELDS = new Set(['text', 'title', 'url']);

class StoriesServiceError extends Error {
    constructor(message, code = 'STORIES_ERROR', status = 400) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

// Replace author/text on deleted items so the FE shows "[deleted]" while the
// comment tree shape (parent/child relationships) stays intact.
function maskDeleted(item) {
    if (!item) return item;
    if (item.deleted) {
        return { ...item, by: '[deleted]', text: '[deleted]', url: '', title: '' };
    }
    return item;
}

// Owner = original author (by username). Admin always allowed.
function canMutate(item, actor) {
    if (!actor) return false;
    if (actor.role === 'admin') return true;
    return Boolean(actor.username) && item.by === actor.username;
}

function isWithinEditWindow(item) {
    if (!item.time) return false;
    const nowSec = Math.floor(Date.now() / 1000);
    return nowSec - item.time <= EDIT_WINDOW_SECONDS;
}

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
        items: items.map(maskDeleted),
    };
}

// Build comment tree with one Mongo query per depth level instead of one per node.
async function buildCommentTree(rootId) {
    const byId = new Map();
    let frontier = [rootId];
    let depth = 0;

    while (frontier.length > 0 && depth < MAX_COMMENT_DEPTH) {
        // Keep deleted items in the tree so child references survive;
        // masking is applied at the response layer.
        const level = await Item.find({
            parent: { $in: frontier },
            dead: { $ne: true },
        })
            .sort({ time: 1 })
            .lean();

        if (level.length === 0) {
            break;
        }

        for (const comment of level) {
            byId.set(comment._id.toString(), { ...maskDeleted(comment), kids: [] });
        }

        frontier = level.map((comment) => comment._id);
        depth += 1;
    }

    const topLevel = [];

    for (const comment of byId.values()) {
        if (comment.parent && comment.parent.toString() === rootId.toString()) {
            topLevel.push(comment);
            continue;
        }

        const parent = byId.get(comment.parent ? comment.parent.toString() : '');
        if (parent) {
            parent.kids.push(comment);
        }
    }

    return topLevel;
}

// Return the story and its top-level comments in the shape currently used by FE.
async function getItemWithComments(id) {
    const story = await Item.findById(id).lean();

    if (!story) {
        return null;
    }

    const comments = await buildCommentTree(story._id);
    const maskedStory = maskDeleted({
        ...story,
        kids: story.kids || [],
    });

    return {
        item: [maskedStory, ...comments],
    };
}

async function createStory(data) {
    const story = new Item({
        ...data,
        type: 'story',
        descendants: 0,
        kids: [],
        time: Math.floor(Date.now() / 1000),
    });
    return await story.save();
}

async function createComment(data) {
    const { parentId, rootId, text, by } = data;
    
    // Create the comment
    const comment = new Item({
        type: 'comment',
        text,
        by,
        parent: parentId,
        time: Math.floor(Date.now() / 1000),
    });
    const savedComment = await comment.save();

    // 1. Update the immediate parent's kids array
    await Item.updateOne(
        { _id: parentId },
        { $push: { kids: savedComment._id } }
    );
    
    // 2. Increment descendants count on the root story
    if (rootId) {
        await Item.updateOne(
            { _id: rootId },
            { $inc: { descendants: 1 } }
        );
    }
    
    return savedComment;
}

/**
 * Soft-delete an item. Content fields are blanked at the response layer via
 * maskDeleted; the document itself is preserved so the comment tree's
 * parent/child relationships remain intact.
 */
async function deleteItem({ itemId, actor }) {
    if (!mongoose.isValidObjectId(itemId)) {
        throw new StoriesServiceError('Invalid item id', 'INVALID_ITEM_ID', 400);
    }

    const item = await Item.findById(itemId);
    if (!item) {
        throw new StoriesServiceError('Item not found', 'ITEM_NOT_FOUND', 404);
    }

    if (item.deleted) {
        return { ok: true, alreadyDeleted: true, itemId: item._id };
    }

    if (!canMutate(item, actor)) {
        throw new StoriesServiceError('Forbidden', 'FORBIDDEN', 403);
    }

    if (!isWithinEditWindow(item)) {
        throw new StoriesServiceError(
            `Modifications are only allowed within ${EDIT_WINDOW_SECONDS / 3600} hours of creation`,
            'EDIT_WINDOW_EXPIRED',
            400
        );
    }

    item.deleted = true;
    await item.save();

    return { ok: true, itemId: item._id, deleted: true };
}

/**
 * Edit whitelisted fields on an item. Requires owner or admin actor,
 * and creation timestamp within the edit window. Stamps editedBy/editedAt.
 */
async function editItem({ itemId, updates, actor }) {
    if (!mongoose.isValidObjectId(itemId)) {
        throw new StoriesServiceError('Invalid item id', 'INVALID_ITEM_ID', 400);
    }

    const item = await Item.findById(itemId);
    if (!item) {
        throw new StoriesServiceError('Item not found', 'ITEM_NOT_FOUND', 404);
    }

    if (item.deleted) {
        throw new StoriesServiceError('Cannot edit a deleted item', 'ITEM_DELETED', 400);
    }

    if (!canMutate(item, actor)) {
        throw new StoriesServiceError('Forbidden', 'FORBIDDEN', 403);
    }

    if (!isWithinEditWindow(item)) {
        throw new StoriesServiceError(
            `Edit window expired (${EDIT_WINDOW_SECONDS / 3600}h after creation)`,
            'EDIT_WINDOW_EXPIRED',
            400
        );
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(updates || {})) {
        if (EDITABLE_FIELDS.has(key) && typeof value === 'string') {
            sanitized[key] = value;
        }
    }

    if (Object.keys(sanitized).length === 0) {
        throw new StoriesServiceError(
            `No editable fields supplied (allowed: ${[...EDITABLE_FIELDS].join(', ')})`,
            'NO_EDITABLE_FIELDS',
            400
        );
    }

    Object.assign(item, sanitized);
    item.editedBy = actor.id;
    item.editedAt = new Date();
    await item.save();

    return item.toObject();
}

module.exports = {
    getStories,
    getItemWithComments,
    createStory,
    createComment,
    deleteItem,
    editItem,
    StoriesServiceError,
};
