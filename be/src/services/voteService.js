const mongoose = require('mongoose');
const Vote = require('../models/voteModel');
const Item = require('../models/itemModel');

class VoteError extends Error {
    constructor(message, code = 'VOTE_ERROR', status = 400) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

function normalizeDirection(raw) {
    const n = Number(raw);
    if (n === 1 || n === -1) {
        return n;
    }
    throw new VoteError('direction must be 1 or -1', 'INVALID_DIRECTION', 400);
}

/**
 * Cast (or re-cast) a vote and update the target item's score atomically.
 *
 * Behavior matrix (existing.direction vs incoming direction):
 *   - none + d         -> insert vote, score += d
 *   - same direction   -> remove vote (toggle off), score -= d
 *   - opposite         -> flip vote, score += 2*d
 *
 * Returns { score, userVote } where userVote is 1, -1, or 0.
 */
async function castVote({ userId, itemId, direction }) {
    const dir = normalizeDirection(direction);

    if (!mongoose.isValidObjectId(itemId)) {
        throw new VoteError('Invalid item id', 'INVALID_ITEM_ID', 400);
    }

    const item = await Item.findById(itemId).select('_id');
    if (!item) {
        throw new VoteError('Item not found', 'ITEM_NOT_FOUND', 404);
    }

    const existing = await Vote.findOne({ user: userId, item: itemId });

    let scoreDelta;
    let nextUserVote;

    if (!existing) {
        // First-time vote
        await Vote.create({ user: userId, item: itemId, direction: dir });
        scoreDelta = dir;
        nextUserVote = dir;
    } else if (existing.direction === dir) {
        // Toggle off: undo the existing vote
        await Vote.deleteOne({ _id: existing._id });
        scoreDelta = -dir;
        nextUserVote = 0;
    } else {
        // Switch direction: flip the existing vote
        existing.direction = dir;
        await existing.save();
        scoreDelta = 2 * dir;
        nextUserVote = dir;
    }

    const updated = await Item.findByIdAndUpdate(
        itemId,
        { $inc: { score: scoreDelta } },
        { returnDocument: 'after', select: 'score' }
    );

    return {
        score: updated?.score ?? 0,
        userVote: nextUserVote,
        scoreDelta,
    };
}

/**
 * Look up the authenticated user's vote on a single item without changing it.
 * Returns { score, userVote } so the FE can render arrow state on load.
 */
async function getVoteState({ userId, itemId }) {
    if (!mongoose.isValidObjectId(itemId)) {
        throw new VoteError('Invalid item id', 'INVALID_ITEM_ID', 400);
    }

    const item = await Item.findById(itemId).select('score');
    if (!item) {
        throw new VoteError('Item not found', 'ITEM_NOT_FOUND', 404);
    }

    let userVote = 0;
    if (userId) {
        const vote = await Vote.findOne({ user: userId, item: itemId }).select('direction');
        if (vote) {
            userVote = vote.direction;
        }
    }

    return {
        score: item.score ?? 0,
        userVote,
    };
}

module.exports = {
    castVote,
    getVoteState,
    VoteError,
};
