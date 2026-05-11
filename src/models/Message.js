import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true
    },

    type: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text"
    },

    // For file messages
    fileAttachment: {
      url: String,
      filename: String,
      mimetype: String,
      size: Number
    },

    // For system messages (e.g., user joined, left)
    systemData: {
      action: String,
      targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },

    // Message editing
    editedAt: {
      type: Date
    },

    // Read receipts
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Message threading (replies)
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },

    // Reactions
    reactions: [{
      emoji: String,
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }]
    }],

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ chatRoom: 1, sender: 1 });
messageSchema.index({ "readBy.user": 1 });
messageSchema.index({ parentMessage: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleString();
});

export default mongoose.model("Message", messageSchema);
