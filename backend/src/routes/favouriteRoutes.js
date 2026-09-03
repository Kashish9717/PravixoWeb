import express from "express";

import {
  listFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "../controllers/favoriteController.js";

const router = express.Router();

router.get("/", listFavorites);
router.get("/check", checkFavorite);
router.post("/", addFavorite);
router.delete("/", removeFavorite);

export default router;