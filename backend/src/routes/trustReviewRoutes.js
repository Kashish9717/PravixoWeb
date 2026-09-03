import express from "express";

import {
  getTrustReviews,
  createTrustReview,
  updateTrustReview,
  deleteTrustReview,
} from "../controllers/trustReviewController.js";

const router = express.Router();

router.get("/", getTrustReviews);

router.post("/", createTrustReview);

router.put("/:reviewId", updateTrustReview);

router.delete("/:reviewId", deleteTrustReview);

export default router;