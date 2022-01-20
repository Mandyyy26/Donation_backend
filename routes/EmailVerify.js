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

    return res.status(200).send({
      EmailVerifyRequests: emailVerifyList,
      message: "List of all the email verification requests in database.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Send a Email verify Request to a user
router.post("/send-an-email-verification-request", async (req, res) => {
  try {
    // Check if email is present in the request body
    if (!req.body.email)
      return res.status(400).send({ message: messages.emailRequired });

    // check if there's a user

    return res.send({ message: "Success" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Verify a Email verify Request
router.post("/verify-an-email-request", async (req, res) => {
  try {
    return res.send({ message: "Success" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
