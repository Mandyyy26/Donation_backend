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
  posted_on: { type: Date, default: Date.now },
  files: {
    type: Array,
    default: [],
  },
  posted_by: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
});

// Exporting the BuySellItemSchema
exports.buySellItemSchema = buySellItemSchema;
