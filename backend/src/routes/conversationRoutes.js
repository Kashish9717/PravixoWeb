import express from "express";

import {
  startConversation,
  getConversations,
  getConversationDetails,
  markAsRead,
  toggleArchive,
  deleteUserConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

router.post("/", startConversation);

router.get("/", getConversations);

router.get("/:conversationId", getConversationDetails);

router.patch("/:conversationId/read", markAsRead);

router.patch("/:conversationId/archive", toggleArchive);

router.delete("/:conversationId", deleteUserConversation);

export default router;