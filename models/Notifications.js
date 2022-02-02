// Packages imports
const mongoose = require("mongoose");

// Local imports
const { notificationsSchema } = require("../schemas/Notifications");

// Product Model
const notifications = mongoose.model("Notifications", notificationsSchema);

// Exporting the Product model
exports.notifications = notifications;
