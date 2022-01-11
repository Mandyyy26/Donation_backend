// package and other modules
const express = require("express");

// Local imports
const { AdminAuth } = require("../middlewares/AuthValidator");
const { emailVerify } = require("../models/EmailVerify");
const messages = require("../config/messages");

// Initialize router
const router = express.Router();

// Get List of all Email verify Requests in Database for Admin only
router.get("/", AdminAuth, async (req, res) => {
  try {
    const emailVerifyList = await emailVerify.find();

    return res.status(200).send({ EmailVerifyRequests: emailVerifyList });
  } catch (error) {
    return res.status(500).send(messages.serverError);
  }
});

// Send a Email verify Request to a user
router.post("/send-an-email-verification-request", async (req, res) => {
  try {
    return res.send("Success");
  } catch (error) {
    return res.status(500).send(messages.serverError);
  }
});

// Verify a Email verify Request
router.post("/verify-an-email-request", async (req, res) => {
  try {
    return res.send("Success");
  } catch (error) {
    return res.status(500).send(messages.serverError);
  }
});

// export router
module.exports = router;
