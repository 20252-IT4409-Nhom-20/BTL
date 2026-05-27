const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const STORY_TYPES = new Set(["story", "ask", "show", "job", "poll"]);
const FEED_TYPES = new Set(["top", "new", "best", "ask", "show", "job"]);

function requireMockAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Missing Authorization header. Use a Bearer token for write endpoints.",
    });
  }
  req.user = { id: "mock-user" };
  return next();
}

function validateStoryPayload(req, res, next) {
  const { title, url, text, type = "story" } = req.body || {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (!STORY_TYPES.has(type)) {
    return res.status(400).json({ message: "Invalid story type" });
  }

  if (!url && !text) {
    return res.status(400).json({ message: "Either url or text is required" });
  }

  return next();
}

function validateCommentPayload(req, res, next) {
  const { text } = req.body || {};

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  return next();
}

// Request and response logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(
    `📥 request from ${req.ip || req.connection.remoteAddress} -> ${req.method} ${req.path}`,
  );

  // Capture the original send method
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const emoji = statusCode >= 400 ? "❌" : "✅";
    console.log(
      `${emoji} response (${statusCode}) [${duration}ms] -> served ${req.path}`,
    );
    return originalSend.call(this, data);
  };

  next();
});

const PORT = process.env.PORT || 3000;

// Serve stories by feed type (parameterized endpoint)
app.get("/api/stories/:type", (req, res) => {
  const { type } = req.params;
  if (!FEED_TYPES.has(type)) {
    return res.status(400).json({ message: "Invalid story type" });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const filePath = path.join(__dirname, "mock_data", "topstories.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read stories" });
    }

    try {
      const all = JSON.parse(data);
      const items = (Array.isArray(all) ? all : []).slice(offset, offset + limit);
      res.json({ type, page, count: items.length, items });
    } catch (parseErr) {
      res.status(500).json({ message: "Failed to parse stories data" });
      console.error("Error parsing JSON:", parseErr);
    }
  });
});

// Serve individual item data
app.get("/api/stories/item/:id", (req, res) => {
  const itemId = req.params.id;
  const filePath = path.join(__dirname, "mock_data", `${itemId}.json`);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).json({ message: `Item ${itemId} not found` });
    }

    try {
      const itemData = JSON.parse(data);
      // Mock stores items as [story, ...comments]; pass through under { item } envelope.
      const item = Array.isArray(itemData) ? itemData : [itemData];
      res.json({ item });
    } catch (parseErr) {
      res.status(500).json({ message: "Failed to parse item data" });
      console.error(`Error parsing item ${itemId}:`, parseErr);
    }
  });
});

app.post("/api/stories", requireMockAuth, validateStoryPayload, (req, res) => {
  const { title, url, text, type = "story" } = req.body;
  const now = Math.floor(Date.now() / 1000);

  res.status(201).json({
    message: "Story creation placeholder. Persist this to the database later.",
    story: {
      id: now,
      type,
      title: title.trim(),
      url: url || undefined,
      text: text || undefined,
      by: req.user.id,
      time: now,
      score: 0,
      descendants: 0,
    },
  });
});

app.post(
  "/api/stories/:id/comments",
  requireMockAuth,
  validateCommentPayload,
  (req, res) => {
    const { text, parent_id: parentId } = req.body;
    const now = Math.floor(Date.now() / 1000);

    res.status(201).json({
      message: "Comment creation placeholder. Persist this to the database later.",
      comment: {
        id: now,
        type: "comment",
        by: req.user.id,
        time: now,
        text: text.trim(),
        parent: Number(parentId || req.params.id),
        kids: [],
      },
    });
  },
);

app.put("/api/stories/:id/vote", requireMockAuth, (req, res) => {
  res.json({
    message: "Vote placeholder. Toggle the authenticated user vote in the database later.",
    storyId: Number(req.params.id),
    voted: true,
    scoreDelta: 1,
  });
});

app.delete("/api/stories/:id", requireMockAuth, (req, res) => {
  res.json({
    message: "Delete story placeholder. Enforce author/admin ownership in the database later.",
    storyId: Number(req.params.id),
    deleted: true,
  });
});

// Optional: Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log(`Stories available at http://localhost:${PORT}/api/stories/:type (type: top, new, best, ask, show, job)`);
  console.log(`Example: http://localhost:${PORT}/api/stories/top?page=1&limit=30`);
  console.log(`Item available at http://localhost:${PORT}/api/stories/item/44057612`);
  console.log(`Write placeholders available under http://localhost:${PORT}/api/stories`);
});
