import express from "express";

import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getNavbarNotificationCount,
  getRequestsForBrand,
  getRequestsForCreator,
  getConnectionStatus,
  markCreatorNotificationsSeen,
  getAllConnections,
  getMyRequestsForCreator,
  getApprovedCollaborationsForBrand,
} from "../controllers/connectionController.js";

const router = express.Router();

router.post("/request", sendRequest);

router.patch("/:connectionId/accept", acceptRequest);

router.patch("/:connectionId/reject", rejectRequest);

router.get("/notification-count", getNavbarNotificationCount);

router.get("/brand/:brandId/requests", getRequestsForBrand);

router.get("/creator/:creatorId/requests", getRequestsForCreator);

router.get("/status", getConnectionStatus);

router.patch(
  "/creator/:creatorId/notifications-seen",
  markCreatorNotificationsSeen
);

router.get("/all", getAllConnections);

router.get(
  "/creator/:creatorId/my-requests",
  getMyRequestsForCreator
);

router.get(
  "/brand/:brandId/approved",
  getApprovedCollaborationsForBrand
);

export default router;