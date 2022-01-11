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

// Product Category Type
const product_type = ["BUY_SELL", "LOST_FOUND"];

// Product Schema
const productSchema = new mongoose.Schema({
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
  post_datetime: {
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
  category: {
    type: String,
    enum: product_categories,
    default: "Other",
  },
  type: {
    type: String,
    enum: product_type,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  stock_count: {
    type: Number,
    default: 1,
  },
  related_questions: {
    type: Array,
    default: [],
  },
  found_by_someone: {
    type: Boolean,
    default: false,
  },
});

// Exporting the Product schema
exports.productSchema = productSchema;
exports.product_categories = product_categories;
