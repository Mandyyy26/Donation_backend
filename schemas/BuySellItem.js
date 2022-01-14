// Packages imports
const mongoose = require("mongoose");

// Product categories
const product_categories = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Health & Beauty",
  "Automotive",
  "Books & Audible",
  "Other",
];

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
  category: {
    type: String,
    enum: product_categories,
    default: "Other",
  },
  available: {
    type: Boolean,
    default: true,
  },
  stock_count: {
    type: Number,
    default: 1,
  },
  rating: {
    type: Number,
    default: 0,
  },
});

// Exporting the BuySellItemSchema
exports.buySellItemSchema = buySellItemSchema;
exports.product_categories = product_categories;
