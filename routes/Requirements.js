// package and other modules
const express = require("express");

// Local imports
const { AdminAuth, UserAuth } = require("../middlewares/AuthValidator");
const messages = require("../config/messages");
const { requirements } = require("../models/Requirements");
const { ValidateRequirement } = require("../middlewares/RequirementsValidator");

// Initialize router
const router = express.Router();

// Constants
const MAX_TIME_LIMIT = 30; // in days

// Get List of all requirements in Database for Admin only
router.get("/", AdminAuth, async (req, res) => {
  try {
    const requirementsList = await requirements.find();

    return res.status(200).send({
      Requirements: requirementsList,
      message: "This list shows list of requirments in Database",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Create a new requirement in Database
router.post(
  "/create-a-requirement",
  UserAuth,
  ValidateRequirement,
  async (req, res) => {
    try {
      const newRequirement = new requirements(req.body);

      newRequirement.posted_by = req.body.user_details._id;

      newRequirement.expires_on = req.body.expires_on
        ? req.body.expires_on
        : new Date(new Date().setDate(new Date().getDate() + MAX_TIME_LIMIT));

      await newRequirement.save();

      return res.send({
        requirement: newRequirement,
        message: "New Requirement Created",
      });
    } catch (error) {
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Delete a requirement
router.delete("/delete-requirement", UserAuth, async (req, res) => {
  try {
    // Check if requirement exists
    const requirement = await requirements.findById(req.body._id);
    if (!requirement)
      return res.status(404).send({ message: "Requirement Not Found" });

    const owner_id = requirement.posted_by;
    const user_id = req.body.user_details._id;

    // check if posted_by is same as user_details._id
    if (owner_id.toString() !== user_id.toString())
      return res.status(401).send({ message: messages.unauthorized });

    // Delete requirement
    await requirement.delete();

    return res.send({ message: "Requirement deleted successfully" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get all requirements posted by user
router.get("/get-own-requirements", UserAuth, async (req, res) => {
  try {
    const requirementsList = await requirements.find({
      posted_by: req.body.user_details._id,
    });

    return res.status(200).send({
      Requirements: requirementsList,
      message: "List of all requirements posted by you.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
