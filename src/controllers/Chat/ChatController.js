import ChatRoom from "../../models/ChatRoom.js";
import Message from "../../models/Message.js";
import Workspace from "../../models/workspace.js";

export const getOrCreateWorkspaceChat = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    // Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Find general chat for this workspace
    let chatRoom = await ChatRoom.findOne({
      workspace: workspaceId,
      type: "workspace_general"
    });

    // If not exists, create it
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        name: "General",
        type: "workspace_general",
        workspace: workspaceId,
        createdBy: userId,
        participants: workspace.members.map(m => ({ 
          user: m.user, 
          role: m.role === 'owner' ? 'admin' : 'member' 
        }))
      });
    } else {
      // Ensure current user is in participants
      const isParticipant = chatRoom.participants.some(p => p.user.toString() === userId.toString());
      if (!isParticipant) {
        const workspaceMember = workspace.members.find(m => m.user.toString() === userId.toString());
        chatRoom.participants.push({
          user: userId,
          role: workspaceMember?.role === 'owner' ? 'admin' : 'member'
        });
        await chatRoom.save();
      }
    }


    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { chatRoom: roomId };
    if (before) {
      query.createdAt = { $lt: before };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("sender", "name email profilePicture")
      .lean();

    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatRooms = await ChatRoom.find({
      "participants.user": userId,
      isActive: true
    }).sort({ "lastMessage.timestamp": -1 });

    res.status(200).json(chatRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
