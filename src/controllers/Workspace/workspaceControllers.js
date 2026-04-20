import User from "../../models/user.js";
import Workspace from "../../models/workspace.js";
import sendInviteEmail from "../../middlewares/InviteEmail.js";
import bcrypt from "bcryptjs";
import WorkspaceInvite from "../../models/WorkspaceInvite.js";

export const createWorkspace = async (req,res) => {

    try {
         const {name,slug,description} = req.body;

         const newWorkspace = await Workspace.create({
            name,
            slug,
            description,
            owner: req.user._id
         });

         if(!newWorkspace){
            return res.status(400).json({message: "Workspace not created"});
         }

         res.status(201).json(newWorkspace);
       
    } catch (error) {
        res.status(500).json({message: error.message});
    }
    
}



// export const addMember = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const { workspaceId } = req.params;

//     if (!email) {
//       return res.status(400).json({
//         message: "Email is required"
//       });
//     }

//     const foundUser = await User.findOne({ email });

//     if (!foundUser) {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     const foundWorkspace = await Workspace.findById(workspaceId);

//     if (!foundWorkspace) {
//       return res.status(404).json({
//         message: "Workspace not found"
//       });
//     }

//     const alreadyMember = foundWorkspace.members.find(
//       member => member.user.toString() === foundUser._id.toString()
//     );

//     if (alreadyMember) {
//       return res.status(400).json({
//         message: "User is already a member"
//       });
//     }

//     foundWorkspace.members.push({
//       user: foundUser._id,
//       role: "team_member"
//     });

//     await foundWorkspace.save();

//     await sendInviteEmail(
//       email,
//       foundWorkspace.name
//     );

//     return res.status(200).json({
//       message: "Member added and invitation sent",
//       workspace: foundWorkspace
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: error.message
//     });
//   }
// }; 




export const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const { workspaceId } = req.params;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const foundWorkspace = await Workspace.findById(workspaceId);


    if (!foundWorkspace) {
      return res.status(404).json({
        message: "Workspace not found"
      });
    }

    // Check already member
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const alreadyMember = foundWorkspace.members.find(
        m => m.user.toString() === existingUser._id.toString()
      );

      if (alreadyMember) {
        return res.status(400).json({
          message: "User already a member"
        });
      }
    }

    // Generate token
    const token = await bcrypt.hash(Date.now().toString(), 10);

    // Save invite
    const invite = await WorkspaceInvite.create({
      workspace: workspaceId,
      email,
      token,
      invitedBy: req.user._id
    });

    // Send email with link
    // const inviteLink = `http://localhost:5173/accept-invite/${token}`;

    await sendInviteEmail(email,foundWorkspace.name ,token);

    return res.status(200).json({
      token,
      email,
      message: "Invitation sent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};  



export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await WorkspaceInvite.findOne({ token });

    if (!invite || invite.status !== "pending") {
      return res.status(400).json({
        message: "Invalid or expired invite"
      });
    }

    const user = await User.findOne({ email: invite.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const workspace = await Workspace.findById(invite.workspace);

    // Add to members
    workspace.members.push({
      user: user._id,
      role: invite.role || "team_member"
    });

    await workspace.save();

    // Update invite status
    invite.status = "accepted";
    await invite.save();

    return res.status(200).json({
      message: "You have joined the workspace"
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}; 



