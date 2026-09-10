import webpush from "web-push";
import Subscription from "../models/Subscription.js";

let isVapidConfigured = false;

function ensureVapidDetails() {
  if (isVapidConfigured) return true;

  const email = process.env.VAPID_EMAIL || "mailto:admin@example.com";
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn("⚠️ VAPID keys not configured in environment variables.");
    return false;
  }

  const subject = email.startsWith("mailto:") || email.startsWith("http")
    ? email
    : `mailto:${email}`;

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    isVapidConfigured = true;
    return true;
  } catch (err) {
    console.error("Failed to initialize VAPID details:", err.message);
    return false;
  }
}

export const sendPushToUser = async (userId, payload) => {
  if (!ensureVapidDetails()) {
    return [];
  }

  const subs = await Subscription.find({ userId });

  return Promise.allSettled(
    subs.map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        )
        .catch((err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            return Subscription.deleteOne({ _id: sub._id });
          }
          console.error("Push error:", err.message);
        })
    )
  );
};

export const sendPushToUsers = async (userIds, payload) => {
  return Promise.allSettled(userIds.map((id) => sendPushToUser(id, payload)));
};