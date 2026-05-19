import mongoose from "mongoose";
// import Project from "./Project";


const TaskSchema = new mongoose.Schema({
  taskKey: {
    type: String,
    unique: true // e.g. WEB-16 (you can auto-generate later)
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    trim: true
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  column: {
    type: String, // todo / in-progress / done
    required: true
  },

  order: {
    type: Number,
    required: true
  },

  assignees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  priority: {
    type: String,
    enum: ["urgent", "high", "medium", "low", "none"],
    default: "medium"
  },

  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label"
    }
  ],

  dueDate: {
    type: Date
  },

  subtasks: [
    {
      title: String,
      isCompleted: {
        type: Boolean,
        default: false
      }
    }
  ],

  attachments: [
    {
      url: String,
      name: String,
      publicId: String,
      size: Number
    }
  ],

  watchers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  comments: [
    {
      text: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  activityLog: [
    {
      action: String,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      field: String,
      oldValue: String,
      newValue: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true });

export default mongoose.model("Task", TaskSchema);