// Packages imports
const mongoose = require("mongoose");

// Requirement Schema
const requirementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  posted_on: {
    type: Date,
    default: Date.now,
  },
  posted_by: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
  expires_on: {
    type: Date,
    required: true,
  },
  is_expired: {
    type: Boolean,
    default: false,
  },
});

// Exporting the Requirement schema
exports.requirementSchema = requirementSchema;
