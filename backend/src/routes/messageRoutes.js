import express from "express";

import {
  sendMessage,
  getMessages,
  unsendMessage,
} from "../controllers/messageController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", optionalAuth, sendMessage);

router.get("/:conversationId", optionalAuth, getMessages);

router.patch("/:messageId/unsend", optionalAuth, unsendMessage);

export default router;