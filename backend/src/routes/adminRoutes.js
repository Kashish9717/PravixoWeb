import express from "express";
import { adminProtect } from "../middleware/auth.js";
import {
  getStats,
  listAllConversations,
  listMessages,
  deleteProfile,
  deleteConversation,
  updateProfileRole,
  updateVerificationStatus,
  getPendingCreators,
  getPendingBrands,
  getCreatorVerificationHistory,
  getBrandVerificationHistory,
  suspendProfile,
  unsuspendProfile,
  listAllTasks,
  listAllPayments,
  resolveDispute,
  getRevenueStats,
  getWebhookLogs,
  listAllProfiles,
  listAllSubscriptions,
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackage,
  reorderPackages,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOffer,
  getPopupSettings,
  updatePopupSettings,
  getSubscriptionAnalytics,
  getClientReviews,
  createClientReview,
  updateClientReview,
  deleteClientReview,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getProTips,
  createProTip,
  updateProTip,
  deleteProTip,
  updateAdminCredentials,
  bulkDeleteMessages,
  getAdminActivityFeed,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(adminProtect);

// Aggregate stats & overview
router.get("/stats", getStats);
router.get("/revenue-stats", getRevenueStats);

// Admin Credentials
router.put("/credentials", updateAdminCredentials);

// Subscriptions & Packages
router.get("/subscriptions", listAllSubscriptions);
router.get("/subscription-analytics", getSubscriptionAnalytics);

router.get("/packages", getPackages);
router.post("/packages", createPackage);
router.put("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);
router.post("/packages/:id/toggle", togglePackage);
router.post("/packages/reorder", reorderPackages);

router.get("/offers", getOffers);
router.post("/offers", createOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", deleteOffer);
router.post("/offers/:id/toggle", toggleOffer);

router.get("/popup-settings", getPopupSettings);
router.post("/popup-settings", updatePopupSettings);

// Content Management
router.get("/content/client-reviews", getClientReviews);
router.post("/content/client-reviews", createClientReview);
router.put("/content/client-reviews/:id", updateClientReview);
router.delete("/content/client-reviews/:id", deleteClientReview);

router.get("/content/blogs", getBlogs);
router.post("/content/blogs", createBlog);
router.put("/content/blogs/:id", updateBlog);
router.delete("/content/blogs/:id", deleteBlog);

router.get("/content/protips", getProTips);
router.post("/content/protips", createProTip);
router.put("/content/protips/:id", updateProTip);
router.delete("/content/protips/:id", deleteProTip);

// Users (Profiles)
router.get("/profiles", listAllProfiles);

// Conversations & Messages moderation
router.get("/conversations", listAllConversations);
router.get("/conversations/:id/messages", listMessages);
router.delete("/conversations/:id", deleteConversation);
router.post("/messages/bulk-delete", bulkDeleteMessages);

// User & Profile management
router.delete("/profiles/:id", deleteProfile);
router.patch("/profiles/:id/role", updateProfileRole);
router.patch("/profiles/:id/verification", updateVerificationStatus);
router.post("/profiles/:id/suspend", suspendProfile);
router.post("/profiles/:id/unsuspend", unsuspendProfile);

// KYC Verification queues
router.get("/verification/creators/pending", getPendingCreators);
router.get("/verification/brands/pending", getPendingBrands);
router.get("/verification/creators/history", getCreatorVerificationHistory);
router.get("/verification/brands/history", getBrandVerificationHistory);

// Campaign tasks monitoring
router.get("/tasks", listAllTasks);

// Payments & Escrow arbitration
router.get("/payments", listAllPayments);
router.post("/payments/:id/resolve-dispute", resolveDispute);

// Webhook audit logs
router.get("/webhooks/logs", getWebhookLogs);

// Admin activity feed (for notification bell)
router.get("/activity", getAdminActivityFeed);

export default router;
