import express from "express";
import { addProjectMember, createProject, getAllProjects, getProjectMembers, updateProject } from "../controllers/Project/ProjectController.js";
import { auth } from "../middlewares/authmiddlewares.js";
import { isOwner } from "../middlewares/adminmiddleware.js";
import { checkPlanLimit } from "../middlewares/checkPlanLimits.js";
import { taskCreate } from "../controllers/Task/TaskController.js";

const router = express.Router();

router.post("/create-project/:workspaceId",auth,isOwner, checkPlanLimit('project'), createProject);
router.get("/get-all-projects/:workspaceId",auth, getAllProjects);
router.put("/update-project/:projectId",auth, updateProject);
router.post("/task/:projectId",auth, taskCreate);
router.post("/add-projectmember/:projectId",auth, checkPlanLimit('member'), addProjectMember);
router.get("/get-project-members/:projectId",auth,getProjectMembers);

export default router;