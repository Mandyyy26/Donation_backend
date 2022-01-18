// package and other modules
const express = require("express");

// Local imports
const { AdminAuth, UserAuth } = require("../middlewares/AuthValidator");
const { Get_or_Create_ChatRoom } = require("../controllers/Chats");
const { lostFoundItems } = require("../models/LostFoundItem");
const messages = require("../config/messages");
const { raisedHands } = require("../models/RaisedHands");

// Initialize router
const router = express.Router();

// Get List of all Raised Hands in Database for Admin only
router.get("/", AdminAuth, async (req, res) => {
  try {
    const raisedHandsList = await raisedHands.find();

    return res.status(200).send({
      RaisedHands: raisedHandsList,
      message: "List of all the raised Hands in database",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// raise a hand endpoint
router.post("/raise-hand-on-an-item", UserAuth, async (req, res) => {
  try {
    if (!req.body.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // Check if product exists
    const product = await lostFoundItems.findById(req.body.product_id);
    if (!product)
      return res.status(400).send({ message: messages.product_id_required });

    // Raised hand user and owner should not be same
    if (req.body.user_details._id.toString() === product.posted_by.toString())
      return res
        .status(400)
        .send({ message: "You cannot raise your own hand" });

    // Check if user has already raised a hand on this product
    const checkRaise = await raisedHands.findOne({
      product_id: req.body.product_id,
      raised_by: req.body.user_details._id,
    });
    if (checkRaise)
      return res.status(400).send({ message: messages.already_raised_hands });

    // Else create the raised hand
    const raisedHand = await raisedHands(req.body);
    raisedHand.raised_by = req.body.user_details._id;
    raisedHand.product_owner_id = product.posted_by;

    let product_details = {
      _id: product._id,
      name: product.name,
      description: product.description,
      files: product.files,
    };

    raisedHand.product_details = product_details;
    await raisedHand.save();

    // return the raised hand
    return res.send({
      raisedHand: raisedHand,
      message: "Sucessfully raised a hand on this item",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Accept the raised hand
router.post("/accept-raised-hand", UserAuth, async (req, res) => {
  try {
    // Check if Raised hand request exists
    const raisedHand = await raisedHands.findById(req.body._id);
    if (!raisedHand)
      return res.status(400).send({ message: messages.raised_hand_not_found });

    // Constants
    const owner = req.body.user_details._id;
    const raised_by = raisedHand.raised_by;

    // Raised hand owner and user should not be same
    if (owner.toString() === raised_by.toString())
      return res
        .status(400)
        .send({ message: "You cannot accept your own request" });

    // construct a message text from the answers array by looping thrugh it and leave a space between each answer
    let message = "";

    // loop through the answers array and append each answer to the message
    if (raisedHand.answers.length > 0) {
      for (let i = 0; i < raisedHand.answers.length; i++) {
        message += `${i + 1}.) ${raisedHand.answers[i].question} \n`;
        message += `Ans. ${raisedHand.answers[i].answer}\n`;
      }
    }

    // get_or_create the chatRoom
    const getChatRoom = await Get_or_Create_ChatRoom(raised_by, owner, {
      message,
    });

    // Delete the raised hand request as soon as it is accepted
    await raisedHand.delete();

    // return the chat room
    return res.send({
      room_id: getChatRoom.room._id,
      message: "Accepted the Raised hand request",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Reject the raised hand
router.delete("/reject-raised-hand", async (req, res) => {
  try {
    // Check if Raised hand request exists
    const raisedHand = await raisedHands.findById(req.body._id);
    if (!raisedHand)
      return res.status(400).send({ message: messages.raised_hand_not_found });

    // Delete the raised hand request
    await raisedHand.delete();

    return res.send({ message: "Request Rejected" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
