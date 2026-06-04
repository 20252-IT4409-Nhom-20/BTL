require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/userModel");
const Item = require("../src/models/itemModel");

async function testRead() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.\n");

    // --- Users ---
    const users = await User.find({}).limit(2).lean();
    console.log(`--- Users (${users.length} found) ---`);
    if (users.length > 0) {
      console.dir(users, { depth: null, colors: true });
    }

    // --- Items (Stories/Comments/etc) ---
    const items = await Item.find({}).limit(3).lean();
    console.log(`\n--- Items (${items.length} found) ---`);
    if (items.length > 0) {
      console.dir(items, { depth: null, colors: true });
    }
  } catch (error) {
    console.error("Error reading from database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nConnection closed.");
  }
}

testRead();
