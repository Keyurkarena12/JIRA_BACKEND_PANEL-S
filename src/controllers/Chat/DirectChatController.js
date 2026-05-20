import ChatRoom from "../../models/ChatRoom.js";
import User from "../../models/user.js";

export const getDirectChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const workspaceId = req.query.workspaceId && req.query.workspaceId !== 'undefined' && req.query.workspaceId !== 'null' ? req.query.workspaceId : null;
    const projectId = req.query.projectId && req.query.projectId !== 'undefined' && req.query.projectId !== 'null' ? req.query.projectId : null;

    // Check if room already exists
    const query = {
      type: "private",
      $and: [
        { "participants.user": currentUserId },
        { "participants.user": userId }
      ]
    };

    if (workspaceId) {
      query.workspace = workspaceId;
    } else {
      query.workspace = null;
    }

    if (projectId) {
      query.project = projectId;
    } else {
      query.project = null;
    }

    const chatRoom = await ChatRoom.findOne(query).populate("participants.user", "name email avatar");
    res.status(200).json(chatRoom);
  } catch (error) {
    console.error("Error in getDirectChat:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createDirectChat = async (req, res) => {
  try {
    const { userId, workspaceId, projectId } = req.body;
    const currentUserId = req.user.id;

    let username = await User.findById(userId).select("name");
    let currentUsername = await User.findById(currentUserId).select("name");

    const roomData = {
      name: `private_${currentUsername.name},${username.name}`,
      type: "private",
      createdBy: currentUserId,
      participants: [
        { user: currentUserId, role: "admin" },
        { user: userId, role: "member" }
      ]
    };

    if (workspaceId) roomData.workspace = workspaceId;
    if (projectId) roomData.project = projectId;

    let chatRoom = await ChatRoom.create(roomData);
    chatRoom = await ChatRoom.findById(chatRoom._id).populate("participants.user", "name email avatar");

    res.status(201).json(chatRoom);
  } catch (error) {
    console.error("Error in createDirectChat:", error);
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