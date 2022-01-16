// Packages Imports
const { pick } = require("lodash");

// function to get the user data while logging in
function get_login_payload_data(user = {}) {
  // Create payload
  const payload = pick(user.toObject(), [
    "name",
    "email",
    "auth_token",
    "_id",
    "profile_picture",
  ]);

  return payload;
}

// exports
exports.get_login_payload_data = get_login_payload_data;
