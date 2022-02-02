// package and other modules
const express = require("express");

// Local imports
const messages = require("../config/messages");
const { notifications } = require("../models/Notifications");
const { UserAuth } = require("../middlewares/AuthValidator");
const { createNotification } = require("../middlewares/Notifications");

// Initialize router
const router = express.Router();

// get all notifications for user
router.get("/get-notifications", UserAuth, async (req, res) => {
  try {
    const all_notifications = await notifications.find(
      {
        notify_to: req.body.user_details._id,
      },
      {},
      {
        sort: { _id: -1 },
        projection: {
          __v: 0,
        },
      }
    );

    return res.send({
      notifications: all_notifications,
      message: "List of all the notifications for a user.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// create a new notificaiton
router.post("/create-new-notifications", UserAuth, async (req, res) => {
  try {
    const new_notification = await createNotification(req.body);

    if (new_notification.ok) {
      return res.send({
        notifications: new_notification.notification,
        message: "New Notification created successfully.",
      });
    }

    return res.status(500).send({ message: messages.serverError });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
