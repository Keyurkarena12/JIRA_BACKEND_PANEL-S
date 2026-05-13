// import mongoose from "mongoose";

// const billingHistorySchema = new mongoose.Schema({

//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   },

//   subscriptionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Subscription"
//   },

//   stripeSubscriptionId: String,

//   planName: String,

//   amount: Number,

//   billingCycle: String,

//   status: {
//     type: String,
//     enum: [
//       "active",
//       "cancelled",
//       "expired",
//       "paid"
//     ]
//   },

//   startDate: Date,

//   endDate: Date,

//   cancelledAt: Date

// }, { timestamps: true });

// export default mongoose.model(
//   "BillingHistory",
//   billingHistorySchema
// );   


import mongoose from "mongoose";

const billingHistorySchema = new mongoose.Schema({

  // ✅ user not workspace — billing belongs to user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ❌ Remove workspaceId — billing is per user not workspace
  // workspaceId removed

  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true
  },

  stripeSubscriptionId: {
    type: String,
    required: true
  },

  // ✅ Store specific plan name e.g. "pro_monthly"
  planName: {
    type: String,
    required: true
  },

  // ✅ Store plan group e.g. "pro"
  planGroup: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    required: true
  },

  amount: {
    type: Number,
    default: 0
  },

  billingCycle: {
    type: String,
    enum: ["monthly", "yearly", "none"],
    default: "monthly"
  },

  status: {
    type: String,
    enum: ["active", "cancelled", "expired", "paid"],
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    default: null
  },

  cancelledAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

export default mongoose.model("BillingHistory", billingHistorySchema);