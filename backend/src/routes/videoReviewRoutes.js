import express from "express";

import {
  getVideoReviews,
  getVideoReviewById,
  createVideoReview,
  updateVideoReview,
  deleteVideoReview,
} from "../controllers/videoReviewController.js";

const router = express.Router();

// Get all video reviews
router.get("/", getVideoReviews);

// Get single video review
router.get("/:id", getVideoReviewById);

// Create video review
router.post("/", createVideoReview);

// Update video review
router.put("/:id", updateVideoReview);

// Delete video review
router.delete("/:id", deleteVideoReview);

export default router;