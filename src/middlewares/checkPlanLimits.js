// import PLANS from '../config/planLimits.js';
// import Workspace from '../models/workspace.js';
// import User from '../models/user.js';

// export const checkPlanLimit = (resource) => {
//   return async (req, res, next) => {
//     try {
//       // ✅ Always get plan from USER, not workspace
//       const user = await User.findById(req.user._id);
//       const currentPlan = user.plan || 'free';
//       const planLimits = PLANS[currentPlan];

//       if (!planLimits) {
//         return res.status(400).json({ message: "Invalid plan" });
//       }

//       switch (resource) {

//         case 'workspace': {
//           // ✅ Count how many workspaces this user owns
//           const userWorkspaces = await Workspace.countDocuments({ owner: req.user._id });

//           if (planLimits.workspaces !== Infinity && userWorkspaces >= planLimits.workspaces) {
//             return res.status(403).json({
//               message: `${currentPlan} plan allows only ${planLimits.workspaces} workspace(s). Upgrade to create more.`
//             });
//           }
//           break;
//         }

//         case 'member': {
//           const { workspaceId } = req.params;

//           const workspace = await Workspace.findById(workspaceId);
//           if (!workspace) {
//             return res.status(404).json({ message: "Workspace not found" });
//           }

//           // ✅ Only owner's plan matters
//           if (workspace.owner.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ message: "Only workspace owner can add members" });
//           }

//           const memberCount = workspace.members?.length || 0;
//           if (planLimits.membersPerWorkspace !== Infinity && memberCount >= planLimits.membersPerWorkspace) {
//             return res.status(403).json({
//               message: `${currentPlan} plan allows only ${planLimits.membersPerWorkspace} members. Upgrade to add more.`
//             });
//           }
//           break;
//         }

//         case 'chat': {
//           // ✅ Simple feature flag check
//           if (!planLimits.chat) {
//             return res.status(403).json({
//               message: `Chat is not available on the ${currentPlan} plan. Upgrade to Pro or Enterprise.`
//             });
//           }
//           break;
//         }

//         default:
//           break;
//       }

//       // ✅ Pass plan info to controller
//       req.currentPlan = currentPlan;
//       req.planLimits = planLimits;

//       next();
//     } catch (error) {
//       console.error('Plan limit check error:', error);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };
// }; 


import Workspace from '../models/workspace.js';
import User from '../models/user.js';
import Plan from '../models/plan.js';

export const checkPlanLimit = (resource) => {
  return async (req, res, next) => {
    try {

      // ✅ Always get plan from USER
      const user = await User.findById(req.user._id);
      const currentPlan = user.plan || 'free'; 

      console.log("currentPlan..............",currentPlan)

      // ✅ Fetch plan limits from DB using planGroup
      const planDoc = await Plan.findOne({
        planGroup: currentPlan,
        isActive: true
      });

      console.log("planDoc>>>",planDoc)

      if (!planDoc) {
        return res.status(400).json({ message: "Plan not found" });
      }

      // ✅ Convert -1 to Infinity for limit comparison
      const planLimits = {
        workspaces: planDoc.limits.workspaces === -1
          ? Infinity
          : planDoc.limits.workspaces,
        membersPerWorkspace: planDoc.limits.membersPerWorkspace === -1
          ? Infinity
          : planDoc.limits.membersPerWorkspace,
        chat: planDoc.limits.chat
      };

      switch (resource) {

        // ================= WORKSPACE LIMIT =================
        case 'workspace': {
          const userWorkspaces = await Workspace.countDocuments({
            owner: req.user._id
          });

          if (
            planLimits.workspaces !== Infinity &&
            userWorkspaces >= planLimits.workspaces
          ) {
            return res.status(403).json({
              message: `${currentPlan} plan allows only ${planLimits.workspaces} workspace(s). Upgrade to create more.`
            });
          }
          break;
        }

        // ================= MEMBER LIMIT =================
        case 'member': {
          const { workspaceId } = req.params;

          const workspace = await Workspace.findById(workspaceId);
          if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
          }

          // ✅ Only workspace owner's plan matters
          if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
              message: "Only workspace owner can add members"
            });
          }

          const memberCount = workspace.members?.length || 0;

          if (
            planLimits.membersPerWorkspace !== Infinity &&
            memberCount >= planLimits.membersPerWorkspace
          ) {
            return res.status(403).json({
              message: `${currentPlan} plan allows only ${planLimits.membersPerWorkspace} member(s). Upgrade to add more.`
            });
          }
          break;
        }

        // ================= CHAT LIMIT =================
        case 'chat': {
          if (!planLimits.chat) {
            return res.status(403).json({
              message: `Chat is not available on the ${currentPlan} plan. Upgrade to Pro or Enterprise.`
            });
          }
          break;
        }

        default:
          break;
      }

      // ✅ Pass plan info to controller
      req.currentPlan = currentPlan;
      req.planLimits = planLimits;

      next();

    } catch (error) {
      console.error('Plan limit check error:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};