// Local imports
const { chats } = require("../models/Chats");
const { messages } = require("../models/Messages");

// Fucntion to returnn chatRoom between two users
// or create a chatRoom if it does not exist
async function Get_or_Create_ChatRoom(user_one, user_two, initialMessage) {
  try {
    // Check if Room already exists
    // Check if user_one and user_two is present in the participants array
    let chatRoom = await chats.findOne({
      participants: {
        $all: [user_one, user_two],
      },
    });

    // if chatRoom is not found, create a new chatRoom
    if (!chatRoom) {
      chatRoom = new chats({
        participants: [user_one, user_two],
      });

      await chatRoom.save();
    }

    // If chatRoom exists, then create a new message if initialMessage is not null
    if (initialMessage !== null) {
      let message = new messages({
        room_id: chatRoom._id,
        sender_id: user_one,
        reciever_id: user_two,
        ...initialMessage,
      });

      chatRoom.last_message = message;

      await message.save();
      await chatRoom.save();
    }

    return { room: chatRoom };
  } catch (error) {
    return error;
  }
}

// Exports
exports.Get_or_Create_ChatRoom = Get_or_Create_ChatRoom;
