// Packages Imports
const { omit } = require("lodash");

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

// exports
exports.get_login_payload_data = get_login_payload_data;
