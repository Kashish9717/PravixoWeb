import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Profile from "../models/Profile.js";
import Campaign from "../models/Campaign.js";

// Start conversation
export const startConversation = async (req, res) => {
  try {
    const { creatorId, brandId, initialMessage } = req.body;

    if (!creatorId || !brandId || !initialMessage) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    let conversation = await Conversation.findOne({
      creatorId,
      brandId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        creatorId,
        brandId,
        status: "pending",
      });
    }

    await Message.create({
      conversationId: conversation._id,
      senderId: brandId,
      text: initialMessage,
      read: false,
    });

    res.status(201).json({
      success: true,
      data: conversation._id,
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

    if (!profileId || !["creator", "brand"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "profileId and valid role are required.",
      });
    }

    const filter =
      role === "creator"
        ? { creatorId: profileId }
        : { brandId: profileId };

    const conversations = await Conversation.find(filter).sort({
      createdAt: -1,
    });

    const results = await Promise.all(
      conversations.map(async (conversation) => {
        const otherId =
          role === "creator"
            ? conversation.brandId
            : conversation.creatorId;

        const otherProfile = await Profile.findById(otherId).lean();

        const campaign = conversation.campaignId
          ? await Campaign.findById(conversation.campaignId).lean()
          : null;

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
          otherProfile,
          lastMessage,
          unreadCount,
          campaign,
          isNew:
            conversation.status === "pending" &&
            lastMessage?.senderId?.toString() !== profileId,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: results.filter((item) => item.lastMessage),
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

    const otherId =
      conversation.creatorId.toString() === profileId
        ? conversation.brandId
        : conversation.creatorId;

    const otherProfile = await Profile.findById(otherId).lean();

    const campaign = conversation.campaignId
      ? await Campaign.findById(conversation.campaignId).lean()
      : null;

    res.status(200).json({
      success: true,
      data: {
        ...conversation,
        otherProfile,
        campaign,
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

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: profileId },
        read: false,
      },
      {
        $set: { read: true },
      }
    );

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