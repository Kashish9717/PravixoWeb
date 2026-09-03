import express from "express";

import {
  getPopupSettings,
  updatePopupSettings,
} from "../controllers/popupSettingsController.js";

const router = express.Router();

router.get("/", getPopupSettings);

router.put("/", updatePopupSettings);

export default router;