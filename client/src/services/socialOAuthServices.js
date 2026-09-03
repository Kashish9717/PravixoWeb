// backend/services/socialOAuthService.js

// It will handle:

// AES-256-GCM encryption
// Google/YouTube OAuth
// Twitter/X OAuth 2 + PKCE
// LinkedIn OAuth
// Meta OAuth for Facebook/Instagram
// Returning a consistent object to your existing exchangeOAuthCode()
// import crypto from "crypto";

// =====================================================
// ENCRYPTION
// =====================================================

const getEncryptionKey = () => {
  const key =
    process.env.ENCRYPTION_KEY ||
    "default_lumen_system_secret_encryption_key_32_bytes";

  return crypto.createHash("sha256").update(key).digest();
};

export const encrypt = (text) => {
  if (!text) return undefined;

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");

  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted,
  ].join(":");
};

// =====================================================
// HELPER
// =====================================================

const parseJsonResponse = async (response) => {
  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `OAuth provider returned invalid JSON: ${text}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error_description ||
        data?.error?.message ||
        data?.error ||
        `OAuth request failed with status ${response.status}`
    );
  }

  return data;
};

// =====================================================
// GOOGLE / YOUTUBE
// =====================================================

export const exchangeGoogleCode = async ({
  code,
  redirectUri,
}) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth credentials are not configured."
    );
  }

  const tokenResponse = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    }
  );

  const tokenData =
    await parseJsonResponse(tokenResponse);

  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token;

  if (!accessToken) {
    throw new Error(
      "Google did not return an access token."
    );
  }

  // Get YouTube channel information
  const channelResponse = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const channelData =
    await parseJsonResponse(channelResponse);

  const channel =
    channelData.items?.[0];

  if (!channel) {
    throw new Error(
      "No YouTube channel was found for this Google account."
    );
  }

  const statistics =
    channel.statistics || {};

  const followers = Number(
    statistics.subscriberCount || 0
  );

  const views = Number(
    statistics.viewCount || 0
  );

  const engagementRate =
    followers > 0
      ? Math.round(
          ((views / followers) * 0.04) * 100
        ) / 100
      : 0;

  const expiresAt = tokenData.expires_in
    ? Date.now() +
      Number(tokenData.expires_in) * 1000
    : undefined;

  return {
    accountId: channel.id,

    handle:
      channel.snippet?.customUrl ||
      channel.snippet?.title ||
      channel.id,

    accessToken: encrypt(accessToken),

    refreshToken: encrypt(refreshToken),

    expiresAt,

    followers,

    subscribers: followers,

    views,

    engagementRate,
  };
};

// =====================================================
// TWITTER / X
// OAuth 2 + PKCE
// =====================================================

export const exchangeTwitterCode = async ({
  code,
  redirectUri,
  codeVerifier,
}) => {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret =
    process.env.TWITTER_CLIENT_SECRET;

  if (!clientId) {
    throw new Error(
      "Twitter client ID is not configured."
    );
  }

  if (!codeVerifier) {
    throw new Error(
      "Twitter PKCE code verifier is missing."
    );
  }

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const headers = {
    "Content-Type":
      "application/x-www-form-urlencoded",
  };

  /*
   * Twitter confidential clients may require
   * client authentication.
   */
  if (clientSecret) {
    const basicAuth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    headers.Authorization = `Basic ${basicAuth}`;
  }

  const tokenResponse = await fetch(
    "https://api.twitter.com/2/oauth2/token",
    {
      method: "POST",
      headers,
      body,
    }
  );

  const tokenData =
    await parseJsonResponse(tokenResponse);

  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token;

  if (!accessToken) {
    throw new Error(
      "Twitter did not return an access token."
    );
  }

  // Get authenticated user
  const userResponse = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=public_metrics,username,name",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const userData =
    await parseJsonResponse(userResponse);

  const user = userData.data;

  if (!user) {
    throw new Error(
      "Twitter did not return authenticated user information."
    );
  }

  const metrics =
    user.public_metrics || {};

  const followers = Number(
    metrics.followers_count || 0
  );

  const expiresAt = tokenData.expires_in
    ? Date.now() +
      Number(tokenData.expires_in) * 1000
    : undefined;

  return {
    accountId: user.id,

    handle:
      user.username ||
      user.name ||
      user.id,

    accessToken: encrypt(accessToken),

    refreshToken: encrypt(refreshToken),

    expiresAt,

    followers,

    views: 0,

    engagementRate: 1.8,
  };
};

// =====================================================
// LINKEDIN
// =====================================================

export const exchangeLinkedInCode = async ({
  code,
  redirectUri,
}) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret =
    process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "LinkedIn OAuth credentials are not configured."
    );
  }

  const tokenResponse = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    }
  );

  const tokenData =
    await parseJsonResponse(tokenResponse);

  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error(
      "LinkedIn did not return an access token."
    );
  }

  // Get LinkedIn profile
  const profileResponse = await fetch(
    "https://api.linkedin.com/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const profileData =
    await parseJsonResponse(profileResponse);

  const accountId =
    profileData.sub;

  const handle =
    profileData.name ||
    profileData.given_name ||
    accountId;

  const expiresAt = tokenData.expires_in
    ? Date.now() +
      Number(tokenData.expires_in) * 1000
    : undefined;

  return {
    accountId,

    handle,

    accessToken: encrypt(accessToken),

    refreshToken: encrypt(
      tokenData.refresh_token
    ),

    expiresAt,

    // LinkedIn API availability depends on
    // the permissions/products enabled.
    followers: 0,

    views: 0,

    engagementRate: 2.4,
  };
};

// =====================================================
// META
// Facebook + Instagram
// =====================================================

const exchangeMetaCode = async ({
  code,
  redirectUri,
}) => {
  const clientId = process.env.META_CLIENT_ID;
  const clientSecret =
    process.env.META_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Meta OAuth credentials are not configured."
    );
  }

  const tokenUrl =
    "https://graph.facebook.com/v19.0/oauth/access_token";

  const tokenResponse = await fetch(
    `${tokenUrl}?${new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    })}`
  );

  const tokenData =
    await parseJsonResponse(tokenResponse);

  let accessToken =
    tokenData.access_token;

  if (!accessToken) {
    throw new Error(
      "Meta did not return an access token."
    );
  }

  /*
   * Exchange short-lived token for
   * long-lived token.
   */
  const longLivedResponse = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams(
      {
        grant_type:
          "fb_exchange_token",
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: accessToken,
      }
    )}`
  );

  if (longLivedResponse.ok) {
    const longLivedData =
      await longLivedResponse.json();

    if (longLivedData.access_token) {
      accessToken =
        longLivedData.access_token;

      tokenData.expires_in =
        longLivedData.expires_in;
    }
  }

  return {
    accessToken,

    expiresAt: tokenData.expires_in
      ? Date.now() +
        Number(tokenData.expires_in) *
          1000
      : undefined,
  };
};

// =====================================================
// FACEBOOK
// =====================================================

export const exchangeFacebookCode = async ({
  code,
  redirectUri,
}) => {
  const metaToken =
    await exchangeMetaCode({
      code,
      redirectUri,
    });

  const accessToken =
    metaToken.accessToken;

  /*
   * Get Facebook Pages managed by user.
   */
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?${new URLSearchParams(
      {
        fields:
          "id,name,username,fan_count,access_token",
        access_token: accessToken,
      }
    )}`
  );

  const pagesData =
    await parseJsonResponse(
      pagesResponse
    );

  const page =
    pagesData.data?.[0];

  if (!page) {
    throw new Error(
      "No Facebook Page was found for this account."
    );
  }

  /*
   * Page access token is the token that should
   * normally be used for Page API requests.
   */
  const pageAccessToken =
    page.access_token ||
    accessToken;

  const followers = Number(
    page.fan_count || 0
  );

  return {
    accountId: page.id,

    handle:
      page.username ||
      page.name ||
      page.id,

    accessToken:
      encrypt(pageAccessToken),

    refreshToken:
      undefined,

    expiresAt:
      metaToken.expiresAt,

    followers,

    views: 0,

    engagementRate: 1.12,
  };
};

// =====================================================
// INSTAGRAM
// =====================================================

export const exchangeInstagramCode = async ({
  code,
  redirectUri,
}) => {
  const metaToken =
    await exchangeMetaCode({
      code,
      redirectUri,
    });

  const accessToken =
    metaToken.accessToken;

  /*
   * Get Facebook Pages and their
   * connected Instagram Business accounts.
   */
  const accountsResponse = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?${new URLSearchParams(
      {
        fields:
          "id,name,access_token,instagram_business_account",
        access_token: accessToken,
      }
    )}`
  );

  const accountsData =
    await parseJsonResponse(
      accountsResponse
    );

  const pageWithInstagram =
    accountsData.data?.find(
      (page) =>
        page.instagram_business_account
    );

  if (!pageWithInstagram) {
    throw new Error(
      "No Instagram Business account connected to a Facebook Page was found."
    );
  }

  const instagramAccountId =
    pageWithInstagram
      .instagram_business_account
      .id;

  const instagramResponse =
    await fetch(
      `https://graph.facebook.com/v19.0/${instagramAccountId}?${new URLSearchParams(
        {
          fields:
            "id,username,name,followers_count,media_count",
          access_token:
            pageWithInstagram.access_token ||
            accessToken,
        }
      )}`
    );

  const instagramData =
    await parseJsonResponse(
      instagramResponse
    );

  const followers = Number(
    instagramData.followers_count || 0
  );

  return {
    accountId:
      instagramData.id ||
      instagramAccountId,

    handle:
      instagramData.username ||
      instagramData.name ||
      instagramAccountId,

    accessToken: encrypt(
      pageWithInstagram.access_token ||
        accessToken
    ),

    refreshToken: undefined,

    expiresAt:
      metaToken.expiresAt,

    followers,

    views: 0,

    engagementRate: 3.25,
  };
};