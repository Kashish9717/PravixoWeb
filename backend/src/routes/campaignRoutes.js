import express from "express";

import {
  listCampaigns,
  getCampaignById,
  getActiveCampaignsByBrand,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/brand/:brandId", listCampaigns);
router.get("/brand/:brandId/active", getActiveCampaignsByBrand);
router.get("/:id", getCampaignById);
router.post("/", createCampaign);
router.patch("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

export default router;