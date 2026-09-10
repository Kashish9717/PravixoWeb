import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;