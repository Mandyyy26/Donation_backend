// Packages imports
const mongoose = require("mongoose");

// messages Schema
const messagesSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
  sender_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  reciever_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  message_type: {
    type: String,
    enum: ["text", "file"],
    default: "text",
  },
  message_datetime: {
    type: Date,
    default: () => Date.now(),
  },
  read: {
    type: Boolean,
    default: false,
  },
  message_file: {
    name: String,
    mimeType: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/jpg", "video/mp4"],
    },
    url: String,
    preview_url: String,
  },
});

// Exporting the messages schema
exports.messagesSchema = messagesSchema;
