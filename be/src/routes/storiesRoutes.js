const express = require('express');
const storiesController = require('../controller/storiesController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Read endpoints (PR22 shape)
/**
 * @openapi
 * /api/stories/item/{id}:
 *   get:
 *     summary: Get a single item and its comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     responses:
 *       200:
 *         description: The item and its comments
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.get('/stories/item/:id', storiesController.getItem);
router.get('/stories/:type', storiesController.getStories);

// Write endpoints (PR21 shape, auth-gated)
router.post('/stories', auth, storiesController.createStory);
router.post('/comments', auth, storiesController.createComment);
router.put('/stories/:id/vote', auth, storiesController.voteStory);
router.delete('/stories/:id', auth, storiesController.deleteStory);

module.exports = router;
