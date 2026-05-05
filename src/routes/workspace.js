    import express from "express";
import {acceptInvite, createWorkspace, getAcceptedInvitedUsers, getlistWorkspace, getWorkspaceById, getWorkspaceMembers, inviteMember } from "../controllers/Workspace/workspaceControllers.js";
import { auth } from "../middlewares/authmiddlewares.js";
import { isOwner } from "../middlewares/adminmiddleware.js";
import { checkPlanLimit } from "../middlewares/checkPlanLimits.js";

const router = express.Router();

router.post("/create", auth, checkPlanLimit('workspace'), createWorkspace);

// router.post("/add-member/:workspaceId",auth,isOwner,inviteMember)
router.post("/add-member/:workspaceId", auth, isOwner, checkPlanLimit('member'), inviteMember);

router.get("/accept-invite",acceptInvite)

router.get("/get-workspaces/:workspaceId",auth,getWorkspaceById)

    router.get("/get-workspaces",auth,getlistWorkspace)
   
    router.get("/get-accepted-invites/:workspaceId",auth,getAcceptedInvitedUsers)  

    router.get("/get-workspace-members/:workspaceId",auth,getWorkspaceMembers)


    export default router;