// package and other modules
const express = require("express");

// Local imports
const { UserAuth } = require("../middlewares/AuthValidator");
const { chats } = require("../models/Chats");
const messages = require("../config/messages");
const { Get_or_Create_ChatRoom } = require("../controllers/Chats");

// Initialize router
const router = express.Router();

// Get or Create a chat room between two users
router.post("/get-or-create-chat-room", UserAuth, async (req, res) => {
  try {
    if (!req.body.reciever_id)
      return res.status(400).send({ message: "Reciever id is required" });

    const chatRoom = await Get_or_Create_ChatRoom(
      req.body.user_details._id,
      req.body.reciever_id,
      req.body.initial_message ?? null
    );

    return res.send({ chat_room: chatRoom, message: "Chat Room Created" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

router.get("/get-chats", UserAuth, async (req, res) => {
  try {
    const user_id = req.body.user_details._id;
    // Get all chats of the user
    // Get objects in which the user_id is in participants array
    const allChats = await chats.aggregate([
      {
        $match: {
          participants: { $all: [user_id] },
        },
      },
      {
        $addFields: {
          other_user: {
            $filter: {
              input: "$participants",
              as: "participant",
              cond: { $ne: ["$$participant", user_id] },
            },
          },
        },
      },
      // Change other_user to user_details
      {
        $lookup: {
          from: "users",
          localField: "other_user",
          foreignField: "_id",
          as: "chatting_with",
        },
      },
      // change chatting_with array to object
      {
        $unwind: {
          path: "$chatting_with",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Remove unnecessary fields from chatting_with object
      {
        $project: {
          _id: 1,
          last_message: 1,
          chatting_with: {
            _id: "$chatting_with._id",
            name: "$chatting_with.name",
            profile_picture: "$chatting_with.profile_picture",
          },
        },
      },
    ]);

    return res.send({ Chats: allChats, message: "List of all chats" });
  } catch (error) {
    return res.status(500).send("Error");
  }
});

// export router
module.exports = router;
