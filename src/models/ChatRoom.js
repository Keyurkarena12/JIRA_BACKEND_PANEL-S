import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    
    description: {
      type: String,
      trim: true
    },

    type: {
      type: String,
      enum: ["workspace_general", "workspace_specific", "project", "private"],
      required: true
    },

    // Reference to workspace (for workspace chats)
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace"
    },

    // Reference to project (for project chats)
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },

    // Room creator (for private chats)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Participants in the chat room
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member"
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      lastReadAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Last message details for preview
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },

    settings: {
      allowFileSharing: {
        type: Boolean,
        default: true
      },
      allowInvites: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
chatRoomSchema.index({ workspace: 1, type: 1 });
chatRoomSchema.index({ project: 1 });
chatRoomSchema.index({ "participants.user": 1 });
chatRoomSchema.index({ "participants.user": 1, "participants.lastReadAt": 1 });

export default mongoose.model("ChatRoom", chatRoomSchema);
