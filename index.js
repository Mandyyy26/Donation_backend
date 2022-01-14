// Importing Packages
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Utils/Configs imports
const config = require("./config/config");
const messages = require("./config/messages");

// Routes imports
const BuySellItem = require("./routes/BuySellItem");
const Chats = require("./routes/Chats");
const EmailVerify = require("./routes/EmailVerify");
const LostFoundItems = require("./routes/LostFoundItems");
const RaisedHands = require("./routes/RaisedHands");
const Requirements = require("./routes/Requirements");
const User = require("./routes/Users");

// Connect to MongoDB
mongoose
  .connect(config.db_url, config.db_config)
  .then(() => console.log(`Connected to ${process.env.DB_Name} Mongo DB...`))
  .catch((error) => console.error(messages.serverError, error));

// Express app initialization
const app = express();

// Configuring Express app for production
require("./config/Production")(app);

// Configuring Express to use static files
app.use(express.static(path.join(__dirname, "/public")));

// Add routes
app.use(process.env.apiVersion + process.env.buysell, BuySellItem);
app.use(process.env.apiVersion + process.env.chats, Chats);
app.use(process.env.apiVersion + process.env.emailVerify, EmailVerify);
app.use(process.env.apiVersion + process.env.lostfound, LostFoundItems);
app.use(process.env.apiVersion + process.env.raisedhands, RaisedHands);
app.use(process.env.apiVersion + process.env.requirements, Requirements);
app.use(process.env.apiVersion + process.env.auth, User);

// App listening on port
app.listen(config.Port, () =>
  console.log(
    `Mode = ${process.env.NODE_ENV} and Listening on ${config.Port}..`
  )
);
