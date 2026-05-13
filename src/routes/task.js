import express from "express";
import {assignTaskMember, getProjectTask, getTask, moveTask, updateTask, deleteTask } from "../controllers/Task/TaskController.js";
import { auth } from "../middlewares/authmiddlewares.js";

const router = express.Router();

router.get("/project/:projectId",auth,getProjectTask);

router.get("/:taskId",auth, getTask); // new----13/05/2026

router.post("/assignee/:taskId",auth,assignTaskMember); // new----13/05/2026

router.post("/move/:taskId",auth,moveTask); // new----13/05/2026

router.put("/:taskId",auth,updateTask); // new----13/05/2026

router.delete("/:taskId",auth,deleteTask); // new----13/05/2026

export default router;
