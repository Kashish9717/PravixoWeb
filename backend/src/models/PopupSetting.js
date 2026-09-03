import mongoose from "mongoose";

const popupSettingSchema = new mongoose.Schema(
  {
    showPopup: {
      type: Boolean,
      required: true,
    },

    popupFrequency: {
      type: String,
      enum: [
        "every_login",
        "first_login",
        "every_7_days",
        "only_once",
      ],
      required: true,
    },

    targetUsers: {
      type: String,
      enum: ["brands", "creators", "both"],
      required: true,
    },

    popupExpiry: {
      type: Number,
      required: true,
    },

    activeOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionOffer",
    },
  },
  {
    timestamps: true,
  }
);

const PopupSetting = mongoose.model(
  "PopupSetting",
  popupSettingSchema
);

export default PopupSetting;