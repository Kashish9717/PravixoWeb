import express from "express";

import {
  getByProfile,
  upsertMany,
  remove,
} from "../controllers/pricingController.js";

const router = express.Router();

// GET pricing
// /api/pricing/profile/:profileId
router.get(
  "/profile/:profileId",
  getByProfile
);

// CREATE / UPDATE pricing
// /api/pricing
router.put(
  "/",
  upsertMany
);

// DELETE pricing
// /api/pricing/:id
router.delete(
  "/:id",
  remove
);

export default router;