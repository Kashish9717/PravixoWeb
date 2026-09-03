import express from "express";

import {
  getConnections,
  getConnectionById,
  getHistory,
  saveConnection,
  updateConnectionStats,
  disconnectPlatform,
  getOAuthClientIds,
  exchangeOAuthCode,
} from "../controllers/socialController.js";

const router = express.Router();

// =====================================================
// OAUTH
// =====================================================

router.get(
  "/oauth/client-ids",
  getOAuthClientIds
);

router.post(
  "/oauth/exchange",
  exchangeOAuthCode
);
// =====================================================
// SOCIAL CONNECTIONS
// =====================================================

// Get all connections of a profile
router.get(
  "/profile/:profileId",
  getConnections
);

// Get single connection
router.get(
  "/:connectionId",
  getConnectionById
);

// Get analytics history
router.get(
  "/:connectionId/history",
  getHistory
);

// Save / update social connection
router.post(
  "/",
  saveConnection
);

// Update social connection statistics
router.patch(
  "/:connectionId/stats",
  updateConnectionStats
);

// Disconnect social platform
router.delete(
  "/:connectionId",
  disconnectPlatform
);

export default router;



// --------------------------------------------------------------------------------------




