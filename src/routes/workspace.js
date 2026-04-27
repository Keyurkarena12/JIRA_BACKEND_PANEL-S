    import express from "express";
    import {acceptInvite, createWorkspace, getlistWorkspace, getWorkspaceById, inviteMember } from "../controllers/Workspace/workspaceControllers.js";
    import { auth } from "../middlewares/authmiddlewares.js";
    import { isOwner } from "../middlewares/adminmiddleware.js";

    const router = express.Router();

    router.post("/create", auth, createWorkspace);

    router.post("/add-member/:workspaceId",auth,isOwner,inviteMember)

    router.get("/accept-invite",acceptInvite)

    router.get("/get-workspaces/:workspaceId",auth,isOwner,getWorkspaceById)

    router.get("/get-workspaces",auth,getlistWorkspace)


    export default router;