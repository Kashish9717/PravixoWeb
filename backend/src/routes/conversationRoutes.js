import express from "express";

import {
  startConversation,
  getConversations,
  getConversationDetails,
  markAsRead,
  toggleArchive,
} from "../controllers/conversationController.js";

const router = express.Router();

router.post("/", startConversation);

router.get("/", getConversations);

router.get("/:conversationId", getConversationDetails);

router.patch("/:conversationId/read", markAsRead);

router.patch("/:conversationId/archive", toggleArchive);

export default router;