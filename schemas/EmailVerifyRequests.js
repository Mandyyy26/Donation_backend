// Packages imports
const mongoose = require("mongoose");

const TIME_LIMIT = 600; // 10 minutes

// emailVerify Schema
const emailVerifySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  created_datetime: {
    type: Date,
    default: Date.now,
    expires: TIME_LIMIT,
  },
});

// Exporting the emailVerify schema
exports.emailVerifySchema = emailVerifySchema;
