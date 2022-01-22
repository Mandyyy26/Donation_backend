// Import the required modules
const jwt = require("jsonwebtoken");

// Imported static modules
const messages = require("../config/messages");
const { users } = require("../models/Users");

// function to check if the request has admin authorization
const AdminAuth = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;

    if (authToken) {
      let tokenArray = authToken.split(" ");

      if (tokenArray.length !== 2)
        return res
          .status(403)
          .send({ message: { message: messages.tokenMissing } });

      const Token = jwt.verify(tokenArray[1], process.env.JWT_Key);

      if (Token) {
        const checkUser = await users.findById(Token._id);

        if (!checkUser)
          return res.status(403).send({ message: messages.unauthorized });

        if (checkUser.admin === false)
          return res.status(403).send({ message: messages.unauthorized });

        next();
      } else {
        return res.status(403).send({ message: messages.unauthorized });
      }
    } else {
      return res.status(403).send({ message: messages.tokenMissing });
    }
  } catch (error) {
    return res.status(501).send({ message: messages.serverError });
  }
};

// function to check if the request has user authorization
const UserAuth = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;

    if (authToken) {
      let result = authToken.split(" ");

      if (result.length !== 2)
        return res.status(403).send({ message: messages.tokenMissing });

      const Token = jwt.verify(result[1], process.env.JWT_Key);

      if (Token) {
        const checkUser = await users.findById(Token._id);

        if (!checkUser)
          return res.status(403).send({ message: messages.unauthorized });

        req.body.user_details = {
          _id: checkUser._id,
          name: checkUser.name,
          email: checkUser.email,
        };

        next();
      } else return res.status(403).send({ message: messages.unauthorized });
    } else return res.status(403).send({ message: messages.tokenMissing });
  } catch (error) {
    return res.status(501).send({ message: messages.serverError });
  }
};

// Exports
exports.AdminAuth = AdminAuth;
exports.UserAuth = UserAuth;
