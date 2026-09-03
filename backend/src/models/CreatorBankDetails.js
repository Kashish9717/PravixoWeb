import mongoose from "mongoose";

const creatorBankDetailsSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifsc: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    upiId: {
      type: String,
      trim: true,
    },

    panNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const CreatorBankDetails = mongoose.model(
  "CreatorBankDetails",
  creatorBankDetailsSchema
);

export default CreatorBankDetails;