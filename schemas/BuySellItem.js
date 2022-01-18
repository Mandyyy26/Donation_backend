// Packages imports
const mongoose = require("mongoose");

// BuySellItemSchema
const buySellItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
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
  files: {
    type: Array,
    default: [],
  },
  posted_by: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
  rating: {
    type: Number,
    default: 0,
  },
});

// Exporting the BuySellItemSchema
exports.buySellItemSchema = buySellItemSchema;
