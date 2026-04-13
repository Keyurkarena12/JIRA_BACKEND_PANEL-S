import express from "express";
import { createWorkspace } from "../controllers/Workspace/workspaceControllers.js";
import { auth } from "../middlewares/authmiddlewares.js";

const router = express.Router();

router.post("/create", auth, createWorkspace);

export default router;