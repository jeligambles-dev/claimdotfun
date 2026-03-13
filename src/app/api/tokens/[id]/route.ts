import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = await prisma.token.findUnique({
    where: { id },
    select: {
      id: true,
      mintAddress: true,
      name: true,
      symbol: true,
      description: true,
      imageUrl: true,
      platform: true,
      socialHandle: true,
      creatorPublicKey: true,
      launcherWallet: true,
      claimStatus: true,
      claimedAt: true,
      claimedBy: true,
      totalFeesEarned: true,
      createdAt: true,
    },
  });

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  return NextResponse.json({ token });
}
