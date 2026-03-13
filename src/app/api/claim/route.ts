import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationCode } from "@/lib/verification";
import crypto from "crypto";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";
import { VALID_PLATFORMS } from "@/lib/constants";

// POST: Start a claim (generate verification code + session secret)
export async function POST(req: NextRequest) {
  try {
    const { platform, socialHandle } = await req.json();

    const ip = getClientIp(req);
    const { limited } = rateLimit(`claim:${ip}`, 10);
    if (limited) return rateLimitResponse();

    if (!platform || !socialHandle) {
      return NextResponse.json({ error: "Missing platform or socialHandle" }, { status: 400 });
    }

    if (!VALID_PLATFORMS.includes(platform as any)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    const cleanHandle = socialHandle.replace("@", "");

    // Check token exists for this handle
    const token = await prisma.token.findUnique({
      where: { platform_socialHandle: { platform, socialHandle: cleanHandle } },
    });

    if (!token) {
      return NextResponse.json(
        { error: `No token found for @${cleanHandle} on ${platform}` },
        { status: 404 }
      );
    }

    if (token.claimStatus === "CLAIMED") {
      return NextResponse.json(
        { error: "This token has already been claimed" },
        { status: 409 }
      );
    }

    // Generate verification code AND a session secret
    // The session secret must be provided when verifying — it's only given to the person who initiated
    const verificationCode = generateVerificationCode();
    const sessionSecret = crypto.randomBytes(32).toString("hex");

    // Delete any old unverified claims for this handle
    await prisma.claim.deleteMany({
      where: { platform, socialHandle: cleanHandle, verified: false },
    });

    // Create new claim with session secret baked into the verification code field
    // We store sessionSecret in destinationWallet temporarily (it's null until claimed)
    const claim = await prisma.claim.create({
      data: {
        tokenId: token.id,
        platform,
        socialHandle: cleanHandle,
        verificationCode,
        destinationWallet: sessionSecret, // repurpose as session secret storage
      },
    });

    const platformInstructions: Record<string, string> = {
      TWITTER: `Add this code to your Twitter/X bio: ${verificationCode}`,
      INSTAGRAM: `Add this code to your Instagram bio: ${verificationCode}`,
      TIKTOK: `Add this code to your TikTok bio: ${verificationCode}`,
    };

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      sessionSecret, // only the person who initiated gets this
      verificationCode,
      instructions: platformInstructions[platform],
      tokenName: token.name,
      tokenSymbol: token.symbol,
    });
  } catch (error: unknown) {
    console.error("Claim error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
