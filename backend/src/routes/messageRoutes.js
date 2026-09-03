import express from "express";

import {
  sendMessage,
  getMessages,
  unsendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);

router.get("/:conversationId", getMessages);

router.patch("/:messageId/unsend", unsendMessage);

export default router;