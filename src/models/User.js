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
      // required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      // required: true,
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
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free"
    },

    // Track specific plan variant (e.g., "pro_monthly", "pro_yearly")
    specificPlan: {
      type: String,
      enum: ["free", "pro_monthly", "pro_yearly", "enterprise_monthly", "enterprise_yearly"],
      default: "free"
    },

    stripeCustomerId: {
      type: String,
      default: null
    },

    stripeSubscriptionId: {
      type: String,
      default: null
    },

    planExpiresAt: {
      type: Date,
      default: null  // null = free forever
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);