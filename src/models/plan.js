import mongoose from "mongoose";

const planSchema = new mongoose.Schema({

  name: {
    type: String,
    enum: ["free", "pro_monthly", "pro_yearly", "enterprise_monthly", "enterprise_yearly"],
    required: true,
    unique: true
  },

  displayName: {
    type: String,
    required: true  // "Pro Monthly", "Pro Yearly" etc
  },

  description: {
    type: String
  },

  // ✅ Single price — no monthly/yearly split needed
  price: {
    type: Number,
    default: 0
  },

  billingCycle: {
    type: String,
    enum: ["monthly", "yearly", "none"],
    default: "none"   // free = none
  },

  // ✅ Single priceId — no monthly/yearly split needed
  stripePriceId: {
    type: String,
    default: null
  },

  // Plan group — for frontend to group pro plans together
  planGroup: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    required: true
  },

  limits: {
    workspaces: { type: Number, default: 1 },
    membersPerWorkspace: { type: Number, default: 3 },
    chat: { type: Boolean, default: false }
  },

  features: [String],

  isPopular: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("Plan", planSchema);