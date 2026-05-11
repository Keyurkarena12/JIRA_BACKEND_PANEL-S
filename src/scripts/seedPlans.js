// // scripts/seedPlans.js
// import mongoose from "mongoose";
// import Plan from "../models/plan.js";
// import dotenv from "dotenv";
// dotenv.config();

// const plans = [
//   {
//     name: "free",
//     displayName: "Free",
//     description: "Perfect for individuals just getting started",
//     price: {
//       monthly: 0,
//       yearly: 0
//     },
//     stripePriceId: {
//       monthly: null,
//       yearly: null
//     },
//     limits: {
//       workspaces: 1,
//       membersPerWorkspace: 3,
//       chat: false
//     },
//     features: [
//       "1 Workspace",
//       "3 Members per workspace",
//       "Basic project management",
//       "No chat"
//     ],
//     isPopular: false
//   },
//   {
//     name: "pro",
//     displayName: "Pro",
//     description: "Best for growing teams",
//     price: {
//       monthly: 10,
//       yearly: 99
//     },
//     stripePriceId: {
//       monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
//       yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID
//     },
//     limits: {
//       workspaces: 10,
//       membersPerWorkspace: 25,
//       chat: true
//     },
//     features: [
//       "10 Workspaces",
//       "25 Members per workspace",
//       "Full project management",
//       "Chat enabled",
//       "Priority support"
//     ],
//     isPopular: true   // show "Most Popular" badge
//   },
//   {
//     name: "enterprise",
//     displayName: "Enterprise",
//     description: "For large organizations",
//     price: {
//       monthly: 49,
//       yearly: 499
//     },
//     stripePriceId: {
//       monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
//       yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
//     },
//     limits: {
//       workspaces: -1,              // -1 = unlimited (use -1 in DB, Infinity in code)
//       membersPerWorkspace: -1,
//       chat: true
//     },
//     features: [
//       "Unlimited Workspaces",
//       "Unlimited Members",
//       "Full project management",
//       "Chat enabled",
//       "24/7 Dedicated support",
//       "Custom integrations"
//     ],
//     isPopular: false
//   }
// ];

// const seed = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     await Plan.deleteMany({});          // clear old plans
//     await Plan.insertMany(plans);
//     console.log("✅ Plans seeded successfully");
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Seed failed:", error);
//     process.exit(1);
//   }
// };

// seed();  



import mongoose from "mongoose";
import Plan from "../models/plan.js";
import dotenv from "dotenv";
dotenv.config();

const plans = [
  // ================= FREE =================
  {
    name: "free",
    displayName: "Free",
    description: "Perfect for individuals just getting started",
    price: 0,
    billingCycle: "none",
    stripePriceId: null,
    planGroup: "free",
    limits: {
      workspaces: 1,
      membersPerWorkspace: 3,
      chat: false
    },
    features: [
      "1 Workspace",
      "3 Members per workspace",
      "Basic project management",
      "No chat"
    ],
    isPopular: false
  },

  // ================= PRO MONTHLY =================
  {
    name: "pro_monthly",
    displayName: "Pro Monthly",
    description: "Best for growing teams",
    price: 10,
    billingCycle: "monthly",
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    planGroup: "pro",
    limits: {
      workspaces: 10,
      membersPerWorkspace: 25,
      chat: true
    },
    features: [
      "10 Workspaces",
      "25 Members per workspace",
      "Full project management",
      "Chat enabled",
      "Priority support"
    ],
    isPopular: true
  },

  // ================= PRO YEARLY =================
  {
    name: "pro_yearly",
    displayName: "Pro Yearly",
    description: "Best for growing teams — save 2 months",
    price: 99,
    billingCycle: "yearly",
    stripePriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    planGroup: "pro",
    limits: {
      workspaces: 10,
      membersPerWorkspace: 25,
      chat: true
    },
    features: [
      "10 Workspaces",
      "25 Members per workspace",
      "Full project management",
      "Chat enabled",
      "Priority support",
      "2 months free"
    ],
    isPopular: false
  },

  // ================= ENTERPRISE MONTHLY =================
  {
    name: "enterprise_monthly",
    displayName: "Enterprise Monthly",
    description: "For large organizations",
    price: 49,
    billingCycle: "monthly",
    stripePriceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    planGroup: "enterprise",
    limits: {
      workspaces: -1,
      membersPerWorkspace: -1,
      chat: true
    },
    features: [
      "Unlimited Workspaces",
      "Unlimited Members",
      "Full project management",
      "Chat enabled",
      "24/7 Dedicated support",
      "Custom integrations"
    ],
    isPopular: false
  },

  // ================= ENTERPRISE YEARLY =================
  {
    name: "enterprise_yearly",
    displayName: "Enterprise Yearly",
    description: "For large organizations — save 2 months",
    price: 499,
    billingCycle: "yearly",
    stripePriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    planGroup: "enterprise",
    limits: {
      workspaces: -1,
      membersPerWorkspace: -1,
      chat: true
    },
    features: [
      "Unlimited Workspaces",
      "Unlimited Members",
      "Full project management",
      "Chat enabled",
      "24/7 Dedicated support",
      "Custom integrations",
      "2 months free"
    ],
    isPopular: false
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Plan.deleteMany({});
    await Plan.insertMany(plans);
    console.log("✅ Plans seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();