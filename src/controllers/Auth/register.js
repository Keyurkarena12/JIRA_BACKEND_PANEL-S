import User from "../../models/user.js";
import { registerValidation } from "../../validators/register.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loginvalidation } from "../../validators/login.js";
import sendPasswordResetEmail from "../../middlewares/PasswordresetEmail.js";
import { resetpasswordValidation } from "../../validators/resetpassword.js";
import cloudinary from "../../config/cloudinary.js";
import Workspace from "../../models/workspace.js";
import Plan from "../../models/plan.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { error } = registerValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      plan: "free"
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User created successfully",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};


// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { error } = loginvalidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google or GitHub login. Please sign in with that instead.",
        success: false
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
        success: false
      });
    }

    await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};


// ================= FORGOT PASSWORD =================
export const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false
      });
    }

    const resetpasswordcode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    user.resetPasswordCode = resetpasswordcode;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    await sendPasswordResetEmail(user.email, resetpasswordcode);

    res.status(200).json({
      message: "Password reset email sent successfully",
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};


// ================= RESET PASSWORD =================
export const resetpassword = async (req, res) => {
  try {
    const { error } = resetpasswordValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false
      });
    }

    const { email, resetpasswordcode, newpassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false
      });
    }

    if (user.resetPasswordCode !== resetpasswordcode) {
      return res.status(400).json({
        message: "Invalid reset code",
        success: false
      });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({
        message: "Reset code has expired. Please request a new one.",
        success: false
      });
    }

    user.password = await bcrypt.hash(newpassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};


// ================= GOOGLE CALLBACK =================
export const googleCallback = async (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/success-login?access_token=${token}`
    );

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};


// ================= GITHUB CALLBACK =================
export const githubCallback = async (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.redirect(
      `${process.env.FRONTEND_URL}/success-login?access_token=${token}`
    );

  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    });
  }
};


// ================= GET USER (JWT passport) =================
export const getuser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false
      });
    }

    res.json({ user: req.user });

  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};


// ================= GET CURRENT USER =================
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    // Used only to derive role for the client; workspace creation lives in workspace controllers.
    const ownedWorkspace = await Workspace.findOne({ owner: userId });
    const role = ownedWorkspace ? "owner" : "team_member";

    // ✅ Plan.name is a specific variant (e.g. pro_monthly), not the group (pro)
    const planDoc = await Plan.findOne({
      name: user.specificPlan || "free",
      isActive: true
    });

    res.json({
      ...user.toObject(),
      role,
      plan: user.plan,
      specificPlan: user.specificPlan, // Include specific plan variant
      planLimits: planDoc ? {
        workspaces: planDoc.limits.workspaces === -1 ? "Unlimited" : planDoc.limits.workspaces,
        membersPerWorkspace: planDoc.limits.membersPerWorkspace === -1 ? "Unlimited" : planDoc.limits.membersPerWorkspace,
        chat: planDoc.limits.chat
      } : null
    });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};


// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax"
    });

    res.status(200).json({
      message: "Logout successful",
      success: true
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};


// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const { name, removeAvatar } = req.body;
    const file = req.files?.photo;
    const shouldRemoveAvatar = removeAvatar === true || removeAvatar === "true";

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (file) {
      if (user?.avatar?.publicId) {
        await cloudinary.uploader.destroy(user.avatar.publicId);
      }

      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "user_avatars"
      });

      user.avatar = {
        url: result.secure_url,
        publicId: result.public_id
      };
    } else if (shouldRemoveAvatar) {
      if (user?.avatar?.publicId) {
        await cloudinary.uploader.destroy(user.avatar.publicId);
      }

      user.avatar = undefined;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    res.json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};