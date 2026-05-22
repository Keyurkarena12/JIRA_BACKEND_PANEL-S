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
    price: 499,
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
    price: 1999,
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
    price: 4999,
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
    price: 7999,
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
  } , 

  // ==================Pro DAILY ======================

  {
    name: "pro_daily",
    displayName: "Pro Daily",
    description: "Best for growing teams",
    price: 80,
    billingCycle: "daily",
    stripePriceId: process.env.STRIPE_PRO_DAILY_PRICE_ID,
    planGroup: "pro",
    limits: {
      workspaces: 10,
      membersPerWorkspace: 25,
      chat: true
    },
    features: [
      "5 Workspaces",
      "15 Members per workspace",
      "Full project management",
      "Chat enabled",
      "Priority support"
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