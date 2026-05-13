import express from "express";
import { auth } from "../middlewares/authmiddlewares.js";
import {
  createCheckoutSession,
  stripeWebhook,
  getBillingHistory,
  cancelRecurringBilling,
  verifyCheckoutSession,
  setTestingEndDate
} from "../controllers/Subscription/subscriptionController.js";

const router = express.Router();

// ✅ Webhook must use raw body — before any json parser
router.post("/webhook", stripeWebhook);

// ✅ Checkout session
router.post("/create-checkout-session", auth, createCheckoutSession);

// ✅ After Stripe redirect: sync DB if webhook did not run (local dev / missed delivery)
router.post("/verify-checkout-session", auth, verifyCheckoutSession);


// Billing History and Cancel Recurring
router.get("/billing-history", auth, getBillingHistory);
router.post("/cancel-recurring-billing", auth, cancelRecurringBilling);

// Testing endpoint
router.post("/set-testing-end-date", auth, setTestingEndDate);

export default router;