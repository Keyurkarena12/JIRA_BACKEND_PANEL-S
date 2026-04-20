import mongoose from "mongoose";

const workspaceInviteSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    role: {
      type: String,
      enum: ["workspace_admin", "team_member", "guest"],
      default: "team_member"
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },

    token: {
      type: String,
      required: true,
      unique: true
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    expiresAt: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 60 * 24 // 24 hours
    }
  },
  { timestamps: true }
);

export default mongoose.model("WorkspaceInvite", workspaceInviteSchema);