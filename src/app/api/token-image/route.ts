import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint that fetches pump.fun token images server-side.
 * Queries pump.fun API for the IPFS image URI, then proxies the image.
 * Usage: /api/token-image?mint=<mintAddress>
 */
export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get("mint");

  if (!mint || !/^[A-Za-z0-9]{32,50}$/.test(mint)) {
    return NextResponse.json({ error: "Invalid mint address" }, { status: 400 });
  }

  try {
    // Get token data from pump.fun API to find the IPFS image URI
    const apiRes = await fetch(
      `https://frontend-api-v3.pump.fun/coins/${mint}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (apiRes.ok) {
      const data = await apiRes.json();
      const imageUri = data.image_uri;

      if (imageUri && typeof imageUri === "string") {
        const imgRes = await fetch(imageUri, {
          signal: AbortSignal.timeout(10000),
          redirect: "follow",
        });

        if (imgRes.ok) {
          const contentType = imgRes.headers.get("content-type") || "image/png";
          if (contentType.startsWith("image/")) {
            const imageBuffer = await imgRes.arrayBuffer();
            return new NextResponse(imageBuffer, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
