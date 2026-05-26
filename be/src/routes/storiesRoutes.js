const express = require('express');
const storiesController = require('../controller/storiesController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

const STORY_LIST_ENDPOINTS = [
  '/topstories',
  '/newstories',
  '/beststories',
  '/askstories',
  '/showstories',
  '/jobstories',
];

router.get(STORY_LIST_ENDPOINTS, storiesController.getStories);
router.get('/item/:id', storiesController.getItem);
router.post('/stories', auth, storiesController.createStory);
router.post('/stories/:id/comments', auth, storiesController.createComment);
router.put('/stories/:id/vote', auth, storiesController.voteStory);
router.delete('/stories/:id', auth, storiesController.deleteStory);

module.exports = router;
