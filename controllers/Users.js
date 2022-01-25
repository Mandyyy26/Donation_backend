// Packages Imports
const { omit } = require("lodash");

// Local imports
const { JWT_Sign } = require("./JWT");

// function to get the user data while logging in
function get_login_payload_data(user = {}) {
  // Create payload
  const payload = omit(user.toObject(), [
    "password",
    "admin",
    "__v",
    "push_notification_token",
  ]);

  return payload;
}

// encode the user data using JWT key
function get_encoded_data(user = {}) {
  // Create payload
  const payload = get_login_payload_data(user);

  // Return the encoded data
  return JWT_Sign(payload);
}

// create an auth_token by encoding the _id for a user
function get_auth_token(_id) {
  const auth_token = JWT_Sign({ _id });

  return auth_token;
}

// exports
exports.get_login_payload_data = get_login_payload_data;
exports.get_encoded_data = get_encoded_data;
exports.get_auth_token = get_auth_token;
