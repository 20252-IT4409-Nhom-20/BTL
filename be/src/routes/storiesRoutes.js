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
router.get('/stories/:id/vote', auth, storiesController.getVote);
// Items can be stories or comments; same handlers cover both.
router.put('/items/:id/vote', auth, storiesController.voteStory);
router.get('/items/:id/vote', auth, storiesController.getVote);
router.delete('/stories/:id', auth, storiesController.deleteStory);

module.exports = router;
