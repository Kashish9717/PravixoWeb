import express from "express";

import {
  createTask,
  startTask,
  submitTask,
  reviewTask,
  getTasksForCreator,
  getTasksForBrand,
  getNotifications,
  markNotificationRead,
} from "../controllers/taskController.js";

const router = express.Router();

// ==========================================
// TASKS
// ==========================================

// Create task
router.post("/", createTask);

// Start task
router.patch("/:taskId/start", startTask);

// Submit task
router.patch("/:taskId/submit", submitTask);

// Approve / request revision
router.patch("/:taskId/review", reviewTask);

// Get tasks for creator
router.get("/creator/:creatorId", getTasksForCreator);

// Get tasks for brand
router.get("/brand/:brandId", getTasksForBrand);

// ==========================================
// NOTIFICATIONS
// ==========================================

// Get notifications
router.get("/notifications/:recipientId", getNotifications);

// Mark notification as read
router.patch(
  "/notifications/:notificationId/read",
  markNotificationRead
);

export default router;