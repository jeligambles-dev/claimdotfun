import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint that fetches social media profile pictures.
 * Returns the image directly so it can be used as an <img> src.
 *
 * Usage: /api/social-avatar?platform=TWITTER&handle=elonmusk
 */
export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform");
  const handle = req.nextUrl.searchParams.get("handle")?.replace("@", "");

  if (!platform || !handle) {
    return NextResponse.json({ error: "Missing platform or handle" }, { status: 400 });
  }

  if (!["TWITTER", "INSTAGRAM", "TIKTOK"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  try {
    if (platform === "TWITTER") {
      // Use unavatar.io which aggregates profile pics from Twitter/X
      const response = await fetch(
        `https://unavatar.io/twitter/${encodeURIComponent(handle)}`,
        {
          signal: AbortSignal.timeout(8000),
          redirect: "follow",
        }
      );

      if (!response.ok) {
        return NextResponse.json({ error: "Could not fetch avatar" }, { status: 404 });
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    if (platform === "INSTAGRAM") {
      const response = await fetch(
        `https://unavatar.io/instagram/${encodeURIComponent(handle)}`,
        {
          signal: AbortSignal.timeout(8000),
          redirect: "follow",
        }
      );

      if (!response.ok) {
        return NextResponse.json({ error: "Could not fetch avatar" }, { status: 404 });
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    if (platform === "TIKTOK") {
      // TikTok oEmbed gives us thumbnail_url which is the author's avatar
      const response = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${handle}`)}`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.author_thumbnail_url) {
          const imgRes = await fetch(data.author_thumbnail_url, {
            signal: AbortSignal.timeout(8000),
            redirect: "follow",
          });
          if (imgRes.ok) {
            const imageBuffer = await imgRes.arrayBuffer();
            const contentType = imgRes.headers.get("content-type") || "image/jpeg";
            return new NextResponse(imageBuffer, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
              },
            });
          }
        }
      }

      // Fallback to unavatar
      const fallback = await fetch(
        `https://unavatar.io/tiktok/${encodeURIComponent(handle)}`,
        { signal: AbortSignal.timeout(8000), redirect: "follow" }
      );
      if (fallback.ok) {
        const imageBuffer = await fallback.arrayBuffer();
        const contentType = fallback.headers.get("content-type") || "image/jpeg";
        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }

      return NextResponse.json({ error: "Could not fetch avatar" }, { status: 404 });
    }

    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch avatar" }, { status: 500 });
  }
}
