import express from "express";
import { auth } from "../middlewares/authmiddlewares.js";
import {
  getOrCreateWorkspaceChat,
  getOrCreateProjectChat,
  getChatMessages,
  getUserChatRooms
} from "../controllers/Chat/ChatController.js";

import { getOrCreateDirectChat, getDirectConversations, searchUsers } from "../controllers/Chat/DirectChatController.js";
const router = express.Router();

router.use(auth);


router.get("/workspace/:workspaceId", getOrCreateWorkspaceChat);
router.get("/project/:projectId", getOrCreateProjectChat);
router.get("/messages/:roomId", getChatMessages);
router.get("/rooms", getUserChatRooms);


// direact one to one  user 
router.get("/direct/conversations", getDirectConversations);
router.get("/direct/search", searchUsers);
router.get("/direct/:userId", getOrCreateDirectChat);

export default router;
