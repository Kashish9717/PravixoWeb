import express from "express";

import {
  canReview,
  submitReview,
  listReviewsForTarget,
  getAverageRating,
  getAdminReviews,
  approveReview,
  rejectReview,
  toggleReviewVisibility,
} from "../controllers/reviewController.js";

const router = express.Router();

// Check whether brand or creator can review the other party
router.get("/can-review/:targetId", canReview);
router.get("/can-review/creator/:targetId", canReview);

// Submit a new review (brand reviewing creator or creator reviewing brand)
router.post("/", submitReview);

// Get approved reviews for a creator or brand profile
router.get("/creator/:creatorId", listReviewsForTarget);
router.get("/target/:targetId", listReviewsForTarget);

// Get average rating
router.get("/creator/:creatorId/rating", getAverageRating);
router.get("/target/:targetId/rating", getAverageRating);

// ADMIN moderation routes
router.get("/admin/all", getAdminReviews);
router.patch("/admin/:reviewId/approve", approveReview);
router.patch("/admin/:reviewId/reject", rejectReview);

// Toggle review visibility
router.patch("/:reviewId/visibility", toggleReviewVisibility);

export default router;