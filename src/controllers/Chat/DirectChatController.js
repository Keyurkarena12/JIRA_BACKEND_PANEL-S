import ChatRoom from "../../models/ChatRoom.js";
import User from "../../models/user.js";

export const getOrCreateDirectChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if room already exists
    let chatRoom = await ChatRoom.findOne({
      type: "private",
      $and: [
        { "participants.user": currentUserId },
        { "participants.user": userId }
      ]
    }).populate("participants.user", "name email avatar");

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        name: `private_${currentUserId}_${userId}`,
        type: "private",
        createdBy: currentUserId,
        participants: [
          { user: currentUserId, role: "admin" },
          { user: userId, role: "member" }
        ]
      });

      chatRoom = await ChatRoom.findById(chatRoom._id).populate("participants.user", "name email avatar");
    }

    res.status(200).json(chatRoom);
  } catch (error) {
    console.error("Error in getOrCreateDirectChat:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDirectConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const chatRooms = await ChatRoom.find({
      type: "private",
      "participants.user": currentUserId
    })
      .populate("participants.user", "name email avatar")
      .populate("lastMessage.sender", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json(chatRooms);
  } catch (error) {
    console.error("Error in getDirectConversations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ],
      _id: { $ne: req.user.id }
    }).select("name email avatar");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};