import express from "express";
import { authenticateJWT } from "../middlewares/authMiddlewares.js";
import {
  sendMessage,
  getMessages,
  listConversations,
  markAsRead,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", authenticateJWT, sendMessage);

router.get("/conversations", authenticateJWT, listConversations);

router.get("/:conversationId/messages", authenticateJWT, getMessages);

router.put("/:messageId/read", authenticateJWT, markAsRead);

export default router;
