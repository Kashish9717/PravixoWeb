import SocialConnection from "../models/SocialConnection.js";
import SocialAnalytics from "../models/SocialAnalyticsHistory.js";
import Profile from "../models/Profile.js";
import crypto from "crypto";

/* =====================================================
   ENCRYPTION / DECRYPTION
===================================================== */

const getEncryptionKey = () => {
  const key =
    process.env.ENCRYPTION_KEY ||
    "default_lumen_system_secret_encryption_key_32_bytes";

  return crypto.createHash("sha256").update(key).digest();
};

const decrypt = (ciphertext) => {
  if (!ciphertext) return "";

  const parts = ciphertext.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format.");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encryptedText = parts[2];

  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(
    encryptedText,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
};

/* =====================================================
   UPDATE PROFILE SOCIAL STATS
===================================================== */

const updateProfilePlatformStats = async (
  profileId,
  platform,
  handle,
  followers
) => {
  const updates = {};

  switch (platform) {
    case "instagram":
      updates.instagramHandle = handle;

      if (followers !== undefined) {
        updates.instagramFollowers = followers;
      }
      break;

    case "facebook":
      updates.facebookHandle = handle;

      if (followers !== undefined) {
        updates.facebookFollowers = followers;
      }
      break;

    case "linkedin":
      updates.linkedinHandle = handle;

      if (followers !== undefined) {
        updates.linkedinFollowers = followers;
      }
      break;

    case "youtube":
      updates.youtubeHandle = handle;

      if (followers !== undefined) {
        updates.youtubeFollowers = followers;
      }
      break;

    case "quora":
      updates.quoraHandle = handle;

      if (followers !== undefined) {
        updates.quoraFollowers = followers;
      }
      break;

    case "twitter":
      updates.twitterHandle = handle;

      if (followers !== undefined) {
        updates.twitterFollowers = followers;
      }
      break;

    default:
      return;
  }

  await Profile.findByIdAndUpdate(
    profileId,
    updates
  );
};

/* =====================================================
   SYNC YOUTUBE
===================================================== */

const syncYouTube = async (
  accessToken,
  connection
) => {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `YouTube API failed: ${errorText}`
    );
  }

  const data = await response.json();

  const channel = data.items?.[0];

  if (!channel) {
    throw new Error(
      "YouTube channel not found."
    );
  }

  const statistics = channel.statistics || {};
  const snippet = channel.snippet || {};

  const followers = Number(
    statistics.subscriberCount || 0
  );

  const views = Number(
    statistics.viewCount || 0
  );

  const engagementRate =
    followers > 0
      ? Math.round(
          (views / followers) * 0.04 * 100
        ) / 100
      : 0;

  return {
    followers,
    views,
    engagementRate,
    handle:
      snippet.customUrl ||
      `@${(snippet.title || "")
        .replace(/\s+/g, "")}`,
  };
};

/* =====================================================
   SYNC INSTAGRAM
===================================================== */

const syncInstagram = async (
  accessToken,
  connection
) => {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,followers_count},fan_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Instagram API failed: ${errorText}`
    );
  }

  const data = await response.json();

  const page = data.data?.[0];

  if (!page) {
    throw new Error(
      "No Facebook Page connected."
    );
  }

  const instagram =
    page.instagram_business_account;

  if (!instagram) {
    throw new Error(
      "No Instagram Professional/Creator account connected."
    );
  }

  return {
    followers:
      Number(instagram.followers_count) || 0,

    views: connection.views || 0,

    engagementRate:
      connection.engagementRate || 3.25,

    handle:
      instagram.username
        ? `@${instagram.username}`
        : connection.handle,
  };
};

/* =====================================================
   SYNC FACEBOOK
===================================================== */

const syncFacebook = async (
  accessToken,
  connection
) => {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,username,fan_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Facebook API failed: ${errorText}`
    );
  }

  const data = await response.json();

  const page = data.data?.[0];

  if (!page) {
    throw new Error(
      "Facebook Page not found."
    );
  }

  return {
    followers:
      Number(page.fan_count) || 0,

    views: connection.views || 0,

    engagementRate:
      connection.engagementRate || 1.12,

    handle:
      page.username ||
      page.name ||
      connection.handle,
  };
};

/* =====================================================
   SYNC LINKEDIN
===================================================== */

const syncLinkedIn = async (
  accessToken,
  connection
) => {
  const response = await fetch(
    "https://api.linkedin.com/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `LinkedIn API failed: ${errorText}`
    );
  }

  const data = await response.json();

  return {
    // LinkedIn API may not expose follower count
    // with basic permissions.
    followers:
      connection.followers || 0,

    views: connection.views || 0,

    engagementRate:
      connection.engagementRate || 2.4,

    handle:
      data.preferred_username ||
      data.preferredUsername ||
      data.name ||
      connection.handle,
  };
};

/* =====================================================
   SYNC TWITTER / X
===================================================== */

const syncTwitter = async (
  accessToken,
  connection
) => {
  const response = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=public_metrics",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Twitter API failed: ${errorText}`
    );
  }

  const data = await response.json();

  const user = data.data;

  if (!user) {
    throw new Error(
      "Twitter user data not found."
    );
  }

  const metrics =
    user.public_metrics || {};

  return {
    followers:
      Number(metrics.followers_count) || 0,

    views: connection.views || 0,

    engagementRate:
      connection.engagementRate || 1.8,

    handle:
      user.username
        ? `@${user.username}`
        : connection.handle,
  };
};

/* =====================================================
   SYNC ONE CONNECTION
===================================================== */

export const syncSingleConnection =
  async (connection) => {
    try {
      await SocialConnection.findByIdAndUpdate(
        connection._id,
        {
          syncStatus: "syncing",
        }
      );

      const accessToken =
        connection.encryptedAccessToken
          ? decrypt(
              connection.encryptedAccessToken
            )
          : "";

      if (!accessToken) {
        throw new Error(
          "Access token is missing."
        );
      }

      let stats;

      switch (connection.platform) {
        case "youtube":
          stats = await syncYouTube(
            accessToken,
            connection
          );
          break;

        case "instagram":
          stats = await syncInstagram(
            accessToken,
            connection
          );
          break;

        case "facebook":
          stats = await syncFacebook(
            accessToken,
            connection
          );
          break;

        case "linkedin":
          stats = await syncLinkedIn(
            accessToken,
            connection
          );
          break;

        case "twitter":
          stats = await syncTwitter(
            accessToken,
            connection
          );
          break;

        case "quora":
          // No OAuth sync implementation yet.
          stats = {
            followers:
              connection.followers || 0,

            views:
              connection.views || 0,

            engagementRate:
              connection.engagementRate || 0,

            handle:
              connection.handle,
          };
          break;

        default:
          throw new Error(
            `Unsupported platform: ${connection.platform}`
          );
      }

      /* ===============================================
         UPDATE CONNECTION
      =============================================== */

      await SocialConnection.findByIdAndUpdate(
        connection._id,
        {
          handle:
            stats.handle ||
            connection.handle,

          followers:
            stats.followers ??
            connection.followers,

          views:
            stats.views ??
            connection.views,

          engagementRate:
            stats.engagementRate ??
            connection.engagementRate,

          syncStatus: "success",

          lastSyncedAt: Date.now(),

          failureCount: 0,

          accountHealth: "healthy",

          lastError: null,
        }
      );

      /* ===============================================
         SAVE ANALYTICS HISTORY
      =============================================== */

      if (
        stats.followers !== undefined
      ) {
        await SocialAnalytics.create({
          connectionId:
            connection._id,

          timestamp: Date.now(),

          followers:
            stats.followers,

          views:
            stats.views,

          engagementRate:
            stats.engagementRate,
        });
      }

      /* ===============================================
         KEEP ONLY LAST 30 RECORDS
      =============================================== */

      const history =
        await SocialAnalytics.find({
          connectionId:
            connection._id,
        })
          .sort({ timestamp: -1 })
          .lean();

      if (history.length > 30) {
        const oldRecords =
          history.slice(30);

        const ids =
          oldRecords.map(
            (item) => item._id
          );

        await SocialAnalytics.deleteMany({
          _id: {
            $in: ids,
          },
        });
      }

      /* ===============================================
         UPDATE PROFILE
      =============================================== */

      await updateProfilePlatformStats(
        connection.profileId,
        connection.platform,
        stats.handle ||
          connection.handle,
        stats.followers
      );

      return {
        id: connection._id,
        platform:
          connection.platform,
        success: true,
      };
    } catch (error) {
      console.error(
        `[SOCIAL SYNC] ${connection.platform} failed:`,
        error
      );

      const failureCount =
        (connection.failureCount || 0) + 1;

      const accountHealth =
        failureCount >= 5
          ? "error"
          : failureCount >= 2
          ? "warning"
          : "healthy";

      await SocialConnection.findByIdAndUpdate(
        connection._id,
        {
          syncStatus: "failed",

          lastError:
            error.message ||
            "Social sync failed.",

          failureCount,

          accountHealth,
        }
      );

      return {
        id: connection._id,
        platform:
          connection.platform,
        success: false,
        error:
          error.message ||
          "Social sync failed.",
      };
    }
  };

/* =====================================================
   SYNC ALL VERIFIED CONNECTIONS
===================================================== */

export const syncAllConnections =
  async () => {
    const connections =
      await SocialConnection.find({
        verified: true,
      });

    console.log(
      `[SOCIAL SYNC] Found ${connections.length} verified connections.`
    );

    const results = [];

    for (const connection of connections) {
      const result =
        await syncSingleConnection(
          connection
        );

      results.push(result);
    }

    return results;
  };