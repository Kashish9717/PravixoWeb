import express from "express";

import {
  sendMessage,
  getMessages,
  unsendMessage,
} from "../controllers/messageController.js";
import { optionalAuth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", optionalAuth, upload.single("file"), sendMessage);

router.get("/:conversationId", optionalAuth, getMessages);

router.patch("/:messageId/unsend", optionalAuth, unsendMessage);

export default router;