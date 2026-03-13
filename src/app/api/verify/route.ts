import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPostUrl } from "@/lib/verification";
import { decrypt } from "@/lib/encryption";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";
export async function POST(req: NextRequest) {
  try {
    const { claimId, sessionSecret, postUrl } = await req.json();

    const ip = getClientIp(req);
    const { limited } = rateLimit(`verify:${ip}`, 10);
    if (limited) return rateLimitResponse();

    if (!claimId || !sessionSecret || !postUrl) {
      return NextResponse.json({ error: "Missing claimId, sessionSecret, or postUrl" }, { status: 400 });
    }

    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.verified) {
      return NextResponse.json({ error: "Already claimed" }, { status: 409 });
    }

    // Verify session secret — only the person who initiated the claim has this
    if (claim.destinationWallet !== sessionSecret) {
      return NextResponse.json({ error: "Invalid session. Please start the claim process again." }, { status: 403 });
    }

    // Verify the post URL — checks username ownership + code presence
    const result = await verifyPostUrl(
      claim.platform,
      claim.socialHandle,
      postUrl,
      claim.verificationCode
    );

    if (!result.verified) {
      return NextResponse.json({
        success: false,
        error: result.error || "Verification failed.",
      }, { status: 400 });
    }

    // Get the token
    const token = await prisma.token.findFirst({
      where: { platform: claim.platform, socialHandle: claim.socialHandle },
    });

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // Decrypt the private key
    const privateKey = decrypt(token.encryptedPrivateKey);

    // Atomic update with race condition guard
    const updateResult = await prisma.token.updateMany({
      where: { id: token.id, claimStatus: "UNCLAIMED" },
      data: {
        claimStatus: "CLAIMED",
        claimedAt: new Date(),
        claimedBy: claim.socialHandle,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Token was already claimed" }, { status: 409 });
    }

    await prisma.claim.update({
      where: { id: claimId },
      data: { verified: true, verifiedAt: new Date(), destinationWallet: null },
    });

    return NextResponse.json({
      success: true,
      wallet: {
        publicKey: token.creatorPublicKey,
        privateKey,
      },
      token: {
        name: token.name,
        symbol: token.symbol,
        mintAddress: token.mintAddress,
      },
    });
  } catch (error: unknown) {
    console.error("Verify error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
