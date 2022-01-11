// Packages imports
const mongoose = require("mongoose");

// Local imports
const { emailVerifySchema } = require("../schemas/EmailVerifyRequests");

// EmailVerify Model
const emailVerify = mongoose.model("EmailVerify", emailVerifySchema);

// Exporting the EmailVerify model
exports.emailVerify = emailVerify;
