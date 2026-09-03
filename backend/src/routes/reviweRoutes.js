// Ye file review APIs ke URL routes ko controller functions se connect karti hai.

import express from "express";

import {
  canReview,
  submitReview,
  listReviewsForCreator,
  getAverageRating,
  toggleReviewVisibility,
} from "../controllers/reviewController.js";

const router = express.Router();

// Check whether a brand can review a creator.
router.get("/can-review/:creatorId", canReview);

// Submit a new review.
router.post("/", submitReview);

// Get reviews for a creator.
router.get("/creator/:creatorId", listReviewsForCreator);

// Get creator's average rating.
router.get("/creator/:creatorId/rating", getAverageRating);

// Toggle review visibility.
router.patch("/:reviewId/visibility", toggleReviewVisibility);

export default router;