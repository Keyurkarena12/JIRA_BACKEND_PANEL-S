import express from "express";
import { getPlans, getPlanByName } from "../controllers/plan/planController.js";

const router = express.Router();

// ✅ Public — no auth needed
router.get("/get-all-plans", getPlans);
router.get("/:name", getPlanByName);

export default router;