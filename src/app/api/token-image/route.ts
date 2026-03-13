import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint that fetches pump.fun token images server-side to avoid CORS.
 * Usage: /api/token-image?mint=<mintAddress>
 */
export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get("mint");

  if (!mint || !/^[A-Za-z0-9]{32,50}$/.test(mint)) {
    return NextResponse.json({ error: "Invalid mint address" }, { status: 400 });
  }

  try {
    // Try pump.fun coin image endpoint
    const response = await fetch(
      `https://pump.fun/coin/${mint}/image`,
      {
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
      }
    );

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.startsWith("image/")) {
        const imageBuffer = await response.arrayBuffer();
        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      }
    }

    // Fallback: try the pump.fun frontend image proxy
    const fallback = await fetch(
      `https://pump.fun/_next/image?url=https%3A%2F%2Fcoin-images.coingecko.com%2Fcoins%2Fimages%2F${mint}&w=128&q=75`,
      {
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
      }
    );

    if (fallback.ok) {
      const contentType = fallback.headers.get("content-type") || "";
      if (contentType.startsWith("image/")) {
        const imageBuffer = await fallback.arrayBuffer();
        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      }
    }

    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
