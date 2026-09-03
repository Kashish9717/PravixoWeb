import express from "express";

import {
  getProTips,
  createProTip,
  updateProTip,
  deleteProTip,
} from "../controllers/proTipController.js";

const router = express.Router();

router.get("/", getProTips);

router.post("/", createProTip);

router.put("/:tipId", updateProTip);

router.delete("/:tipId", deleteProTip);

export default router;