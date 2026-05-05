import express from "express";
import {assignTaskMember, getProjectTask, getTask, moveTask } from "../controllers/Task/TaskController.js";
import { auth } from "../middlewares/authmiddlewares.js";

const router = express.Router();

router.get("/:taskId",auth, getTask);

router.get("/project/:projectId",auth,getProjectTask);

router.post("/assignee/:taskId",auth,assignTaskMember);

router.post("/move/:taskId",auth,moveTask)

export default router;