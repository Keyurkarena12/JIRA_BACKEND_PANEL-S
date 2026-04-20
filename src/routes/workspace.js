import express from "express";
import {acceptInvite, createWorkspace, inviteMember } from "../controllers/Workspace/workspaceControllers.js";
import { auth } from "../middlewares/authmiddlewares.js";
import { isOwner } from "../middlewares/adminmiddleware.js";

const router = express.Router();

router.post("/create", auth, createWorkspace);

router.post("/add-member/:workspaceId",auth,isOwner,inviteMember)

router.post("/accept-invite/:token",auth,acceptInvite)

export default router;