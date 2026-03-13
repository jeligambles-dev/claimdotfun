import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// GET: List tokens (public dashboard data)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.claimStatus = status;
  if (platform) where.platform = platform;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { symbol: { contains: search } },
      { socialHandle: { contains: search } },
      { mintAddress: { contains: search } },
    ];
  }

  const tokens = await prisma.token.findMany({
    where,
    select: {
      id: true,
      mintAddress: true,
      name: true,
      symbol: true,
      imageUrl: true,
      platform: true,
      socialHandle: true,
      creatorPublicKey: true,
      launcherWallet: true,
      claimStatus: true,
      claimedAt: true,
      totalFeesEarned: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch active claims for unclaimed tokens
  const tokenIds = tokens.filter((t) => t.claimStatus === "UNCLAIMED").map((t) => t.id);
  const activeClaims = tokenIds.length > 0
    ? await prisma.claim.findMany({
        where: {
          tokenId: { in: tokenIds },
          verified: false,
        },
        select: {
          tokenId: true,
          createdAt: true,
          platform: true,
          socialHandle: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Build a map of tokenId -> active claim
  const claimMap: Record<string, { createdAt: string }> = {};
  for (const claim of activeClaims) {
    claimMap[claim.tokenId] = {
      createdAt: new Date(claim.createdAt).toISOString(),
    };
  }

  const enrichedTokens = tokens.map((t) => ({
    ...t,
    activeClaim: claimMap[t.id] || null,
  }));

  return NextResponse.json({ tokens: enrichedTokens });
}
