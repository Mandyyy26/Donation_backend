const { notifications } = require("../models/Notifications");

// create a new notificaiton
async function createNotification(notification_data) {
  try {
    const new_notification = new notifications(notification_data);
    await new_notification.save();

    return { ok: true, notification: new_notification };
  } catch (error) {
    console.log(error);
    return { ok: false, notification: null };
  }
}

// exports
exports.createNotification = createNotification;
