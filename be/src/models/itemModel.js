const mongoose = require('mongoose');

const ITEM_TYPES = ['job', 'story', 'comment', 'poll', 'pollopt'];

const ItemSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },

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
            type: Number,
            index: true,
        },

        poll: {
            type: Number,
        },

        kids: {
            type: [Number],
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

ItemSchema.index({ type: 1, score: -1, time: -1 });
ItemSchema.index({ parent: 1, time: 1 });

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
module.exports.ITEM_TYPES = ITEM_TYPES;
