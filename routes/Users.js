// package and other modules
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");

// Local imports
const { AdminAuth, UserAuth } = require("../middlewares/AuthValidator");
const messages = require("../config/messages");
const { pick } = require("lodash");
const { users } = require("../models/Users");
const { UploadToCloudinary } = require("../utils/Cloudinary");
const { ValidateRegister } = require("../middlewares/RegisterValidator");
const { ValidateLogin } = require("../middlewares/LoginValidator");

// Initialize router
const router = express.Router();

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Get List of all users in Database for Admin only
router.get("/users", AdminAuth, async (req, res) => {
  try {
    const usersList = await users.find(
      {},
      { name: 1, email: 1, profile_picture: 1 }
    );

    return res.status(200).send({
      Users: usersList,
      messsage: "This list shows all the users in the database.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Endpoint for Login
router.post("/login", ValidateLogin, async (req, res) => {
  try {
    // check if user exists
    const user = await users.findOne({
      email: req.body.email,
    });
    if (!user)
      return res.status(404).send({ message: messages.accountMissing });

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return res.status(400).send({ message: messages.invalidCredentials });

    // If request body has push_notification_token, update it in the database
    if (req.body.push_notification_token) {
      user.push_notification_token = req.body.push_notification_token;
      await user.save();
    }

    // Create userData
    const userData = pick(user.toObject(), [
      "name",
      "email",
      "auth_token",
      "_id",
      "profile_picture",
    ]);

    // Response
    return res
      .status(200)
      .send({ User: userData, message: "Logged in successfully.." });
  } catch (error) {
    // Error Response
    return res.status(500).send({ message: messages.serverError });
  }
});

// Endpoint for Register
router.post(
  "/register",
  upload.single("profile_picture"),
  ValidateRegister,
  async (req, res) => {
    try {
      // Check if user with same email already exists
      const user = await users.findOne({ email: req.body.email });
      if (user)
        return res.status(400).send({ message: messages.emailAlreadyInUse });

      // Else create new user instance
      const newUser = new users(req.body);

      // Upload profile_picture if present it req.body
      if (req.body.profile_picture) {
        // Destination for profile_picture
        const destination = `Kolegia/users/${newUser._id}/profile_picture`;

        // Upload profile_picture to cloudinary
        const uploadResponse = await UploadToCloudinary(
          req.body.profile_picture,
          destination
        );

        // If response is ok, update profile_picture in the database
        if (uploadResponse?.url?.length)
          newUser.profile_picture = uploadResponse.url;
        else return res.status(500).send({ message: messages.serverError });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);

      // Create auth_token for a user
      const auth_token = jwt.sign(
        {
          _id: newUser._id,
        },
        process.env.JWT_Key
      );

      // Assign the auth_token for the user
      newUser.auth_token = auth_token;

      // Save the user
      await newUser.save();

      // Create userData
      const newUserData = pick(newUser.toObject(), [
        "name",
        "email",
        "auth_token",
        "_id",
        "profile_picture",
      ]);

      // Return response
      return res.status(200).send({
        User: newUserData,
        message: "Your account has been created successfully..",
      });
    } catch (error) {
      // Error response
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Logout endpoint
router.delete("/logout", UserAuth, async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.body.user_details._id });
    if (!user)
      return res.status(404).send({ message: messages.accountMissing });

    user.PushNotificationToken = "";
    await user.save();

    return res.send({ message: messages.loggedtOut });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Change Password endpoint
router.put("/change-password", UserAuth, async (req, res) => {
  try {
    let user = await users.findOne({ _id: req.body.user_details._id });
    if (!user)
      return res.status(404).send({ message: messages.accountMissing });

    const CheckPassword = await bcrypt.compare(
      req.body.CurrentPassword,
      user.password
    );

    if (!CheckPassword)
      return res.status(400).send({ message: messages.currentPasswordError });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.NewPassword, salt);
    await user.save();

    return res.status(200).send({ message: messages.passwordChanged });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
