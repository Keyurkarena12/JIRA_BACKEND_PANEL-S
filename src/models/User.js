import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      // select: false
    },

    resetPasswordCode: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },

    avatar: {
      url: String,
      publicId: String
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    googleId: {
      type: String,
      default: null
    },

    githubId: {
      type: String,
      default: null
    },

    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);