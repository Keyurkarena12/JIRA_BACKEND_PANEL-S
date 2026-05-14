import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

  // ✅ Change: user, not workspace
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  stripeCustomerId: {
    type: String,
    required: true
  },

  stripeSubscriptionId: {
    type: String,
    required: true
  },

  plan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free"
  },

  // Track specific plan variant (e.g., "pro_monthly", "pro_yearly")
  specificPlan: {
    type: String,
    enum: ["free", "pro_daily", "pro_monthly", "pro_yearly", "enterprise_monthly", "enterprise_yearly"],
    default: "free"
  },

  billingCycle: {
    type: String,
    enum: ["daily", "monthly", "yearly"],
    default: "monthly"
  },

  status: {
    type: String,
    enum: ["active", "canceled", "past_due", "trialing"],
    default: "active"
  },

  currentPeriodEnd: {
    type: Date
  },

  // ✅ Add: track plan changes
  previousPlan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: null
  }  ,

  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },

  canceledAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);