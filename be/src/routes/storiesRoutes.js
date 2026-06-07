const express = require('express');
const storiesController = require('../controller/storiesController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Read endpoints (PR22 shape)
router.get('/stories/item/:id', storiesController.getItem);
router.get('/stories/:type', storiesController.getStories);

// Write endpoints (PR21 shape, auth-gated)
router.post('/stories', auth, storiesController.createStory);
router.post('/comments', auth, storiesController.createComment);
router.put('/stories/:id/vote', auth, storiesController.voteStory);
router.delete('/stories/:id', auth, storiesController.deleteStory);
router.delete('/items/:id', auth, storiesController.deleteStory);
// PATCH for partial updates (text/title/url). Items can be stories or
// comments, so the same handler covers all three aliases.
router.patch('/stories/:id', auth, storiesController.editItem);
router.patch('/items/:id', auth, storiesController.editItem);
router.patch('/comments/:id', auth, storiesController.editItem);

module.exports = router;
