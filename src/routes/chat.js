import express from "express";
import { auth } from "../middlewares/authmiddlewares.js";
import {
  getOrCreateWorkspaceChat,
  getChatMessages,
  getUserChatRooms
} from "../controllers/Chat/ChatController.js";

const router = express.Router();

router.use(auth);


router.get("/workspace/:workspaceId", getOrCreateWorkspaceChat);
router.get("/messages/:roomId", getChatMessages);
router.get("/rooms", getUserChatRooms);

export default router;
