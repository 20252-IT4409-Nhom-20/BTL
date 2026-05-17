const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

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

const PORT = 3000;

// Serve the mock stories data
app.get("/api/topstories", (req, res) => {
  const filePath = path.join(__dirname, "mock_data", "topstories.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to read stories data" });
      console.error("Error reading file:", err);
      return;
    }

    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

// Serve individual item data
app.get("/api/item/:id", (req, res) => {
  const itemId = req.params.id;
  const filePath = path.join(__dirname, "mock_data", `${itemId}.json`);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(404).json({ error: `Item ${itemId} not found` });
      console.error(`Error reading file for item ${itemId}:`, err);
      return;
    }

    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

// Optional: Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log(`Stories available at http://localhost:${PORT}/api/topstories`);
  console.log(`Item available at http://localhost:${PORT}/api/item/44057612`);
});
