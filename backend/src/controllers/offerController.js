import Offer from "../models/Offer.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";
import { sendPushToUsers, sendPushToUser } from "../utils/webPush.js";

// POST /api/offers
export const createOffer = async (req, res) => {
  try {
    const {
      offerTitle,
      conditionText,
      offerCategory = "discount",
      discountPercent,
      monetaryBonus,
      validityHours,
    } = req.body;

    const userProfileId = req.user?._id || req.body.creatorId || req.body.brandId;
    if (!userProfileId) {
      return res.status(400).json({
        success: false,
        message: "User profile ID is required.",
      });
    }

    if (!offerTitle || !offerTitle.trim() || !conditionText || !conditionText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Offer title and condition text are required.",
      });
    }

    const numericValidity = Number(validityHours);
    if (isNaN(numericValidity) || numericValidity <= 0) {
      return res.status(400).json({
        success: false,
        message: "validityHours must be a positive number greater than 0.",
      });
    }

    const userProfile = await Profile.findById(userProfileId)
      .select("fullName handle role email avatarUrl")
      .lean();

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const isCreator = userProfile.role === "creator";
    const isBrand = userProfile.role === "brand";

    if (!isCreator && !isBrand) {
      return res.status(403).json({
        success: false,
        message: "Only creators and brands can publish offers.",
      });
    }

    const roleType = isCreator ? "creator" : "brand";

    let numDiscount = null;
    if (discountPercent !== undefined && discountPercent !== null) {
      numDiscount = Number(discountPercent);
      if (isNaN(numDiscount) || numDiscount < 1 || numDiscount > 90) {
        return res.status(400).json({
          success: false,
          message: "Discount percent must be between 1 and 90.",
        });
      }
    }

    const offer = await Offer.create({
      creatorId: isCreator ? userProfileId : null,
      brandId: isBrand ? userProfileId : null,
      creatorOrBrandType: roleType,
      offerTitle: offerTitle.trim(),
      conditionText: conditionText.trim(),
      offerCategory,
      discountPercent: numDiscount,
      monetaryBonus: monetaryBonus ? Number(monetaryBonus) : null,
      validityHours: numericValidity,
      status: "pending_approval",
    });

    // Notify Admins about new offer submission
    const admins = await Profile.find({ role: "admin", isDeleted: { $ne: true } })
      .select("_id")
      .lean();

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map((adm) => ({
        recipientId: adm._id,
        senderId: userProfileId,
        type: "admin_message",
        text: `New ${roleType} offer submitted by ${userProfile.fullName || userProfile.handle}: "${offerTitle.trim()}" awaiting review.`,
        targetUrl: "/offers",
        createdAt: Date.now(),
      }));

      Notification.insertMany(adminNotifications, { ordered: false }).catch((err) =>
        console.error("Admin offer notification error:", err.message)
      );
    }

    return res.status(201).json({
      success: true,
      message: "Offer submitted successfully and sent to admin for approval.",
      data: offer,
    });
  } catch (error) {
    console.error("createOffer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create offer.",
      error: error.message,
    });
  }
};

// PUT /api/offers/:offerId/approve (Admin Only)
export const approveOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const adminId = req.user?._id || null;

    const offer = await Offer.findById(offerId)
      .populate("creatorId", "fullName handle avatarUrl profilePicture")
      .populate("brandId", "fullName handle avatarUrl profilePicture");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found.",
      });
    }

    if (offer.status === "active") {
      return res.status(200).json({
        success: true,
        message: "Offer is already active.",
        data: offer,
      });
    }

    const now = Date.now();
    const expiresAt = new Date(now + offer.validityHours * 60 * 60 * 1000);

    offer.status = "active";
    if (adminId) {
      offer.approvedBy = adminId;
    }
    offer.approvedAt = new Date(now);
    offer.expiresAt = expiresAt;
    offer.rejectionReason = "";
    await offer.save();

    const isCreatorOffer = offer.creatorOrBrandType === "creator";
    const sender = isCreatorOffer ? offer.creatorId : offer.brandId;
    const senderName = sender?.fullName || sender?.handle || (isCreatorOffer ? "A creator" : "A brand");
    const rawSenderId = sender?._id || adminId;

    // Determine target audience for push + in-app
    const targetRole = isCreatorOffer ? "brand" : "creator";
    const targetUrl = isCreatorOffer ? "/dashboard/customer" : "/dashboard/influencer";

    // Notify owner
    if (sender?._id && (adminId || sender._id)) {
      Notification.create({
        recipientId: sender._id,
        senderId: adminId || sender._id,
        type: "admin_message",
        text: `Your offer "${offer.offerTitle}" has been approved by admin and is now live!`,
        targetUrl,
        createdAt: now,
      }).catch((err) => console.error("Owner notification error:", err.message));

      sendPushToUser(sender._id, {
        title: "Offer Approved & Live! 🎉",
        body: `Your offer "${offer.offerTitle}" is now visible to all ${targetRole}s.`,
        url: targetUrl,
      }).catch((err) => console.error("Owner push error:", err.message));
    }

    // Broadcast to target audience
    const audienceProfiles = await Profile.find({ role: targetRole, isDeleted: { $ne: true } })
      .select("_id")
      .lean();

    if (audienceProfiles && audienceProfiles.length > 0 && rawSenderId) {
      const recipientIds = audienceProfiles.map((p) => p._id);
      const pushTitle = isCreatorOffer
        ? `New Creator Deal! 🔥 ${offer.discountPercent ? offer.discountPercent + "% off" : offer.offerTitle}`
        : `New Brand Opportunity! 💼 ${offer.offerTitle}`;

      const notifText = `${senderName} launched an exclusive offer: ${offer.offerTitle} — "${offer.conditionText}"`;

      // Bulk in-app notifications
      const inAppNotifs = recipientIds.map((rId) => ({
        recipientId: rId,
        senderId: rawSenderId,
        type: "new_offer",
        text: notifText,
        targetUrl,
        createdAt: now,
      }));

      Notification.insertMany(inAppNotifs, { ordered: false }).catch((err) =>
        console.error("Audience in-app notification error:", err.message)
      );

      // Web Push
      sendPushToUsers(recipientIds, {
        title: pushTitle,
        body: `${senderName}: ${offer.conditionText}`,
        url: targetUrl,
      }).catch((err) => console.error("Audience push error:", err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Offer approved and broadcasted to ${audienceProfiles?.length || 0} ${targetRole}s.`,
      data: offer,
    });
  } catch (error) {
    console.error("approveOffer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve offer.",
      error: error.message,
    });
  }
};

// PUT /api/offers/:offerId/reject (Admin Only)
export const rejectOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { reason = "Does not meet guidelines." } = req.body;
    const adminId = req.user?._id || null;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found.",
      });
    }

    offer.status = "rejected";
    offer.rejectionReason = reason;
    await offer.save();

    const rawOwner = offer.creatorId || offer.brandId;
    const ownerId = rawOwner?._id || rawOwner;
    if (ownerId && (adminId || ownerId)) {
      const targetUrl = offer.creatorOrBrandType === "creator" ? "/dashboard/influencer" : "/dashboard/customer";
      Notification.create({
        recipientId: ownerId,
        senderId: adminId || ownerId,
        type: "admin_message",
        text: `Your offer "${offer.offerTitle}" was rejected by admin. Reason: ${reason}`,
        targetUrl,
        createdAt: Date.now(),
      }).catch((err) => console.error("Reject notification error:", err.message));
    }

    return res.status(200).json({
      success: true,
      message: "Offer rejected successfully.",
      data: offer,
    });
  } catch (error) {
    console.error("rejectOffer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject offer.",
      error: error.message,
    });
  }
};

// GET /api/offers/active
export const getActiveOffers = async (req, res) => {
  try {
    const { audience } = req.query; // optional "creator" (offers for creators) or "brand" (offers for brands)

    let query = {
      status: "active",
      expiresAt: { $gt: new Date() },
    };

    if (audience === "brand") {
      // Offers created by creators for brands
      query.creatorOrBrandType = "creator";
    } else if (audience === "creator") {
      // Offers created by brands for creators
      query.creatorOrBrandType = "brand";
    }

    const offers = await Offer.find(query)
      .populate("creatorId", "fullName avatarUrl handle category profilePicture")
      .populate("brandId", "fullName avatarUrl handle category profilePicture companyName")
      .sort({ approvedAt: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: offers || [],
    });
  } catch (error) {
    console.error("getActiveOffers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active offers.",
      error: error.message,
    });
  }
};

// GET /api/offers/mine/:profileId
export const getMyOffers = async (req, res) => {
  try {
    const profileId = req.params.profileId || req.user?._id;
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required.",
      });
    }

    const offers = await Offer.find({
      $or: [{ creatorId: profileId }, { brandId: profileId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: offers || [],
    });
  } catch (error) {
    console.error("getMyOffers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch offers.",
      error: error.message,
    });
  }
};

// GET /api/offers/admin/all (Admin Only)
export const getAllOffersAdmin = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("creatorId", "fullName avatarUrl handle email role")
      .populate("brandId", "fullName avatarUrl handle email role")
      .populate("approvedBy", "fullName email")
      .populate("deletedBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: offers || [],
    });
  } catch (error) {
    console.error("getAllOffersAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all offers.",
      error: error.message,
    });
  }
};

// DELETE /api/offers/:offerId (Admin Only)
export const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const adminId = req.user?._id || null;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found.",
      });
    }

    if (offer.status === "deleted") {
      return res.status(200).json({
        success: true,
        message: "Offer is already deleted.",
        data: offer,
      });
    }

    offer.status = "deleted";
    if (adminId) {
      offer.deletedBy = adminId;
    }
    offer.deletedAt = new Date();
    await offer.save();

    const rawOwner = offer.creatorId || offer.brandId;
    const ownerId = rawOwner?._id || rawOwner;
    if (ownerId && (adminId || ownerId)) {
      try {
        await Notification.create({
          recipientId: ownerId,
          senderId: adminId || ownerId,
          type: "admin_message",
          text: `Your offer "${offer.offerTitle}" was removed by admin.`,
          targetUrl: offer.creatorOrBrandType === "creator" ? "/dashboard/influencer" : "/dashboard/customer",
          createdAt: Date.now(),
        });
      } catch (notifErr) {
        console.error("Failed to send offer deletion notification:", notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully.",
      data: offer,
    });
  } catch (error) {
    console.error("deleteOffer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete offer.",
      error: error.message,
    });
  }
};
