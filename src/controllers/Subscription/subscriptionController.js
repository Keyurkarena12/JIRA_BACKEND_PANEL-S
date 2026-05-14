  
import stripe from "../../config/stripe.js";
import Subscription from "../../models/subscription.js";
import User from "../../models/user.js";
import Plan from "../../models/plan.js";
import BillingHistory from "../../models/billingHistory.js";

const PLAN_LEVEL = {
  free: 0,
  pro_daily:1,
  pro_monthly: 2,
  pro_yearly: 3,
  enterprise_monthly: 4,
  enterprise_yearly: 5
};

const getPlanLevel = (specificPlanName) => {
  return PLAN_LEVEL[specificPlanName] ?? 0;
};

/**
 * Shared logic for checkout.session.completed (webhook) and verify-checkout-session (browser).
 * User.plan must stay free | pro | enterprise; variant lives on User.specificPlan.
 */
async function syncPaidCheckoutSession(session) {
  if (session.mode !== "subscription") {
    throw new Error("Checkout session is not subscription mode.");
  }

  if (session.payment_status !== "paid") {
    return { skipped: true, reason: "payment_status not paid" };
  }

  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    throw new Error("Checkout session missing userId or planId in metadata.");
  }

  const planDoc = await Plan.findById(planId);
  if (!planDoc || !planDoc.isActive) {
    throw new Error("Plan not found or inactive.");
  }

  const planGroup = session.metadata?.plan || planDoc.planGroup;
  const billingCycle = session.metadata?.billingCycle || planDoc.billingCycle;
  const specificPlan = session.metadata?.specificPlan || planDoc.name;

  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new Error("User not found.");
  }

  const stripeCustomerId = session.customer;
  const stripeSubId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!stripeCustomerId || !stripeSubId) {
    throw new Error("Missing Stripe customer or subscription on checkout session.");
  }

  let currentPeriodEnd = null;
  try {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
    currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
  } catch {
    currentPeriodEnd =
      billingCycle === "yearly"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : billingCycle === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // default for daily
  }

  // ✅ Cancel old subscription if user is upgrading
  const existingSubscription = await Subscription.findOne({ user: userId });
  let oldSubscriptionCancelled = false;
  
  if (existingSubscription && existingSubscription.stripeSubscriptionId && existingSubscription.stripeSubscriptionId !== stripeSubId) {
    try {
      // Cancel old subscription in Stripe
      await stripe.subscriptions.update(existingSubscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      
      // Update old subscription in database
      existingSubscription.cancelAtPeriodEnd = true;
      existingSubscription.canceledAt = new Date();
      existingSubscription.status = "active"; // Still active until period ends
      await existingSubscription.save();
      
      // Create billing history entry for cancelled subscription
      await BillingHistory.create({
        userId,
        subscriptionId: existingSubscription._id,
        stripeSubscriptionId: existingSubscription.stripeSubscriptionId,
        planName: existingSubscription.specificPlan || existingSubscription.plan,
        planGroup: existingSubscription.plan,
        amount: 0,
        billingCycle: existingSubscription.billingCycle,
        status: "cancelled",
        startDate: existingSubscription.createdAt,
        endDate: existingSubscription.currentPeriodEnd, // Use the actual period end date
        cancelledAt: new Date()
      });
      
      oldSubscriptionCancelled = true;
      console.log(`Cancelled old subscription ${existingSubscription.stripeSubscriptionId} for user ${userId}`);
    } catch (error) {
      console.warn("Failed to cancel old subscription:", error.message);
      // Continue with new subscription even if old one fails to cancel
    }
  }

  const subscription = await Subscription.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubId,
      plan: planGroup,
      specificPlan,
      billingCycle,
      status: "active",
      cancelAtPeriodEnd: false,
      canceledAt: null,
      currentPeriodEnd
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findByIdAndUpdate(userId, {
    plan: planGroup,
    specificPlan,
    stripeCustomerId,
    stripeSubscriptionId: stripeSubId,
    planExpiresAt: currentPeriodEnd
  });

  const existingPaid = await BillingHistory.findOne({
    userId,
    stripeSubscriptionId: stripeSubId,
    status: "paid"
  });

  if (!existingPaid) {
    await BillingHistory.create({
      userId,
      subscriptionId: subscription._id,
      stripeSubscriptionId: stripeSubId,
      planName: specificPlan,
      planGroup,
      amount: planDoc.price || 0,
      billingCycle,
      status: "paid",
      startDate: new Date(),
      endDate: currentPeriodEnd // Use the actual period end date from Stripe
    });
  }

  return { synced: true };
}


// ================= CREATE CHECKOUT SESSION =================
export const createCheckoutSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
    }

    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "planId is required."
      });
    }

    const planDoc = await Plan.findById(planId);
    if (!planDoc || !planDoc.isActive) {
      return res.status(404).json({
        success: false,
        message: "Plan not found."
      });
    }

    if (planDoc.planGroup === "free") {
      return res.status(400).json({
        success: false,
        message: "Free plan does not require payment."
      });
    }

    if (!planDoc.stripePriceId) {
      return res.status(400).json({
        success: false,
        message: "Stripe priceId is missing for this plan."
      });
    }

    // ✅ Check existing active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      status: "active"
    });

    const currentSpecificPlan = existingSubscription?.specificPlan || req.user?.specificPlan || "free";
    const currentPlanLevel = getPlanLevel(currentSpecificPlan);
    const targetPlanLevel = getPlanLevel(planDoc.name);

    if (targetPlanLevel <= currentPlanLevel) {
      return res.status(400).json({
        success: false,
        message: "Plan downgrade or same-level purchase is not allowed. You can only upgrade to a higher plan."
      });
    }

    if (
      existingSubscription &&
      existingSubscription.specificPlan === planDoc.name &&
      !existingSubscription.cancelAtPeriodEnd
    ) {
      return res.status(400).json({
        success: false,
        message: "You are already subscribed to this plan."
      });
    }

    // ✅ Cancel old subscription recurring at period end
    if (
      existingSubscription &&
      existingSubscription.stripeSubscriptionId &&
      !existingSubscription.cancelAtPeriodEnd
    ) {
      const updatedStripeSubscription = await stripe.subscriptions.update(
        existingSubscription.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );

      existingSubscription.cancelAtPeriodEnd = true;
      existingSubscription.canceledAt = new Date();
      await existingSubscription.save();
    }

    // ✅ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: req.user.email,
      line_items: [
        {
          price: planDoc.stripePriceId,
          quantity: 1
        }
      ],
      metadata: {
        userId: req.user._id.toString(),
        planId: planDoc._id.toString(),
        plan: planDoc.planGroup,
        specificPlan: planDoc.name,
        billingCycle: planDoc.billingCycle
      },
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`
    });

    return res.status(200).json({
      success: true,
      url: session.url
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= VERIFY CHECKOUT (success page fallback when webhook not delivered) =================
export const verifyCheckoutSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required."
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "This checkout session does not belong to your account."
      });
    }

    const result = await syncPaidCheckoutSession(session);

    if (result?.skipped) {
      return res.status(202).json({
        success: false,
        message: "Payment is not confirmed yet. Refresh in a moment or wait for the confirmation email."
      });
    }

    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Subscription synced.",
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= STRIPE WEBHOOK =================
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // Raw Buffer from express.raw() on /api/subscription/webhook (server.js sets req.rawBody)
  const payload = req.rawBody || req.body;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {

    // ================= CHECKOUT COMPLETED =================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        const result = await syncPaidCheckoutSession(session);
        if (result?.skipped) {
          console.warn("checkout.session.completed skipped:", result.reason);
        }
      } catch (err) {
        console.error("checkout.session.completed sync failed:", err.message);
        return res.status(500).json({ received: false });
      }
    }

    // ================= SUBSCRIPTION UPDATED =================
    // ✅ Now at correct level — not nested inside checkout block
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;

      const subscription = await Subscription.findOne({
        stripeSubscriptionId: sub.id
      });

      if (subscription) {
        const wasJustCancelled = !subscription.cancelAtPeriodEnd && sub.cancel_at_period_end;
        
        subscription.status = sub.status;
        subscription.cancelAtPeriodEnd = sub.cancel_at_period_end;
        subscription.currentPeriodEnd = new Date(sub.current_period_end * 1000);
        await subscription.save();

        // ✅ If subscription was just cancelled (cancel_at_period_end = true), update billing history
        if (wasJustCancelled) {
          await BillingHistory.create({
            userId: subscription.user,
            subscriptionId: subscription._id,
            stripeSubscriptionId: subscription.stripeSubscriptionId,
            planName: subscription.specificPlan || subscription.plan,
            planGroup: subscription.plan,
            amount: 0,
            billingCycle: subscription.billingCycle,
            status: "cancelled",
            startDate: subscription.createdAt,
            endDate: new Date(sub.current_period_end * 1000), // Actual end date from Stripe
            cancelledAt: new Date()
          });
        }

        // ✅ Sync user plan (plan group + variant)
        await User.findByIdAndUpdate(subscription.user, {
          plan: subscription.plan,
          specificPlan: subscription.specificPlan
        });
      }
    }

    // ================= SUBSCRIPTION CANCELED =================
    // ✅ Now at correct level
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;

      const subscription = await Subscription.findOne({
        stripeSubscriptionId: sub.id
      });

      if (subscription) {
        const previousPlan = subscription.plan;

        subscription.status = "canceled";
        subscription.previousPlan = previousPlan;
        subscription.plan = "free";
        subscription.specificPlan = "free";
        await subscription.save();

        // ✅ Downgrade user to free
        await User.findByIdAndUpdate(subscription.user, {
          plan: "free",
          specificPlan: "free",
          stripeSubscriptionId: null,
          planExpiresAt: null
        });

        // ✅ Billing history for cancellation
        await BillingHistory.create({
          userId: subscription.user,
          subscriptionId: subscription._id,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          planName: subscription.specificPlan || subscription.plan,
          planGroup: previousPlan,
          amount: 0,
          billingCycle: subscription.billingCycle,
          status: "cancelled",
          startDate: subscription.createdAt,
          endDate: new Date(),
          cancelledAt: new Date()
        });
      }
    }

    // ================= PAYMENT FAILED =================
    // ✅ Now at correct level
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;

      await Subscription.findOneAndUpdate(
        { stripeCustomerId: invoice.customer },
        { status: "past_due" }
      );
    }

    // ✅ Always send 200 at the end
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("STRIPE WEBHOOK ERROR:", error);
    return res.status(500).json({ received: false });
  }
};


// ================= GET BILLING HISTORY =================
export const getBillingHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const billingHistory = await BillingHistory.find({
      userId: req.user._id
    })
      .sort({ createdAt: -1 })
      .populate(
        "subscriptionId",
        "plan specificPlan billingCycle cancelAtPeriodEnd status stripeSubscriptionId"
      );

    res.status(200).json({
      success: true,
      data: billingHistory
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= TESTING END DATE =================
/**
 * Testing endpoint to manually set end dates for billing history entries
 * This is for testing purposes only
 */
export const setTestingEndDate = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const { billingHistoryId, endDate } = req.body;

    if (!billingHistoryId) {
      return res.status(400).json({
        success: false,
        message: "billingHistoryId is required."
      });
    }

    // Set end date to today if not provided
    const targetEndDate = endDate ? new Date(endDate) : new Date();

    // Update the billing history entry
    const updatedRecord = await BillingHistory.findOneAndUpdate(
      {
        _id: billingHistoryId,
        userId: req.user._id
      },
      {
        endDate: targetEndDate,
        status: "cancelled"
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Billing history record not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "End date updated for testing.",
      data: updatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= CANCEL RECURRING BILLING =================
/**
 * Cancels recurring billing in Stripe (cancel_at_period_end).
 * Accepts either Mongo subscriptionId OR stripeSubscriptionId (required for "old" subs after upgrade).
 */
export const cancelRecurringBilling = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const { subscriptionId, stripeSubscriptionId } = req.body;

    if (!subscriptionId && !stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: "subscriptionId or stripeSubscriptionId is required."
      });
    }

    let stripeSubId = stripeSubscriptionId || null;
    let subscriptionById = null;

    if (subscriptionId) {
      subscriptionById = await Subscription.findOne({
        user: req.user._id,
        _id: subscriptionId
      });
      if (subscriptionById?.stripeSubscriptionId) {
        stripeSubId = stripeSubId || subscriptionById.stripeSubscriptionId;
      }
    }

    if (!stripeSubId) {
      return res.status(400).json({
        success: false,
        message: "Could not resolve a Stripe subscription for this request."
      });
    }

    const userOwnsStripeSub =
      (await Subscription.exists({
        user: req.user._id,
        stripeSubscriptionId: stripeSubId
      })) ||
      (await BillingHistory.exists({
        userId: req.user._id,
        stripeSubscriptionId: stripeSubId
      }));

    if (!userOwnsStripeSub) {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel this subscription."
      });
    }

    let stripeSub;
    try {
      stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
    } catch (err) {
      if (err.code === "resource_missing") {
        return res.status(404).json({
          success: false,
          message: "That subscription no longer exists in Stripe."
        });
      }
      throw err;
    }

    if (
      stripeSub.status === "canceled" ||
      stripeSub.status === "incomplete_expired"
    ) {
      return res.status(400).json({
        success: false,
        message: "This subscription has already ended."
      });
    }

    if (stripeSub.cancel_at_period_end) {
      return res.status(400).json({
        success: false,
        message:
          "This subscription is already scheduled to end at the current period end."
      });
    }

    const canceledSubscription = await stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: true
    });

    const priorPaid = await BillingHistory.findOne({
      userId: req.user._id,
      stripeSubscriptionId: stripeSubId,
      status: "paid"
    }).sort({ createdAt: -1 });

    const userSubscriptionDoc = await Subscription.findOne({
      user: req.user._id
    });

    if (
      userSubscriptionDoc &&
      userSubscriptionDoc.stripeSubscriptionId === stripeSubId
    ) {
      userSubscriptionDoc.cancelAtPeriodEnd = true;
      userSubscriptionDoc.canceledAt = new Date();
      userSubscriptionDoc.status =
        stripeSub.status === "trialing" ? "trialing" : "active";
      await userSubscriptionDoc.save();
    }

    let linkSubscriptionId =
      userSubscriptionDoc?._id || subscriptionById?._id;

    if (!linkSubscriptionId) {
      const anyBillingRow = await BillingHistory.findOne({
        userId: req.user._id,
        stripeSubscriptionId: stripeSubId
      }).sort({ createdAt: -1 });
      linkSubscriptionId = anyBillingRow?.subscriptionId;
    }

    if (!linkSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: "No subscription record found to attach billing history."
      });
    }

    const billingPlanName =
      priorPaid?.planName ||
      subscriptionById?.specificPlan ||
      userSubscriptionDoc?.specificPlan ||
      "free";

    const billingPlanGroup =
      priorPaid?.planGroup ||
      subscriptionById?.plan ||
      userSubscriptionDoc?.plan ||
      "free";

    const billingCycle =
      priorPaid?.billingCycle ||
      subscriptionById?.billingCycle ||
      userSubscriptionDoc?.billingCycle ||
      "monthly";

    const periodEnd = canceledSubscription.cancel_at
      ? new Date(canceledSubscription.cancel_at * 1000)
      : userSubscriptionDoc?.currentPeriodEnd || new Date();

    await BillingHistory.create({
      userId: req.user._id,
      subscriptionId: linkSubscriptionId,
      stripeSubscriptionId: stripeSubId,
      planName: billingPlanName,
      planGroup: billingPlanGroup,
      amount: 0,
      billingCycle,
      status: "cancelled",
      startDate:
        priorPaid?.startDate ||
        subscriptionById?.createdAt ||
        userSubscriptionDoc?.createdAt ||
        new Date(),
      endDate: periodEnd,
      cancelledAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period.",
      cancelAt: periodEnd,
      stripeSubscriptionId: stripeSubId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};