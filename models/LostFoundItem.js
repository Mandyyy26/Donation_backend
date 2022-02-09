// Packages imports
const mongoose = require("mongoose");

// Local imports
const { lostFoundSchema } = require("../schemas/LostFoundItem");

// lostFoundItems Model
const lostFoundItems = mongoose.model("LostFoundItems", lostFoundSchema);

lostFoundItems.collection.createIndex({
  name: "text",
  description: "text",
  brand: "text",
  category: "text",
  color: "text",
});

// Exporting the lostFoundItems model
exports.lostFoundItems = lostFoundItems;
