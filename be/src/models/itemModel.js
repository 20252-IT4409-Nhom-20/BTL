const mongoose = require('mongoose');

const ITEM_TYPES = ['story', 'comment', 'ask', 'show', 'job', 'poll', 'pollopt'];

const ItemSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ITEM_TYPES,
      default: 'story',
      index: true,
    },
    by: {
      type: String,
      default: '',
      index: true,
    },
    time: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    parent: {
      type: Number,
      default: null,
      index: true,
    },
    kids: {
      type: [Number],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
      index: true,
    },
    descendants: {
      type: Number,
      default: 0,
    },
    dead: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ItemSchema.index({ type: 1, score: -1 });
ItemSchema.index({ type: 1, time: -1 });

const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;
module.exports.ITEM_TYPES = ITEM_TYPES;
