const mongoose = require('mongoose');

const ITEM_TYPES = ['job', 'story', 'comment', 'poll', 'pollopt'];

// Stores every Hacker News entity in one collection. The `type` field tells
// whether a document is a story, comment, job, poll, or poll option.
const ItemSchema = new mongoose.Schema(
    {

        deleted: {
            type: Boolean,
            default: false,
        },

        type: {
            type: String,
            enum: ITEM_TYPES,
            required: true,
            index: true,
        },

        by: {
            type: String,
            trim: true,
            index: true,
        },

        time: {
            type: Number,
            index: true,
        },

        text: {
            type: String,
            default: '',
        },

        dead: {
            type: Boolean,
            default: false,
        },

        parent: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
            ref: 'Item',
        },

        poll: {
            type: Number,
        },

        kids: {
            // Store child item ids in MongoDB. API services expand these ids
            // into nested objects before sending data to the frontend.
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Item',
            default: [],
        },

        url: {
            type: String,
            trim: true,
        },

        score: {
            type: Number,
            default: 0,
            index: true,
        },

        title: {
            type: String,
            trim: true,
        },

        parts: {
            type: [Number],
            default: [],
        },

        descendants: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Feed and comment-tree queries depend on these common access patterns.
ItemSchema.index({ type: 1, score: -1, time: -1 });
ItemSchema.index({ parent: 1, time: 1 });

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
module.exports.ITEM_TYPES = ITEM_TYPES;
