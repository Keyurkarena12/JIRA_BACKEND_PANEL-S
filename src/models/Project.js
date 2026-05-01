import mongoose from "mongoose"; 

const projectSchema = new mongoose.Schema(
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
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      role: {
        type: String,
        enum: ["owner", "member", "guest"],
        default: "member"
      }
    }],
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
