import express from "express";

import {
  getPackages,
  getOffers,
  getUserSubscription,
  createSubscription,
  cancelSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/packages", getPackages);

router.get("/offers", getOffers);

router.get("/user/:profileId", getUserSubscription);

router.post("/", createSubscription);

router.patch("/:subscriptionId/cancel", cancelSubscription);

export default router;