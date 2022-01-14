// Packages imports
const mongoose = require("mongoose");

// lostFoundSchema
const lostFoundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  estimated_price: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  posted_on: {
    type: Date,
    default: Date.now,
  },
  files: {
    type: Array,
    default: [],
  },
  purchase_datetime: {
    type: Date,
    required: true,
  },
  posted_by: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
  related_questions: {
    type: Array,
    default: [],
  },
  found_by_someone: {
    type: Boolean,
    default: false,
  },
});

// Exporting the lostFoundSchema
exports.lostFoundSchema = lostFoundSchema;
