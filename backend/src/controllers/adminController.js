import mongoose from "mongoose";
import Profile from "../models/Profile.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Favorite from "../models/Favorite.js";
import PricingTier from "../models/PricingTier.js";
import Portfolio from "../models/Portfolio.js";
import Campaign from "../models/Campaign.js";
import CampaignTask from "../models/CampaignTask.js";
import Payment from "../models/Payment.js";
import PaymentAuditLog from "../models/PaymentAuditLog.js";
import CreatorBankDetails from "../models/CreatorBankDetails.js";
import WebhookLog from "../models/WebhookLog.js";
import Notification from "../models/Notification.js";
import UserSubscription from "../models/UserSubscription.js";

// =====================================================
// AGGREGATE STATS
// GET /api/admin/stats
// =====================================================
export const getStats = async (req, res) => {
  try {
    const totalUsers = await Profile.countDocuments();
    const creators = await Profile.countDocuments({ role: "creator" });
    const brands = await Profile.countDocuments({ role: "brand" });
    const conversations = await Conversation.countDocuments();
    const messages = await Message.countDocuments();
    const favorites = await Favorite.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        creators,
        brands,
        conversations,
        messages,
        favorites,
      },
    });
  } catch (error) {
    console.error("Admin getStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch aggregate stats.",
      error: error.message,
    });
  }
};

// =====================================================
// LIST ALL CONVERSATIONS
// GET /api/admin/conversations
// =====================================================
export const listAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate("creatorId", "fullName email handle avatarUrl role")
      .populate("brandId", "fullName email handle avatarUrl role")
      .populate("campaignId", "title budget category")
      .lean();

    const results = await Promise.all(
      conversations.map(async (c) => {
        const messages = await Message.find({ conversationId: c._id })
          .sort({ createdAt: -1 })
          .limit(1)
          .lean();

        const messageCount = await Message.countDocuments({ conversationId: c._id });

        return {
          ...c,
          creator: c.creatorId,
          brand: c.brandId,
          campaign: c.campaignId,
          lastMessage: messages[0] || null,
          messageCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Admin listAllConversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list conversations.",
      error: error.message,
    });
  }
};

// =====================================================
// LIST MESSAGES FOR A CONVERSATION
// GET /api/admin/conversations/:id/messages
// =====================================================
export const listMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id)
      .populate("creatorId", "fullName email handle avatarUrl")
      .populate("brandId", "fullName email handle avatarUrl")
      .lean();

    const messages = await Message.find({ conversationId: id })
      .populate("senderId", "fullName email handle avatarUrl")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        conversation,
        creator: conversation?.creatorId || null,
        brand: conversation?.brandId || null,
        messages,
      },
    });
  } catch (error) {
    console.error("Admin listMessages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list messages.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE PROFILE (CASCADE)
// DELETE /api/admin/profiles/:id
// =====================================================
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Reason from admin

    // Delete pricing tiers
    await PricingTier.deleteMany({ profileId: id });

    // Delete portfolio
    await Portfolio.deleteMany({ profileId: id });

    // Delete favorites
    await Favorite.deleteMany({ $or: [{ brandId: id }, { creatorId: id }] });

    // Delete conversations & messages
    const convs = await Conversation.find({
      $or: [{ creatorId: id }, { brandId: id }],
    });
    const convIds = convs.map((c) => c._id);

    await Message.deleteMany({ conversationId: { $in: convIds } });
    await Conversation.deleteMany({ _id: { $in: convIds } });

    // Soft Delete profile so they can see the message
    const profile = await Profile.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deleteReason: reason || "Violation of platform terms.",
      },
      { new: true }
    );

    await Notification.create({
      recipientId: id,
      senderId: req.user?.profileId || id, 
      type: "account_deleted",
      text: `Your account has been deleted. Reason: ${reason || "Violation of platform terms."}`,
    });

    return res.status(200).json({
      success: true,
      message: "Profile soft-deleted and all related records deleted successfully.",
    });
  } catch (error) {
    console.error("Admin deleteProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete profile.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE CONVERSATION
// DELETE /api/admin/conversations/:id
// =====================================================
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.deleteMany({ conversationId: id });
    await Conversation.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully.",
    });
  } catch (error) {
    console.error("Admin deleteConversation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete conversation.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE PROFILE ROLE
// PATCH /api/admin/profiles/:id/role
// =====================================================
export const updateProfileRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["creator", "brand"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'creator' or 'brand'.",
      });
    }

    const profile = await Profile.findByIdAndUpdate(id, { role }, { new: true });

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Admin updateProfileRole error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile role.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE VERIFICATION STATUS (KYC APPROVE/REJECT)
// PATCH /api/admin/profiles/:id/verification
// =====================================================
export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unverified", "pending", "verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status.",
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Verification status updated to ${status}.`,
      data: profile,
    });
  } catch (error) {
    console.error("Admin updateVerificationStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update verification status.",
      error: error.message,
    });
  }
};

// =====================================================
// GET PENDING CREATORS KYC
// GET /api/admin/verification/creators/pending
// =====================================================
export const getPendingCreators = async (req, res) => {
  try {
    const creators = await Profile.find({
      role: "creator",
      verificationStatus: "pending",
    }).lean();

    return res.status(200).json({
      success: true,
      data: creators,
    });
  } catch (error) {
    console.error("Admin getPendingCreators error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending creators.",
      error: error.message,
    });
  }
};

// =====================================================
// GET PENDING BRANDS KYC
// GET /api/admin/verification/brands/pending
// =====================================================
export const getPendingBrands = async (req, res) => {
  try {
    const brands = await Profile.find({
      role: "brand",
      verificationStatus: "pending",
    }).lean();

    return res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Admin getPendingBrands error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending brands.",
      error: error.message,
    });
  }
};

// =====================================================
// GET CREATOR VERIFICATION HISTORY
// GET /api/admin/verification/creators/history
// =====================================================
export const getCreatorVerificationHistory = async (req, res) => {
  try {
    const creators = await Profile.find({
      role: "creator",
      verificationStatus: { $in: ["verified", "rejected"] },
    }).lean();

    return res.status(200).json({
      success: true,
      data: creators,
    });
  } catch (error) {
    console.error("Admin getCreatorVerificationHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch creator history.",
      error: error.message,
    });
  }
};

// =====================================================
// GET BRAND VERIFICATION HISTORY
// GET /api/admin/verification/brands/history
// =====================================================
export const getBrandVerificationHistory = async (req, res) => {
  try {
    const brands = await Profile.find({
      role: "brand",
      verificationStatus: { $in: ["verified", "rejected"] },
    }).lean();

    return res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Admin getBrandVerificationHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand history.",
      error: error.message,
    });
  }
};

// =====================================================
// SUSPEND PROFILE
// POST /api/admin/profiles/:id/suspend
// =====================================================
export const suspendProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, durationDays } = req.body;

    const days = Number(durationDays) || 7;
    const suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const profile = await Profile.findByIdAndUpdate(
      id,
      {
        isSuspended: true,
        suspensionReason: reason || "Violation of platform guidelines.",
        suspendedUntil,
      },
      { new: true }
    );

    await Notification.create({
      recipientId: profile._id,
      senderId: req.user.profileId, // Admin ID
      type: "account_suspended",
      text: `Your account has been suspended for ${days} days. Reason: ${reason || "Violation of platform guidelines."}`,
    });

    return res.status(200).json({
      success: true,
      message: `Profile suspended for ${days} days.`,
      data: profile,
    });
  } catch (error) {
    console.error("Admin suspendProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to suspend profile.",
      error: error.message,
    });
  }
};

// =====================================================
// UNSUSPEND PROFILE
// POST /api/admin/profiles/:id/unsuspend
// =====================================================
export const unsuspendProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findByIdAndUpdate(
      id,
      {
        isSuspended: false,
        suspensionReason: "",
        suspendedUntil: null,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile unsuspended successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("Admin unsuspendProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unsuspend profile.",
      error: error.message,
    });
  }
};

// =====================================================
// LIST ALL TASKS
// GET /api/admin/tasks
// =====================================================
export const listAllTasks = async (req, res) => {
  try {
    const tasks = await CampaignTask.find()
      .populate("campaignId", "title budget category")
      .populate("creatorId", "fullName email handle avatarUrl")
      .populate("brandId", "fullName email handle avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Admin listAllTasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list tasks.",
      error: error.message,
    });
  }
};

// =====================================================
// LIST ALL PAYMENTS & ESCROW
// GET /api/admin/payments
// =====================================================
export const listAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("campaignId", "title budget")
      .populate("creatorId", "fullName email handle avatarUrl")
      .populate("brandId", "fullName email handle avatarUrl")
      .populate("taskId", "title deliverables status")
      .sort({ createdAt: -1 })
      .lean();

    const withAudit = await Promise.all(
      payments.map(async (p) => {
        const auditLogs = await PaymentAuditLog.find({ paymentId: p._id })
          .sort({ createdAt: -1 })
          .lean();
        return {
          ...p,
          campaign: p.campaignId,
          creator: p.creatorId,
          brand: p.brandId,
          task: p.taskId,
          auditLogs,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: withAudit,
    });
  } catch (error) {
    console.error("Admin listAllPayments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list payments.",
      error: error.message,
    });
  }
};

// =====================================================
// RESOLVE PAYMENT DISPUTE
// POST /api/admin/payments/:id/resolve-dispute
// =====================================================
export const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body; // "release" | "refund"

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    if (payment.paymentStatus !== "disputed") {
      return res.status(400).json({
        success: false,
        message: "Payment is not in disputed status.",
      });
    }

    const now = new Date();

    if (resolution === "release") {
      const bankDetails = await CreatorBankDetails.findOne({ creatorId: payment.creatorId });

      payment.paymentStatus = "completed";
      payment.holdingStatus = "released";
      payment.releasedAt = now;
      payment.payoutStatus = "processed";
      payment.payoutReference = "RESOLVE-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      payment.creatorBankAccountId = bankDetails?._id || undefined;
      await payment.save();

      await PaymentAuditLog.create({
        paymentId: payment._id,
        action: "Released",
        details: "Dispute resolved by Admin. Funds released to Creator.",
        createdAt: now,
      });

      await Notification.create({
        recipientId: payment.brandId,
        senderId: payment.brandId,
        type: "payment_released",
        text: `Admin resolved dispute: Escrow payment of ₹${payment.grossAmount.toLocaleString()} released to Creator.`,
        taskId: payment.taskId,
        read: false,
      });

      await Notification.create({
        recipientId: payment.creatorId,
        senderId: payment.brandId,
        type: "payment_released",
        text: `Admin resolved dispute: Escrow payment of ₹${payment.creatorAmount.toLocaleString()} released to your account.`,
        taskId: payment.taskId,
        read: false,
      });
    } else {
      payment.paymentStatus = "refunded";
      payment.holdingStatus = "refunded";
      payment.refundStatus = "processed";
      payment.refundAmount = payment.grossAmount;
      payment.refundReason = "Admin Dispute Settlement Refund";
      await payment.save();

      await PaymentAuditLog.create({
        paymentId: payment._id,
        action: "Refund Initiated",
        details: "Admin resolved dispute. Refund processed back to Brand.",
        createdAt: now,
      });

      await Notification.create({
        recipientId: payment.brandId,
        senderId: payment.brandId,
        type: "payment_released",
        text: `Admin resolved dispute: Escrow payment of ₹${payment.grossAmount.toLocaleString()} refunded to your account.`,
        taskId: payment.taskId,
        read: false,
      });

      await Notification.create({
        recipientId: payment.creatorId,
        senderId: payment.brandId,
        type: "revision_requested",
        text: `Admin resolved dispute: Escrow payment of ₹${payment.creatorAmount.toLocaleString()} has been refunded to Brand.`,
        taskId: payment.taskId,
        read: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Dispute resolved with ${resolution}.`,
      data: payment,
    });
  } catch (error) {
    console.error("Admin resolveDispute error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resolve dispute.",
      error: error.message,
    });
  }
};

// =====================================================
// GET REVENUE STATS
// GET /api/admin/revenue-stats
// =====================================================
export const getRevenueStats = async (req, res) => {
  try {
    const payments = await Payment.find();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    let todayRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    let totalRevenue = 0;
    let platformCommissionEarned = 0;
    let paymentsInHolding = 0;
    let releasedPayments = 0;
    let disputedPayments = 0;

    for (const p of payments) {
      const isPaid =
        p.paymentStatus !== "pending" &&
        p.paymentStatus !== "invoice_generated" &&
        p.paymentStatus !== "refunded";

      if (isPaid) {
        totalRevenue += p.grossAmount || 0;
        platformCommissionEarned += p.platformCommissionAmount || 0;

        const timeDiff = now - new Date(p.createdAt).getTime();
        if (timeDiff <= oneDay) todayRevenue += p.grossAmount || 0;
        if (timeDiff <= oneWeek) weeklyRevenue += p.grossAmount || 0;
        if (timeDiff <= oneMonth) monthlyRevenue += p.grossAmount || 0;

        if (p.paymentStatus === "holding") {
          paymentsInHolding += p.grossAmount || 0;
        } else if (p.paymentStatus === "completed" || p.paymentStatus === "released") {
          releasedPayments += p.grossAmount || 0;
        } else if (p.paymentStatus === "disputed") {
          disputedPayments += p.grossAmount || 0;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        totalRevenue,
        platformCommissionEarned,
        paymentsInHolding,
        releasedPayments,
        disputedPayments,
      },
    });
  } catch (error) {
    console.error("Admin getRevenueStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch revenue stats.",
      error: error.message,
    });
  }
};

// =====================================================
// GET WEBHOOK LOGS
// GET /api/admin/webhooks/logs
// =====================================================
export const getWebhookLogs = async (req, res) => {
  try {
    const logs = await WebhookLog.find().sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Admin getWebhookLogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch webhook logs.",
      error: error.message,
    });
  }
};

// =====================================================
// LIST ALL PROFILES
// GET /api/admin/profiles
// =====================================================
export const listAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().lean();
    return res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error("Admin listAllProfiles error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list profiles.",
      error: error.message,
    });
  }
};

// =====================================================
// LIST ALL SUBSCRIPTIONS
// GET /api/admin/subscriptions
// =====================================================
export const listAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await UserSubscription.find()
      .populate("brandId", "fullName email handle avatarUrl")
      .populate("packageId", "name durationMonths price")
      .lean();
    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Admin listAllSubscriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list subscriptions.",
      error: error.message,
    });
  }
};

// =====================================================
// SUBSCRIPTION PACKAGES CRUD
// =====================================================
import SubscriptionPackage from "../models/SubscriptionPackage.js";
import SubscriptionOffer from "../models/SubscriptionOffer.js";
import PopupSetting from "../models/PopupSetting.js";
import OfferAnalytics from "../models/OfferAnalytics.js";

export const getPackages = async (req, res) => {
  try {
    const pkgs = await SubscriptionPackage.find().sort({ sortOrder: 1 });
    res.status(200).json({ success: true, data: pkgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPackage = async (req, res) => {
  try {
    const pkg = await SubscriptionPackage.create(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const pkg = await SubscriptionPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    await SubscriptionPackage.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePackage = async (req, res) => {
  try {
    const pkg = await SubscriptionPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: "Not found" });
    pkg.active = !pkg.active;
    await pkg.save();
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderPackages = async (req, res) => {
  try {
    const { packagesList } = req.body;
    await Promise.all(packagesList.map(p => SubscriptionPackage.findByIdAndUpdate(p.id, { sortOrder: p.sortOrder })));
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// SUBSCRIPTION OFFERS CRUD
// =====================================================
export const getOffers = async (req, res) => {
  try {
    const offers = await SubscriptionOffer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOffer = async (req, res) => {
  try {
    const offer = await SubscriptionOffer.create(req.body);
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await SubscriptionOffer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    await SubscriptionOffer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleOffer = async (req, res) => {
  try {
    const offer = await SubscriptionOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: "Not found" });
    offer.active = !offer.active;
    await offer.save();
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// POPUP SETTINGS
// =====================================================
export const getPopupSettings = async (req, res) => {
  try {
    let settings = await PopupSetting.findOne();
    if (!settings) settings = await PopupSetting.create({ showPopup: false, popupFrequency: "every_login", targetUsers: "both", popupExpiry: Date.now() });
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePopupSettings = async (req, res) => {
  try {
    let settings = await PopupSetting.findOne();
    if (settings) {
      settings = await PopupSetting.findByIdAndUpdate(settings._id, req.body, { new: true });
    } else {
      settings = await PopupSetting.create(req.body);
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// SUBSCRIPTION ANALYTICS
// =====================================================
export const getSubscriptionAnalytics = async (req, res) => {
  try {
    let analytics = await OfferAnalytics.findOne();
    if (!analytics) analytics = { popupViews: 0, popupClicks: 0, upgradeClicks: 0, conversionRate: 0, revenue: 0 };
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// CONTENT MANAGEMENT (CLIENT REVIEWS)
// =====================================================
import VideoReview from "../models/VideoReview.js";
import Blog from "../models/Blog.js";
import ProTip from "../models/ProTip.js";

export const getClientReviews = async (req, res) => {
  try {
    const reviews = await VideoReview.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClientReview = async (req, res) => {
  try {
    const review = await VideoReview.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClientReview = async (req, res) => {
  try {
    const review = await VideoReview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClientReview = async (req, res) => {
  try {
    await VideoReview.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// CONTENT MANAGEMENT (BLOGS)
// =====================================================
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// CONTENT MANAGEMENT (PRO TIPS)
// =====================================================
export const getProTips = async (req, res) => {
  try {
    const tips = await ProTip.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProTip = async (req, res) => {
  try {
    const tip = await ProTip.create(req.body);
    res.status(201).json({ success: true, data: tip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProTip = async (req, res) => {
  try {
    const tip = await ProTip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: tip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProTip = async (req, res) => {
  try {
    await ProTip.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// UPDATE ADMIN CREDENTIALS
// PUT /api/admin/credentials
// =====================================================
export const updateAdminCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // req.user is populated by adminProtect
    const adminId = req.user?.profileId;
    
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    if (!email && !password) {
      return res.status(400).json({ success: false, message: "Provide email or password to update." });
    }

    const updates = {};
    if (email) updates.email = email.trim().toLowerCase();
    
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      }
      const bcrypt = await import("bcryptjs");
      updates.password = await bcrypt.default.hash(password, 10);
    }

    await Profile.findByIdAndUpdate(adminId, updates);

    return res.status(200).json({
      success: true,
      message: "Admin credentials updated successfully.",
    });
  } catch (error) {
    console.error("Admin updateAdminCredentials error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update admin credentials.",
      error: error.message,
    });
  }
};
// =====================================================
// BULK DELETE MESSAGES
// POST /api/admin/messages/bulk-delete
// =====================================================
export const bulkDeleteMessages = async (req, res) => {
  try {
    const { messageIds, deleteType } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: "No messages selected." });
    }

    if (!["all", "creator", "brand"].includes(deleteType)) {
      return res.status(400).json({ success: false, message: "Invalid delete type." });
    }

    const updateFields = {
      deletedAt: new Date() // Set deletedAt for 7-day TTL auto-deletion
    };

    if (deleteType === "all") {
      updateFields.deletedByAdmin = true;
    } else if (deleteType === "creator") {
      updateFields.deletedForCreator = true;
    } else if (deleteType === "brand") {
      updateFields.deletedForBrand = true;
    }

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: updateFields }
    );

    return res.status(200).json({ success: true, message: "Messages deleted successfully." });
  } catch (error) {
    console.error("Bulk Delete Messages error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete messages." });
  }
};
