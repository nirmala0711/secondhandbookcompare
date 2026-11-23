const mongoose = require("mongoose");

const state = {
  isDbConnected: false,
  memoryUsers: [],
  memoryWishlist: [],
};

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/second_hand_books",
  )
  .then(() => {
    state.isDbConnected = true;
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });
module.exports = state;
