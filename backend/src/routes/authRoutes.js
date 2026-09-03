import express from "express";

import {
  registerController,
  getMeController,
  loginController,
  logoutController,
  resetPasswordController,
} from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerController);

// GET /api/auth/me
router.get("/me", getMeController);

// POST /api/auth/login
router.post("/login", loginController);

// POST /api/auth/reset-password
router.post("/reset-password", resetPasswordController);

// POST /api/auth/logout
router.post("/logout", logoutController);
router.get("/logout", logoutController); // Support both GET and POST for ease of use

export default router;