import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    slug: {
      type: String,
      required: true,
      unique: true
    },

    description: {
      type: String
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },

        role: {
          type: String,
          enum: [
            "owner",
            "workspace_admin",
            "team_member",
            "guest"
          ],
          default: "team_member"
        },

        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free"
    },

    settings: {
      logo: String,
      defaultStatuses: [String],
      theme: String
    },

    storageUsed: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Workspace", workspaceSchema);