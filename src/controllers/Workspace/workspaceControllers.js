import User from "../../models/user.js";
import Workspace from "../../models/workspace.js";
import Plan from "../../models/plan.js";
import sendInviteEmail from "../../middlewares/InviteEmail.js";
import bcrypt from "bcryptjs";
import WorkspaceInvite from "../../models/WorkspaceInvite.js";

// ================= SLUG GENERATION HELPER =================
const generateSlug = async (name) => {
  // Convert to lowercase and replace spaces with hyphens
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Check if slug exists, if so, append a number
  let originalSlug = slug;
  let counter = 1;
  
  while (await Workspace.findOne({ slug })) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// ================= HELPER — fetch plan limits from DB =================
const getPlanLimits = async (planName) => {
  const planDoc = await Plan.findOne({ name: planName || "free", isActive: true });
  if (!planDoc) return null;
  return {
    workspaces: planDoc.limits.workspaces === -1 ? Infinity : planDoc.limits.workspaces,
    membersPerWorkspace: planDoc.limits.membersPerWorkspace === -1 ? Infinity : planDoc.limits.membersPerWorkspace,
    chat: planDoc.limits.chat
  };
};

// ================= CREATE WORKSPACE =================
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Workspace name is required."
      });
    }

    // Auto-generate slug from name
    const slug = await generateSlug(name);

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
      currentPlan: req.currentPlan,
      limits: req.planLimits
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const alreadyMember = foundWorkspace.members.find(
        m => m.user.toString() === existingUser._id.toString()
      );
      if (alreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }
    }

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
      email,
      token
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

    const alreadyMember = workspace.members.find(
      m => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      invite.status = "accepted";
      await invite.save();
      return res.status(200).json({
        message: "You are already a member of this workspace",
        workspace: {
          _id: workspace._id,
          id: workspace._id,
          name: workspace.name
        }
      });
    }

    // ✅ Fetch owner plan limits from DB
    const owner = await User.findById(workspace.owner);
    const ownerPlan = owner?.plan || "free";
    const planLimits = await getPlanLimits(ownerPlan);
    const currentMemberCount = workspace.members.length;

    if (
      planLimits &&
      planLimits.membersPerWorkspace !== Infinity &&
      currentMemberCount >= planLimits.membersPerWorkspace
    ) {
      return res.status(403).json({
        message: `This workspace has reached its member limit (${planLimits.membersPerWorkspace}) on the ${ownerPlan} plan. The owner needs to upgrade.`
      });
    }

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
        _id: workspace._id,
        id: workspace._id,
        name: workspace.name
      }
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ================= GET WORKSPACE BY ID =================
export const getWorkspaceById = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email plan")
      .populate("members.user", "name email avatar");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ Fetch plan limits from DB
    const ownerPlan = workspace.owner?.plan || "free";
    const planLimits = await getPlanLimits(ownerPlan);

    return res.status(200).json({
      workspace,
      currentPlan: ownerPlan,
      limits: planLimits
    });

  } catch (error) {
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

    return res.status(200).json({
      workspaces: workspaces || []
    });

  } catch (error) {
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

    // ✅ Fetch plan limits from DB
    const owner = await User.findById(workspace.owner);
    const ownerPlan = owner?.plan || "free";
    const planLimits = await getPlanLimits(ownerPlan);

    res.status(200).json({
      success: true,
      members: workspace.members,
      currentPlan: ownerPlan,
      memberLimit: planLimits?.membersPerWorkspace === Infinity
        ? "Unlimited"
        : planLimits?.membersPerWorkspace
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