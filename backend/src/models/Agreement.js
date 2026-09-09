import mongoose from "mongoose";

const agreementSchema = new mongoose.Schema(
  {
    agreementId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
      index: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    version: {
      type: Number,
      default: 1,
      required: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "GENERATED"],
      default: "GENERATED",
    },

    // Immutable Brand Snapshot
    brandSnapshot: {
      brandId: { type: String },
      fullName: { type: String, required: true },
      handle: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      companySize: { type: String, default: "" },
      website: { type: String, default: "" },
      gstNumber: { type: String, default: "" },
      avatarUrl: { type: String, default: "" },
    },

    // Immutable Creator Snapshot
    creatorSnapshot: {
      creatorId: { type: String },
      fullName: { type: String, required: true },
      handle: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      category: { type: String, default: "" },
      instagramHandle: { type: String, default: "" },
      youtubeHandle: { type: String, default: "" },
      avatarUrl: { type: String, default: "" },
    },

    // Immutable Campaign Snapshot
    campaignSnapshot: {
      campaignId: { type: String },
      title: { type: String, required: true },
      description: { type: String, default: "" },
      category: { type: String, default: "" },
      location: { type: String, default: "Pan India" },
      startDate: { type: Number },
      endDate: { type: Number },
      totalBudget: { type: Number, default: 0 },
    },

    // Immutable Deliverables Snapshot
    deliverablesSnapshot: [
      {
        type: {
          type: String,
          enum: ["REEL", "POST", "STORY", "VIDEO"],
          required: true,
        },
        requiredQuantity: {
          type: Number,
          required: true,
          default: 1,
        },
        status: {
          type: String,
          default: "PENDING",
        },
        notes: {
          type: String,
          default: "",
        },
      },
    ],

    // Immutable Financials Breakdown
    financialsSnapshot: {
      creatorAmount: {
        type: Number,
        required: true,
      },
      pravixoFee: {
        type: Number,
        required: true,
      },
      brandTotal: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },

    // Standard Pravixo Agreement Terms
    terms: [
      {
        sectionNumber: { type: Number, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],

    // Task 16: Agreement Signatures / Acceptances
    signatureStatus: {
      type: String,
      enum: ["PENDING_SIGNATURES", "PARTIALLY_SIGNED", "FULLY_SIGNED"],
      default: "PENDING_SIGNATURES",
      index: true,
    },

    brandSignature: {
      signed: { type: Boolean, default: false },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
      name: { type: String, default: "" },
      signedAt: { type: Number, default: null },
      signatureMethod: { type: String, default: "DIGITAL_ACCEPTANCE" },
      ipAddress: { type: String, default: "" },
    },

    creatorSignature: {
      signed: { type: Boolean, default: false },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
      name: { type: String, default: "" },
      signedAt: { type: Number, default: null },
      signatureMethod: { type: String, default: "DIGITAL_ACCEPTANCE" },
      ipAddress: { type: String, default: "" },
    },

    adminSignature: {
      signed: { type: Boolean, default: false },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
      name: { type: String, default: "" },
      signedAt: { type: Number, default: null },
      signatureMethod: { type: String, default: "ADMIN_APPROVAL" },
      ipAddress: { type: String, default: "" },
    },

    fullySignedAt: {
      type: Number,
      default: null,
    },

    // Task 17: Final Signed Agreement PDF
    pdfUrl: {
      type: String,
      default: "",
    },

    pdfPublicId: {
      type: String,
      default: "",
    },

    pdfGeneratedAt: {
      type: Number,
      default: null,
    },

    pdfVersion: {
      type: Number,
      default: null,
    },

    generatedAt: {
      type: Number,
      default: Date.now,
    },

    createdAt: {
      type: Number,
      default: Date.now,
    },

    updatedAt: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

agreementSchema.index({ collaborationId: 1, version: -1 });
agreementSchema.index({ brandId: 1, createdAt: -1 });
agreementSchema.index({ creatorId: 1, createdAt: -1 });

const Agreement = mongoose.model("Agreement", agreementSchema);

export default Agreement;
