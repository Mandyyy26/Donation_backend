// Packages imports
const mongoose = require("mongoose");

// lostFoundSchema
const lostFoundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  posted_on: {
    type: Date,
    default: () => Date.now(),
  },
  files: {
    type: Array,
    default: [],
  },
  posted_by: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
  found_by_someone: {
    type: Boolean,
    default: false,
  },
});

// Exporting the lostFoundSchema
exports.lostFoundSchema = lostFoundSchema;
