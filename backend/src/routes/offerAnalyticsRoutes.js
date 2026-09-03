import express from "express";

import {
  getOfferAnalytics,
  updateOfferAnalytics,
} from "../controllers/offerAnalyticsController.js";

const router = express.Router();

router.get("/:offerId", getOfferAnalytics);

router.patch("/:offerId", updateOfferAnalytics);

export default router;