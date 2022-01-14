// package and other modules
const express = require("express");

// Local imports
const { AdminAuth, UserAuth } = require("../middlewares/AuthValidator");
const { chats } = require("../models/Chats");
const messages = require("../config/messages");

// Initialize router
const router = express.Router();

// Get List of all ChatRooms in Database for Admin only
router.get("/get-all-chat-rooms", AdminAuth, async (req, res) => {
  try {
    const chatRoomList = await chats.find();

    return res.status(200).send({
      Chats: chatRoomList,
      message: "List of all chat rooms in database.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get or Create a chat room between two users
router.post("/get-or-create-chat-room", UserAuth, async (req, res) => {
  try {
    return res.send({ message: "Success" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
