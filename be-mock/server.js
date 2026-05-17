const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const PORT = 3000;

// Serve the mock stories data
app.get("/api/topstories.json", (req, res) => {
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

// Optional: Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log(
    `Stories available at http://localhost:${PORT}/api/topstories.json`,
  );
});
