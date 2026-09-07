import Profile from "../models/Profile.js";

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

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Submit verification error:", error);

    res.status(500).json({
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
        gstCertificateUrl: req.body.gstCertificateUrl,
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

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Brand verification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit brand verification.",
    });
  }
};
