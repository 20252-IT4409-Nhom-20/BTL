const express = require("express");
const storiesController = require("../controller/storiesController");
const auth = require("../middleware/authMiddleware");

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
 *           example: "6a186aad83c04f266b07bc46"
 *         description: The item ID
 *     responses:
 *       200:
 *         description: The item and its comments
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.get("/stories/item/:id", storiesController.getItem);

/**
 * @openapi
 * /api/stories/{type}:
 *   get:
 *     summary: Get a feed of stories
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [top, new, best, ask, show, job]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: List of stories
 */
router.get("/stories/:type", storiesController.getStories);

// Write endpoints (PR21 shape, auth-gated)
/**
 * @openapi
 * /api/stories:
 *   post:
 *     summary: Create a new story
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [story, job, poll]
 *     responses:
 *       201:
 *         description: Story created
 */
router.post("/stories", auth, storiesController.createStory);

/**
 * @openapi
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, parent_id]
 *             properties:
 *               text:
 *                 type: string
 *               parent_id:
 *                 type: string
 *               root_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post("/comments", auth, storiesController.createComment);

/**
 * @openapi
 * /api/stories/{id}/vote:
 *   put:
 *     summary: Vote on a story
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vote successful
 */
router.put("/stories/:id/vote", auth, storiesController.voteStory);

/**
 * @openapi
 * /api/stories/{id}:
 *   delete:
 *     summary: Delete a story (owner or admin, within edit window)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story deleted
 *       403:
 *         description: Forbidden
 */
router.delete("/stories/:id", auth, storiesController.deleteStory);
// Items can be stories or comments; same handler covers both.
router.delete("/items/:id", auth, storiesController.deleteStory);

/**
 * @openapi
 * /api/stories/{id}:
 *   patch:
 *     summary: Edit a story or comment (owner or admin, within edit window)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated
 *       400:
 *         description: Edit window expired or no editable fields
 *       403:
 *         description: Forbidden
 */
router.patch("/stories/:id", auth, storiesController.editItem);
router.patch("/items/:id", auth, storiesController.editItem);
router.patch("/comments/:id", auth, storiesController.editItem);

module.exports = router;
