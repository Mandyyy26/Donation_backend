// Packages imports
const mongoose = require("mongoose");

// notifications Schema
const notificationsSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  related_item: {
    type: String,
    required: true,
  },
  created_datetime: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

// Exporting the notifications schema
exports.notificationsSchema = notificationsSchema;
