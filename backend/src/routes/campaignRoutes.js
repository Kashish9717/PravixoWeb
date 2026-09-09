import express from "express";
import { protect, optionalAuth } from "../middleware/auth.js";
import {
  listCampaigns,
  getDiscoverableCampaigns,
  getCampaignById,
  getActiveCampaignsByBrand,
  createCampaign,
  joinCampaignRequest,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaignController.js";

const router = express.Router();

// Creator discovery of approved campaigns
router.get("/discover", optionalAuth, getDiscoverableCampaigns);

// Brand-specific campaigns
router.get("/brand/:brandId", listCampaigns);
router.get("/brand/:brandId/active", getActiveCampaignsByBrand);

// Campaign details
router.get("/:id", getCampaignById);

// Create campaign (protected brand)
router.post("/", protect, createCampaign);

// Creator request to join campaign (protected creator)
router.post("/:id/join", protect, joinCampaignRequest);

// Update/delete
router.patch("/:id", protect, updateCampaign);
router.delete("/:id", protect, deleteCampaign);

export default router;