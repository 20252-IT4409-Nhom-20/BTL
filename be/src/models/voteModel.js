const mongoose = require('mongoose');

const VOTE_DIRECTIONS = [1, -1];

// Records one user's vote on one item. A user can only have a single vote
// per item; toggling/switching is handled by the service layer.
const VoteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
            index: true,
        },

        direction: {
            type: Number,
            enum: VOTE_DIRECTIONS,
            required: true,
        },
    },
    { timestamps: true }
);

// Enforce one vote per user per item at the database level.
VoteSchema.index({ user: 1, item: 1 }, { unique: true });

const Vote = mongoose.model('Vote', VoteSchema);

module.exports = Vote;
module.exports.VOTE_DIRECTIONS = VOTE_DIRECTIONS;
