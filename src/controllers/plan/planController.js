// // controllers/Plan/planController.js
// import Plan from "../../models/plan.js";

// // ✅ Get all plans — frontend uses this to show pricing page
// export const getPlans = async (req, res) => {
//   try {
//     const plans = await Plan.find({ isActive: true }).sort({
//       "price.monthly": 1   // free → pro → enterprise order
//     });

//     // ✅ Convert -1 back to "Unlimited" for frontend display
//     const formattedPlans = plans.map(plan => ({
//       ...plan.toObject(),
//       limits: {
//         ...plan.limits,
//         workspaces: plan.limits.workspaces === -1 ? "Unlimited" : plan.limits.workspaces,
//         membersPerWorkspace: plan.limits.membersPerWorkspace === -1 ? "Unlimited" : plan.limits.membersPerWorkspace
//       }
//     }));

//     res.status(200).json({
//       success: true,
//       plans: formattedPlans
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ✅ Get single plan by name
// export const getPlanByName = async (req, res) => {
//   try {
//     const { name } = req.params;

//     const plan = await Plan.findOne({ name, isActive: true });
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     res.status(200).json({ success: true, plan });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };  



import Plan from "../../models/plan.js";

// ✅ Get all plans
export const getPlans = async (req, res) => {
  try {
    // ✅ Sort by price ascending — free(0) → pro → enterprise
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

    const formattedPlans = plans.map(plan => ({
      ...plan.toObject(),
      limits: {
        ...plan.limits,
        workspaces: plan.limits.workspaces === -1 ? "Unlimited" : plan.limits.workspaces,
        membersPerWorkspace: plan.limits.membersPerWorkspace === -1 ? "Unlimited" : plan.limits.membersPerWorkspace
      }
    }));

    res.status(200).json({
      success: true,
      plans: formattedPlans
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single plan by name
export const getPlanByName = async (req, res) => {
  try {
    const { name } = req.params;

    const plan = await Plan.findOne({ name, isActive: true });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ success: true, plan });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};