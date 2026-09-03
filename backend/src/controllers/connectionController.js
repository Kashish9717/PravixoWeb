import mongoose from "mongoose";
import Connection from "../models/Connection.js";
import Profile from "../models/Profile.js";
import Campaign from "../models/Campaign.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import SocialConnection from "../models/SocialConnection.js";

// 1. Send connection request
export const sendRequest = async (req, res) => {
  try {
    const { creatorId, brandId, campaignId, pitch, senderId } = req.body;

    if (!creatorId || !brandId || !pitch) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const filter = { creatorId, brandId };

    if (campaignId) {
      filter.campaignId = campaignId;
    } else {
      filter.campaignId = null;
    }

    const existing = await Connection.findOne(filter);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Connection request already exists.",
      });
    }

    const connection = await Connection.create({
      creatorId,
      brandId,
      campaignId,
      pitch,
      status: "pending",
      creatorNotificationSeen: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create a pending conversation immediately so it appears in Messages
    let conversation = await Conversation.findOne(filter);

    if (!conversation) {
      conversation = await Conversation.create({
        creatorId,
        brandId,
        campaignId,
        status: "pending",
      });
    }

    await Message.create({
      conversationId: conversation._id,
      senderId: senderId || brandId, // fallback to brandId if not provided
      text: pitch,
      read: false,
    });

    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send connection request.",
    });
  }
};

// 2. Accept request
export const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found.",
      });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Connection request is not pending.",
      });
    }

    connection.status = "accepted";
    connection.creatorNotificationSeen = false;
    connection.updatedAt = Date.now();
    await connection.save();

    let conversation;

    const conversationFilter = {
      creatorId: connection.creatorId,
      brandId: connection.brandId,
    };

    if (connection.campaignId) {
      conversationFilter.campaignId = connection.campaignId;
    } else {
      conversationFilter.campaignId = null;
    }

    conversation = await Conversation.findOne(conversationFilter);

    if (!conversation) {
      conversation = await Conversation.create({
        creatorId: connection.creatorId,
        brandId: connection.brandId,
        campaignId: connection.campaignId,
        status: "active",
      });
    } else {
      conversation.status = "active";
      await conversation.save();
    }

    const existingMsg = await Message.findOne({
      conversationId: conversation._id,
    });

    if (!existingMsg) {
      await Message.create({
        conversationId: conversation._id,
        senderId: connection.creatorId,
        text: connection.pitch,
        read: false,
      });
    }

    res.status(200).json({
      success: true,
      data: conversation._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to accept connection request.",
    });
  }
};

// 3. Reject request
export const rejectRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found.",
      });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Connection request is not pending.",
      });
    }

    connection.status = "rejected";
    connection.creatorNotificationSeen = false;
    connection.updatedAt = Date.now();

    await connection.save();

    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject connection request.",
    });
  }
};

// 4. Navbar notification count
export const getNavbarNotificationCount = async (req, res) => {
  try {
    const { profileId, role } = req.query;

    let count = 0;

    if (role === "brand") {
      count = await Connection.countDocuments({
        brandId: profileId,
        status: "pending",
      });
    } else if (role === "creator") {
      count = await Connection.countDocuments({
        creatorId: profileId,
        creatorNotificationSeen: false,
        status: { $in: ["accepted", "rejected"] },
      });
    }

    res.json({
      success: true,
      data: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get notification count.",
    });
  }
};

// 5. Requests for brand
export const getRequestsForBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    const requests = await Connection.find({
      brandId,
      status: "pending",
    }).lean();

    const data = await Promise.all(
      requests.map(async (request) => {
        const creatorProfile = await Profile.findById(
          request.creatorId
        ).lean();

        const campaign = request.campaignId
          ? await Campaign.findById(request.campaignId).lean()
          : null;

        const followersCount = creatorProfile
          ? (creatorProfile.instagramFollowers || 0) +
            (creatorProfile.facebookFollowers || 0) +
            (creatorProfile.linkedinFollowers || 0) +
            (creatorProfile.youtubeFollowers || 0) +
            (creatorProfile.quoraFollowers || 0) +
            (creatorProfile.twitterFollowers || 0)
          : 0;

        const socialConns = await SocialConnection.find({
          profileId: request.creatorId,
        }).lean();

        const platformStr =
          socialConns
            .map(
              (c) =>
                c.platform.charAt(0).toUpperCase() +
                c.platform.slice(1)
            )
            .join(", ") || "Instagram";

        return {
          ...request,
          creatorProfile: creatorProfile
            ? {
                ...creatorProfile,
                followersCount,
                platformStr,
              }
            : null,
          campaign,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand requests.",
    });
  }
};

// 6. Requests for creator
export const getRequestsForCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const requests = await Connection.find({ creatorId }).lean();

    const data = await Promise.all(
      requests.map(async (request) => ({
        ...request,
        brandProfile: await Profile.findById(request.brandId).lean(),
      }))
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch creator requests.",
    });
  }
};

// 7. Connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const { creatorId, brandId } = req.query;

    const connection = await Connection.findOne({
      creatorId,
      brandId,
    });

    res.json({
      success: true,
      data: connection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get connection status.",
    });
  }
};

// 8. Mark creator notifications seen
export const markCreatorNotificationsSeen = async (req, res) => {
  try {
    const { creatorId } = req.params;

    await Connection.updateMany(
      {
        creatorId,
        creatorNotificationSeen: false,
        status: { $in: ["accepted", "rejected"] },
      },
      {
        creatorNotificationSeen: true,
      }
    );

    res.json({
      success: true,
      message: "Notifications marked as seen.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

// 9. All connections
export const getAllConnections = async (req, res) => {
  try {
    const { profileId, role } = req.query;

    const filter =
      role === "brand"
        ? { brandId: profileId }
        : { creatorId: profileId };

    const list = await Connection.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const data = await Promise.all(
      list.map(async (connection) => {
        const otherProfile = await Profile.findById(
          role === "brand"
            ? connection.creatorId
            : connection.brandId
        ).lean();

        return {
          ...connection,
          otherProfile,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch connections.",
    });
  }
};

// 10. My requests for creator
export const getMyRequestsForCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const list = await Connection.find({ creatorId }).lean();

    const data = await Promise.all(
      list.map(async (connection) => {
        const brandProfile = await Profile.findById(
          connection.brandId
        ).lean();

        const campaign = connection.campaignId
          ? await Campaign.findById(connection.campaignId).lean()
          : null;

        let conversationId = null;

        if (connection.status === "accepted") {
          const filter = {
            creatorId: connection.creatorId,
            brandId: connection.brandId,
          };

          if (connection.campaignId) {
            filter.campaignId = connection.campaignId;
          } else {
            filter.campaignId = null;
          }

          const conversation = await Conversation.findOne(filter).lean();

          conversationId = conversation?._id || null;
        }

        return {
          ...connection,
          brandProfile,
          campaign,
          conversationId,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch creator requests.",
    });
  }
};

// 11. Approved collaborations for brand
export const getApprovedCollaborationsForBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    const list = await Connection.find({
      brandId,
      status: "accepted",
    }).lean();

    const data = await Promise.all(
      list.map(async (connection) => {
        const creatorProfile = await Profile.findById(
          connection.creatorId
        ).lean();

        const campaign = connection.campaignId
          ? await Campaign.findById(connection.campaignId).lean()
          : null;

        const filter = {
          creatorId: connection.creatorId,
          brandId: connection.brandId,
        };

        if (connection.campaignId) {
          filter.campaignId = connection.campaignId;
        } else {
          filter.campaignId = null;
        }

        const conversation = await Conversation.findOne(filter).lean();

        return {
          ...connection,
          creatorProfile,
          campaign,
          conversationId: conversation?._id || null,
          conversationStatus: conversation?.status || "inactive",
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved collaborations.",
    });
  }
};