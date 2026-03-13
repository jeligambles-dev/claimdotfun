import crypto from "crypto";

export function generateVerificationCode(): string {
  return `CLAIM_${crypto.randomBytes(6).toString("hex")}`;
}

interface VerificationResult {
  verified: boolean;
  error?: string;
}

/**
 * Extract the username from a social media post URL.
 */
function extractUsernameFromUrl(platform: string, url: string): string | null {
  try {
    const parsed = new URL(url);

    if (platform === "TWITTER") {
      if (!parsed.hostname.match(/^(x\.com|twitter\.com|www\.x\.com|www\.twitter\.com)$/)) return null;
      const match = parsed.pathname.match(/^\/([^/]+)\/status\/\d+/);
      return match ? match[1].toLowerCase() : null;
    }

    if (platform === "TIKTOK") {
      if (!parsed.hostname.match(/^(www\.)?tiktok\.com$/)) return null;
      const match = parsed.pathname.match(/^\/@([^/]+)\/video\/\d+/);
      return match ? match[1].toLowerCase() : null;
    }

    if (platform === "INSTAGRAM") {
      if (!parsed.hostname.match(/^(www\.)?instagram\.com$/)) return null;
      // Instagram post URLs: /p/CODE/ or /reel/CODE/
      const match = parsed.pathname.match(/^\/(p|reel)\/[A-Za-z0-9_-]+/);
      return match ? "valid" : null; // URL is valid but doesn't contain username
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract tweet ID from a Twitter/X URL.
 */
function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Fetch tweet text and username via Twitter's syndication API (free, no auth).
 * Falls back to oEmbed if syndication fails.
 */
async function fetchTweetData(tweetUrl: string): Promise<{ text: string; username: string } | null> {
  const tweetId = extractTweetId(tweetUrl);
  if (!tweetId) return null;

  // Try syndication API first — returns clean JSON with text + username
  try {
    const response = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=x`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.text && data.user?.screen_name) {
        return { text: data.text, username: data.user.screen_name.toLowerCase() };
      }
    }
  } catch { /* fall through */ }

  // Fallback: oEmbed API
  try {
    const twitterUrl = tweetUrl.replace("x.com", "twitter.com");
    const response = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(twitterUrl)}&omit_script=true`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (response.ok) {
      const data = await response.json();
      const authorMatch = data.author_url?.match(/twitter\.com\/(\w+)/);
      const username = authorMatch ? authorMatch[1].toLowerCase() : "";
      return { text: data.html || "", username };
    }
  } catch { /* fall through */ }

  return null;
}

/**
 * Fetch TikTok video caption and username via their free oEmbed API.
 */
async function fetchTikTokData(videoUrl: string): Promise<{ text: string; username: string } | null> {
  try {
    // Ensure URL has www prefix for oEmbed compatibility
    const normalizedUrl = videoUrl.replace("tiktok.com", "www.tiktok.com").replace("www.www.", "www.");
    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(normalizedUrl)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (data.title !== undefined && data.author_unique_id) {
      return {
        text: data.title || "",
        username: data.author_unique_id.toLowerCase(),
      };
    }
    // Fallback: extract username from author_url
    if (data.author_url) {
      const match = data.author_url.match(/@([^/?]+)/);
      return {
        text: data.title || data.html || "",
        username: match ? match[1].toLowerCase() : "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch Instagram bio for a given username via Instagram's web profile API.
 * The user adds the verification code to their bio temporarily.
 */
async function fetchInstagramBio(username: string): Promise<{ bio: string; username: string } | null> {
  try {
    const response = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "x-ig-app-id": "936619743392459",
          "x-requested-with": "XMLHttpRequest",
          "Accept": "*/*",
          "Referer": `https://www.instagram.com/${username}/`,
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const user = data?.data?.user;
    if (!user) return null;

    return {
      bio: user.biography || "",
      username: (user.username || "").toLowerCase(),
    };
  } catch {
    return null;
  }
}

export async function verifyPostUrl(
  platform: string,
  expectedHandle: string,
  postUrl: string,
  code: string
): Promise<VerificationResult> {
  const cleanHandle = expectedHandle.replace("@", "").toLowerCase();

  // ── TWITTER ──
  if (platform === "TWITTER") {
    const urlUsername = extractUsernameFromUrl("TWITTER", postUrl);
    if (!urlUsername) {
      return { verified: false, error: "Invalid Twitter/X post URL. Expected format: https://x.com/username/status/123456" };
    }
    if (urlUsername !== cleanHandle) {
      return { verified: false, error: `URL belongs to @${urlUsername}, not @${cleanHandle}` };
    }

    const tweetData = await fetchTweetData(postUrl);
    if (!tweetData) {
      return { verified: false, error: "Could not fetch tweet. Make sure the tweet is public." };
    }
    if (tweetData.username && tweetData.username !== cleanHandle) {
      return { verified: false, error: `Tweet belongs to @${tweetData.username}, not @${cleanHandle}` };
    }
    if (!tweetData.text.includes(code)) {
      return { verified: false, error: "Verification code not found in the tweet. Make sure your tweet contains the exact code." };
    }
    return { verified: true };
  }

  // ── TIKTOK ──
  if (platform === "TIKTOK") {
    const urlUsername = extractUsernameFromUrl("TIKTOK", postUrl);
    if (!urlUsername) {
      return { verified: false, error: "Invalid TikTok URL. Expected format: https://tiktok.com/@username/video/123456" };
    }
    if (urlUsername !== cleanHandle) {
      return { verified: false, error: `URL belongs to @${urlUsername}, not @${cleanHandle}` };
    }

    const tiktokData = await fetchTikTokData(postUrl);
    if (!tiktokData) {
      return { verified: false, error: "Could not fetch TikTok video. Make sure the video is public." };
    }
    if (tiktokData.username && tiktokData.username !== cleanHandle) {
      return { verified: false, error: `Video belongs to @${tiktokData.username}, not @${cleanHandle}` };
    }
    if (!tiktokData.text.includes(code)) {
      return { verified: false, error: "Verification code not found in the video caption. Make sure your video description contains the exact code." };
    }
    return { verified: true };
  }

  // ── INSTAGRAM ──
  // For Instagram, we check the user's BIO instead of a post URL.
  // The `postUrl` parameter is ignored — we fetch the profile directly.
  if (platform === "INSTAGRAM") {
    const instaData = await fetchInstagramBio(cleanHandle);
    if (!instaData) {
      return { verified: false, error: "Could not fetch Instagram profile. Make sure the account is public." };
    }

    if (instaData.username !== cleanHandle) {
      return { verified: false, error: `Profile username @${instaData.username} doesn't match @${cleanHandle}` };
    }

    if (!instaData.bio.includes(code)) {
      return {
        verified: false,
        error: "Verification code not found in your Instagram bio. Add the code to your bio and try again.",
      };
    }

    return { verified: true };
  }

  return { verified: false, error: "Unsupported platform." };
}
