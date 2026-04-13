import express from "express";
import { forgotpassword, login, register, resetpassword } from "../controllers/Auth/register.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotpassword);
router.post("/reset-password", resetpassword);


export default router;