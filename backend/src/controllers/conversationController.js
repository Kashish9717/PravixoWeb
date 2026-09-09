import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Profile from "../models/Profile.js";
import Campaign from "../models/Campaign.js";
import Connection from "../models/Connection.js";

// Start conversation
export const startConversation = async (req, res) => {
  try {
    const { creatorId, brandId, adminId, targetUserId, initialMessage, campaignId } = req.body;

    // Support both direct targetUserId and traditional creatorId/brandId
    let creator = creatorId;
    let brand = brandId;
    let admin = adminId || (req.user?.role === "admin" ? req.user._id : null);
    let convType = "brand_creator";

    if (targetUserId) {
      const targetProfile = await Profile.findById(targetUserId);
      if (!targetProfile) {
        return res.status(404).json({
          success: false,
          message: "Target user not found.",
        });
      }

      if (admin || req.user?.role === "admin") {
        admin = admin || req.user?._id;
        if (targetProfile.role === "creator") {
          creator = targetProfile._id;
          convType = "admin_creator";
        } else {
          brand = targetProfile._id;
          convType = "admin_brand";
        }
      }
    } else if (admin && creator) {
      convType = "admin_creator";
    } else if (admin && brand) {
      convType = "admin_brand";
    }

    const senderId = req.user?._id || admin || brand || creator;

    if (!senderId || (!creator && !brand)) {
      return res.status(400).json({
        success: false,
        message: "Required participants are missing.",
      });
    }

    let query = {};
    if (convType === "admin_creator") {
      query = { adminId: admin, creatorId: creator, conversationType: "admin_creator" };
    } else if (convType === "admin_brand") {
      query = { adminId: admin, brandId: brand, conversationType: "admin_brand" };
    } else {
      query = { creatorId: creator, brandId: brand, conversationType: "brand_creator" };
      if (campaignId) query.campaignId = campaignId;
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      conversation = await Conversation.create({
        creatorId: creator || null,
        brandId: brand || null,
        adminId: admin || null,
        conversationType: convType,
        campaignId: campaignId || null,
        status: "pending",
      });
    }

    if (initialMessage && initialMessage.trim()) {
      await Message.create({
        conversationId: conversation._id,
        senderId,
        text: initialMessage.trim(),
        read: false,
      });
    }

    res.status(201).json({
      success: true,
      data: conversation._id,
      conversation,
    });
  } catch (error) {
    console.error("Start conversation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start conversation.",
    });
  }
};

// Get conversations
export const getConversations = async (req, res) => {
  try {
    const { profileId, role } = req.query;

    if (!profileId || !["creator", "brand", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "profileId and valid role are required.",
      });
    }

    let filter = {};
    if (role === "creator") {
      filter = { creatorId: profileId };
    } else if (role === "brand") {
      filter = { brandId: profileId };
    } else if (role === "admin") {
      filter = {
        $or: [
          { adminId: profileId },
          { conversationType: { $in: ["admin_creator", "admin_brand"] } },
        ],
      };
    }

    const conversations = await Conversation.find(filter).sort({
      createdAt: -1,
    });

    const results = await Promise.all(
      conversations.map(async (conversation) => {
        let otherId = null;

        if (role === "creator") {
          otherId = conversation.adminId || conversation.brandId;
        } else if (role === "brand") {
          otherId = conversation.adminId || conversation.creatorId;
        } else if (role === "admin") {
          otherId = conversation.creatorId || conversation.brandId;
        }

        let otherProfile = null;
        if (otherId) {
          otherProfile = await Profile.findById(otherId)
            .select("fullName email handle avatarUrl role")
            .lean();
        }

        // If other user is an admin or system admin representation
        if (!otherProfile && conversation.adminId && (role === "creator" || role === "brand")) {
          otherProfile = await Profile.findById(conversation.adminId)
            .select("fullName email handle avatarUrl role")
            .lean();
        }

        const campaign = conversation.campaignId
          ? await Campaign.findById(conversation.campaignId).lean()
          : null;

        let connection = null;
        if (conversation.creatorId && conversation.brandId) {
          const connFilter = {
            creatorId: conversation.creatorId,
            brandId: conversation.brandId,
          };
          if (conversation.campaignId) {
            connFilter.campaignId = conversation.campaignId;
          }
          connection = await Connection.findOne(connFilter).lean();
        }

        const messages = await Message.find({
          conversationId: conversation._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        const lastMessage = messages[0];

        const unreadCount = messages.filter(
          (message) =>
            message.senderId.toString() !== profileId &&
            !message.read
        ).length;

        return {
          ...conversation.toObject(),
          otherProfile: otherProfile || {
            fullName: "Pravixo Admin",
            role: "admin",
            avatarUrl: "",
          },
          lastMessage,
          unreadCount,
          campaign,
          connection,
          isNew:
            conversation.status === "pending" &&
            lastMessage?.senderId?.toString() !== profileId,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: results.filter((item) => item.lastMessage || item.conversationType?.startsWith("admin_")),
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations.",
    });
  }
};

// Get conversation details
export const getConversationDetails = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { profileId } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(conversationId) ||
      !mongoose.Types.ObjectId.isValid(profileId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID.",
      });
    }

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    let otherId = null;
    const myIdStr = profileId.toString();

    if (conversation.creatorId && conversation.creatorId.toString() === myIdStr) {
      otherId = conversation.adminId || conversation.brandId;
    } else if (conversation.brandId && conversation.brandId.toString() === myIdStr) {
      otherId = conversation.adminId || conversation.creatorId;
    } else if (conversation.adminId && conversation.adminId.toString() === myIdStr) {
      otherId = conversation.creatorId || conversation.brandId;
    } else {
      // Fallback for admin user looking at any conversation
      otherId = conversation.creatorId || conversation.brandId || conversation.adminId;
    }

    let otherProfile = null;
    if (otherId) {
      otherProfile = await Profile.findById(otherId)
        .select("fullName email handle avatarUrl role")
        .lean();
    }

    const campaign = conversation.campaignId
      ? await Campaign.findById(conversation.campaignId).lean()
      : null;

    let connection = null;
    if (conversation.creatorId && conversation.brandId) {
      const connFilter = {
        creatorId: conversation.creatorId,
        brandId: conversation.brandId,
      };
      if (conversation.campaignId) {
        connFilter.campaignId = conversation.campaignId;
      }
      connection = await Connection.findOne(connFilter).lean();
    }

    res.status(200).json({
      success: true,
      data: {
        ...conversation,
        otherProfile: otherProfile || {
          fullName: "Pravixo Admin",
          role: "admin",
          avatarUrl: "",
        },
        campaign,
        connection,
      },
    });
  } catch (error) {
    console.error("Conversation details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation details.",
    });
  }
};

// Mark conversation as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { profileId } = req.body;

    const myId = profileId ? (mongoose.Types.ObjectId.isValid(profileId) ? new mongoose.Types.ObjectId(profileId) : profileId) : null;

    if (myId) {
      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: myId },
          read: false,
        },
        {
          $set: { read: true },
        }
      );
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Mark as read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read.",
    });
  }
};

// Archive / unarchive conversation
export const toggleArchive = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    conversation.archived = !conversation.archived;

    await conversation.save();

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Toggle archive error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update archive status.",
    });
  }
};