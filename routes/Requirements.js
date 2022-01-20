// package and other modules
const express = require("express");

// Local imports
const { AdminAuth, UserAuth } = require("../middlewares/AuthValidator");
const messages = require("../config/messages");
const { requirements } = require("../models/Requirements");
const { ValidateRequirement } = require("../middlewares/RequirementsValidator");

// Initialize router
const router = express.Router();

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

// Edit a requirement in Database
router.put(
  "/edit-a-requirement",
  UserAuth,
  ValidateRequirement,
  async (req, res) => {
    try {
      // check if requirement_id is present in body
      if (!req.body.requirement_id)
        return res.status(400).send({ message: "Requirement ID is required" });

      // Check if requirement exists
      const requirement = await requirements.findById(req.body.requirement_id);
      if (!requirement)
        return res.status(404).send({ message: "Requirement not found" });

      // Constants
      let requirement_owner = requirement.posted_by;
      let user_id = req.body.user_details._id;

      // Check if user is the owner of requirement
      if (requirement_owner.toString() !== user_id._id.toString())
        return res.status(401).send({ message: messages.unauthorized });

      // Update the requirement
      if (req.body.title) requirement.title = req.body.title;
      if (req.body.description) requirement.description = req.body.description;

      // Save the requirement
      await requirement.save();

      // Response
      return res.send({
        requirement: requirement,
        message: "Requirement Updated",
      });
    } catch (error) {
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Delete a requirement
router.delete("/delete-requirement", UserAuth, async (req, res) => {
  try {
    // Check if requirement_id is present in body
    if (!req.body.requirement_id)
      return res.status(400).send({ message: "Requirement ID is required" });

    // Check if requirement exists
    const requirement = await requirements.findById(req.body.requirement_id);
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
    // find all requirements posted by user and also sort it by _id
    const requirementsList = await requirements
      .find({
        posted_by: req.body.user_details._id,
      })
      .sort({ _id: -1 });

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
