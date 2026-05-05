// import User from "../../models/user.js";

// import Workspace from "../../models/workspace.js";

// import sendInviteEmail from "../../middlewares/InviteEmail.js";

// import bcrypt from "bcryptjs";

// import WorkspaceInvite from "../../models/WorkspaceInvite.js";



// export const createWorkspace = async (req,res) => {



//     try {

//          const {name,slug,description} = req.body;



//          const newWorkspace = await Workspace.create({

//             name,

//             slug,

//             description,

//             owner: req.user._id

//          });





//          if(!newWorkspace){

//             return res.status(400).json({message: "Workspace not created"});

//          }



//          res.status(201).json(newWorkspace);

       

//     } catch (error) {

//         res.status(500).json({message: error.message});

//     }

    

// }



// export const inviteMember = async (req, res) => {

//   try {

//     const { email } = req.body;

//     const { workspaceId } = req.params;



//     if (!email) {

//       return res.status(400).json({

//         message: "Email is required"

//       });

//     }



//     const foundWorkspace = await Workspace.findById(workspaceId);





//     if (!foundWorkspace) {

//       return res.status(404).json({

//         message: "Workspace not found"

//       });

//     }



//     // Check already member

//     const existingUser = await User.findOne({ email });



//     if (existingUser) {

//       const alreadyMember = foundWorkspace.members.find(

//         m => m.user.toString() === existingUser._id.toString()

//       );



//       if (alreadyMember) {

//         return res.status(400).json({

//           message: "User already a member"

//         });

//       }

//     }



//     // Generate token

//     const token = await bcrypt.hash(Date.now().toString(), 10);



//     // Save invite

//     const invite = await WorkspaceInvite.create({

//       workspace: workspaceId,

//       email,

//       token,

//       invitedBy: req.user._id

//     });



//     // Send email with link

//     // const inviteLink = `http://localhost:5173/accept-invite/${token}`;



//     await sendInviteEmail(email,foundWorkspace.name ,token);



//     return res.status(200).json({

//       token,

//       email,

//       message: "Invitation sent successfully"

//     });



//   } catch (error) {

//     return res.status(500).json({

//       message: error.message

//     });

//   }

// };  



// export const acceptInvite = async (req, res) => {

//   try {

//     const { token } = req.query;



//     const invite = await WorkspaceInvite.findOne({ token });



//     if (!invite || invite.status !== "pending") {

//       return res.status(400).json({

//         message: "Invalid or expired invite"

//       });

//     }



//     // Check if invite has expired

//     if (invite.expiresAt && new Date() > invite.expiresAt) {

//       return res.status(400).json({

//         message: "Invitation has expired"

//       });

//     }



//     const user = await User.findOne({ email: invite.email });



//     if (!user) {

//       return res.status(404).json({

//         message: "User not found. Please register or login with the invited email address."

//       });

//     }



//     const workspace = await Workspace.findById(invite.workspace);



//     if (!workspace) {

//       return res.status(404).json({

//         message: "Workspace not found"

//       });

//     }



//     // Check if user is already a member

//     const alreadyMember = workspace.members.find(

//       m => m.user.toString() === user._id.toString()

//     );



//     if (alreadyMember) {

//       // Update invite status to accepted anyway

//       invite.status = "accepted";

//       await invite.save();

      

//       return res.status(200).json({

//         message: "You are already a member of this workspace"

//       });

//     }



//     // Add to members

//     workspace.members.push({

//       user: user._id,

//       role: invite.role || "team_member"

//     });



//     console.log("Adding user to workspace:", {

//       userId: user._id,

//       workspaceId: workspace._id,

//       workspaceName: workspace.name,

//       membersBefore: workspace.members.length - 1,

//       membersAfter: workspace.members.length

//     });



//     await workspace.save();



//     // Update invite status

//     invite.status = "accepted";

//     await invite.save();



//     console.log("Successfully added member to workspace:", workspace._id);



//     return res.status(200).json({

//       message: "You have successfully joined the workspace",

//       workspace: {

//         id: workspace._id,

//         name: workspace.name

//       }

//     });



//   } catch (error) {

//     console.error("Error accepting invite:", error);

//     return res.status(500).json({

//       message: error.message

//     });

//   }

// };   



// export const getWorkspaceById = async (req,res)=>{

//   try {

//     const {workspaceId} = req.params;

//     const workspace = await Workspace.findById(workspaceId)

//       .populate("owner")

//       .populate("members.user");

    

//     console.log("Workspace details for ID:", workspaceId, workspace);

//     return res.status(200).json({

//       workspace

//     });

//   } catch (error) {

//     console.error("Error getting workspace:", error);

//     return res.status(500).json({

//       message: error.message

//     });

//   }

// }  



// export const getlistWorkspace = async(req,res)=>{

//   try {



//     const userId = req.user._id 

    

//     const workspaces = await Workspace.find({

//       $or:[

//         { owner: userId },

//         { "members.user": userId }

//       ]

//     }).populate("owner").populate("members.user");



//     if(!workspaces || workspaces.length === 0){

//       return res.status(404).json({

//         message: "No workspaces found"

//       });

//     }



//     console.log("Found workspaces for user:", userId, workspaces);

//     return res.status(200).json({

//       workspaces

//     })

    

//   } catch (error) {

//     console.error("Error getting workspaces:", error);

//     return res.status(500).json({

//       message:error.message

//     })

//   }

// }





// export const getWorkspaceMembers = async (req, res) => {

//   try {

//     const { workspaceId } = req.params;

//     const workspace = await Workspace.findById(workspaceId).populate("members.user");

//     res.status(200).json({

//       success: true,

//       members: workspace.members

//     });

//   } catch (error) {

//     res.status(500).json({

//       success: false,

//       message: error.message

//     });

//   }

// }

 

// export const getAcceptedInvitedUsers = async (req, res) => {

//   try {

//     const { workspaceId } = req.params;



//     const users = await WorkspaceInvite.find({

//       workspace: workspaceId,

//       status: "accepted"

//     })

//       .populate("invitedBy", "name email")

//       .select("email role invitedBy createdAt");



//     res.status(200).json({

//       success: true,

//       total: users.length,

//       users

//     });



//   } catch (error) {

//     res.status(500).json({

//       success: false,

//       message: error.message

//     });

//   }

// };


import User from "../../models/user.js";
import Workspace from "../../models/workspace.js";
import sendInviteEmail from "../../middlewares/InviteEmail.js";
import bcrypt from "bcryptjs";
import WorkspaceInvite from "../../models/WorkspaceInvite.js";
import PLANS from "../../config/planLimits.js";

// ================= CREATE WORKSPACE =================
export const createWorkspace = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        message: "Name and slug are required."
      });
    }

    // ✅ Check slug is unique
    const existingSlug = await Workspace.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        message: "Slug already taken. Please choose a different one."
      });
    }

    // ✅ No plan field on workspace — plan lives on User
    const newWorkspace = await Workspace.create({
      name,
      slug,
      description,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner"
        }
      ]
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace: newWorkspace,
      currentPlan: req.currentPlan,   // comes from checkPlanLimit middleware
      limits: req.planLimits          // comes from checkPlanLimit middleware
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= INVITE MEMBER =================
export const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { workspaceId } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const foundWorkspace = await Workspace.findById(workspaceId);
    if (!foundWorkspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ Check pending invite already sent
    const existingInvite = await WorkspaceInvite.findOne({
      workspace: workspaceId,
      email,
      status: "pending"
    });

    if (existingInvite) {
      return res.status(400).json({
        message: "Invitation already sent to this email."
      });
    }

    // ✅ Check already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const alreadyMember = foundWorkspace.members.find(
        m => m.user.toString() === existingUser._id.toString()
      );
      if (alreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }
    }

    // ✅ Generate invite token
    const token = await bcrypt.hash(Date.now().toString(), 10);

    await WorkspaceInvite.create({
      workspace: workspaceId,
      email,
      token,
      role: role || "team_member",
      invitedBy: req.user._id
    });

    await sendInviteEmail(email, foundWorkspace.name, token);

    return res.status(200).json({
      message: "Invitation sent successfully",
      email
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ================= ACCEPT INVITE =================
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.query;

    const invite = await WorkspaceInvite.findOne({ token });

    if (!invite || invite.status !== "pending") {
      return res.status(400).json({ message: "Invalid or expired invite" });
    }

    // ✅ Check invite expiry
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return res.status(400).json({ message: "Invitation has expired" });
    }

    const user = await User.findOne({ email: invite.email });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register with the invited email first."
      });
    }

    const workspace = await Workspace.findById(invite.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ Check if already a member
    const alreadyMember = workspace.members.find(
      m => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      invite.status = "accepted";
      await invite.save();
      return res.status(200).json({
        message: "You are already a member of this workspace"
      });
    }

    // ✅ Check owner's plan limit before adding member
    const owner = await User.findById(workspace.owner);
    const ownerPlan = owner?.plan || "free";
    const planLimits = PLANS[ownerPlan];
    const currentMemberCount = workspace.members.length;

    if (
      planLimits.membersPerWorkspace !== Infinity &&
      currentMemberCount >= planLimits.membersPerWorkspace
    ) {
      return res.status(403).json({
        message: `This workspace has reached its member limit (${planLimits.membersPerWorkspace}) on the ${ownerPlan} plan. The owner needs to upgrade.`
      });
    }

    // ✅ Add member
    workspace.members.push({
      user: user._id,
      role: invite.role || "team_member"
    });

    await workspace.save();

    invite.status = "accepted";
    await invite.save();

    return res.status(200).json({
      message: "You have successfully joined the workspace",
      workspace: {
        id: workspace._id,
        name: workspace.name
      }
    });

  } catch (error) {
    console.error("Error accepting invite:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ================= GET WORKSPACE BY ID =================
export const getWorkspaceById = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email plan")   // ✅ include plan from owner
      .populate("members.user", "name email avatar");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ Attach plan limits from owner's plan
    const ownerPlan = workspace.owner?.plan || "free";
    const planLimits = PLANS[ownerPlan];

    return res.status(200).json({
      workspace,
      currentPlan: ownerPlan,
      limits: planLimits
    });

  } catch (error) {
    console.error("Error getting workspace:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ================= GET ALL WORKSPACES =================
export const getlistWorkspace = async (req, res) => {
  try {
    const userId = req.user._id;

    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { "members.user": userId }
      ]
    })
      .populate("owner", "name email plan")
      .populate("members.user", "name email avatar");

    // ✅ Return empty array instead of 404
    return res.status(200).json({
      workspaces: workspaces || []
    });

  } catch (error) {
    console.error("Error getting workspaces:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ================= GET WORKSPACE MEMBERS =================
export const getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate("members.user", "name email avatar");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ Include plan limit info so frontend can show member cap
    const owner = await User.findById(workspace.owner);
    const ownerPlan = owner?.plan || "free";
    const planLimits = PLANS[ownerPlan];

    res.status(200).json({
      success: true,
      members: workspace.members,
      currentPlan: ownerPlan,
      memberLimit: planLimits.membersPerWorkspace
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ================= GET ACCEPTED INVITED USERS =================
export const getAcceptedInvitedUsers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const users = await WorkspaceInvite.find({
      workspace: workspaceId,
      status: "accepted"
    })
      .populate("invitedBy", "name email")
      .select("email role invitedBy createdAt");

    res.status(200).json({
      success: true,
      total: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



