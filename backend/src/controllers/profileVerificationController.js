import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";
import { sendPushToUsers } from "../utils/webPush.js";

export const submitVerification = async (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required.",
      });
    }

    const creatorProfile = await Profile.findById(profileId);
    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const hasVerificationDocument = Boolean(
      creatorProfile.aadharUrl ||
      creatorProfile.aadharStorageId ||
      creatorProfile.panUrl ||
      creatorProfile.panStorageId,
    );

    if (!hasVerificationDocument) {
      return res.status(400).json({
        success: false,
        message: "Save an Aadhaar or PAN document before requesting verification.",
      });
    }

    const missingFields = [];
    if (!creatorProfile.fullName) missingFields.push("Name");
    if (!creatorProfile.handle) missingFields.push("Handle / Username");
    if (!creatorProfile.phone) missingFields.push("Phone");
    if (!creatorProfile.bio) missingFields.push("Bio");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required information for verification: ${missingFields.join(", ")}`,
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      profileId,
      {
        verificationStatus: "pending",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const admins = await Profile.find({ role: "admin" });
    if (admins.length > 0) {
      const notifications = admins.map((admin) => ({
        recipientId: admin._id,
        senderId: profile._id,
        type: "verification_requested",
        text: `${profile.fullName} has submitted their profile for verification.`,
      }));
      await Notification.insertMany(notifications);

      const adminIds = admins.map((admin) => admin._id);
      sendPushToUsers(adminIds, {
        title: `New Verification Request 🪪`,
        body: `${profile.fullName} has submitted their profile for verification.`,
        url: `/admin/users`,
      }).catch((err) => console.error("Verification push error:", err.message));
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Submit verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit verification.",
    });
  }
};

export const submitBrandVerification = async (req, res) => {
  try {
    const {
      profileId,
      gstNumber,
      gstCertificateStorageId,
      gstCertificateUrl,
    } = req.body;

    if (!profileId || !gstNumber || !gstCertificateStorageId) {
      return res.status(400).json({
        success: false,
        message: "Required GST verification fields are missing.",
      });
    }

    const brandProfile = await Profile.findById(profileId);
    if (!brandProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const missingFields = [];
    if (!brandProfile.handle) missingFields.push("Handle / Username");
    if (!brandProfile.category) missingFields.push("Category");
    if (!brandProfile.website) missingFields.push("Website");
    if (!brandProfile.location) missingFields.push("Location");
    if (!brandProfile.companySize) missingFields.push("Company Size");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required information for verification: ${missingFields.join(", ")}`,
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      profileId,
      {
        verificationStatus: "pending",
        gstNumber,
        gstCertificateStorageId,
        gstCertificateUrl,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const admins = await Profile.find({ role: "admin" });
    if (admins.length > 0) {
      const notifications = admins.map((admin) => ({
        recipientId: admin._id,
        senderId: brandProfile._id,
        type: "verification_requested",
        text: `${brandProfile.fullName} has submitted their brand profile for verification.`,
      }));
      await Notification.insertMany(notifications);

      const adminIds = admins.map((admin) => admin._id);
      sendPushToUsers(adminIds, {
        title: `New Brand Verification Request 🏢`,
        body: `${brandProfile.fullName} has submitted their brand profile for verification.`,
        url: `/admin/users`,
      }).catch((err) => console.error("Verification push error:", err.message));
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Brand verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit brand verification.",
    });
  }
};
