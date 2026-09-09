import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    connectionId: {
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

    deliverableId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    deliverableType: {
      type: String,
      enum: ["REEL", "POST", "STORY", "VIDEO"],
      required: true,
    },

    contentUrl: {
      type: String,
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
      default: null,
    },

    caption: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "APPROVED", "REJECTED", "RESUBMITTED"],
      default: "SUBMITTED",
      index: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    parentSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
      index: true,
    },

    reworkCount: {
      type: Number,
      default: 0,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    approvedAt: {
      type: Number,
      default: null,
    },

    rejectedAt: {
      type: Number,
      default: null,
    },

    resubmittedAt: {
      type: Number,
      default: null,
    },

    submittedAt: {
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

submissionSchema.index({ connectionId: 1, deliverableType: 1 });
submissionSchema.index({ brandId: 1, status: 1 });
submissionSchema.index({ creatorId: 1, status: 1 });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
