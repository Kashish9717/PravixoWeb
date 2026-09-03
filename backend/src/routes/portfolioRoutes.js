import express from "express";

import {
  getByProfile,
  addImage,
  removeImage,
} from "../controllers/portfoliocontroller.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// Get all portfolio images
router.get(
  "/profile/:profileId",
  getByProfile
);

// Upload/add portfolio image
router.post(
  "/",
  upload.single("image"),
  addImage
);

// Delete portfolio image
router.delete(
  "/:id",
  removeImage
);

export default router;