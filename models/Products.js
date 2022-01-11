// Packages imports
const mongoose = require("mongoose");

// Local imports
const { productSchema } = require("../schemas/Products");

// Product Model
const products = mongoose.model("Product", productSchema);

// Exporting the Product model
exports.products = products;
