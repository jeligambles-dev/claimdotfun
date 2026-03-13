import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCreatorWallet } from "@/lib/solana";

export async function POST() {
  try {
    // Clear existing test data
    await prisma.claim.deleteMany({});
    await prisma.token.deleteMany({});

    const wallet1 = generateCreatorWallet();
    const wallet2 = generateCreatorWallet();
    const wallet3 = generateCreatorWallet();

    // Unclaimed token
    const token1 = await prisma.token.create({
      data: {
        mintAddress: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
        name: "Drake Coin",
        symbol: "DRAKE",
        description: "The official Drake community token",
        imageUrl: "https://pump.fun/_next/image?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmeSWBpUfJGFYWkjsQmCkYMh2zCNBCw3CzPwxDt8oTBZ9E&w=256&q=75",
        platform: "TWITTER",
        socialHandle: "drake",
        creatorPublicKey: wallet1.publicKey,
        encryptedPrivateKey: wallet1.encryptedPrivateKey,
        launcherWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        claimStatus: "UNCLAIMED",
        totalFeesEarned: 12.5,
      },
    });

    // Claimed token — claimed 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const token2 = await prisma.token.create({
      data: {
        mintAddress: "9pKBrBwRGHe9d8XVo2rEYx4CjQAJNqFhPSMdst4NyAir",
        name: "MrBeast Token",
        symbol: "BEAST",
        description: "Community token for MrBeast fans",
        imageUrl: "https://pump.fun/_next/image?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmYHqVMdUaFBYsMsnE5GRiasqJG8boDYNBKhPSgXnMmKDP&w=256&q=75",
        platform: "TWITTER",
        socialHandle: "mrbeast",
        creatorPublicKey: wallet2.publicKey,
        encryptedPrivateKey: wallet2.encryptedPrivateKey,
        launcherWallet: "3nMFwZXwY1s1M5s1N2mBfBiGRncd8EJRtUs1utYbpXew",
        claimStatus: "CLAIMED",
        claimedAt: twoHoursAgo,
        claimedBy: "mrbeast",
        totalFeesEarned: 45.8,
      },
    });

    // Claimed token on Instagram — claimed 30 min ago
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const token3 = await prisma.token.create({
      data: {
        mintAddress: "4vMsoUT2BWatFweudnQM1xedRLfJgJ7hswhcpz4xgBTy",
        name: "Charli Token",
        symbol: "CHARLI",
        description: "TikTok queen token",
        imageUrl: "https://pump.fun/_next/image?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmPJjRFGLKEtbwnb3P4MuEBJbFgg7jxwmicnqJEoTYfadV&w=256&q=75",
        platform: "TIKTOK",
        socialHandle: "charlidamelio",
        creatorPublicKey: wallet3.publicKey,
        encryptedPrivateKey: wallet3.encryptedPrivateKey,
        launcherWallet: "9pKBrBwRGHe9d8XVo2rEYx4CjQAJNqFhPSMdst4NyAir",
        claimStatus: "CLAIMED",
        claimedAt: thirtyMinAgo,
        claimedBy: "charlidamelio",
        totalFeesEarned: 8.2,
      },
    });

    // Add an active claim on Drake Coin (started 20 min ago, so ~40 min left)
    await prisma.claim.create({
      data: {
        tokenId: token1.id,
        platform: "TWITTER",
        socialHandle: "drake",
        verificationCode: "TEST_CODE_" + Math.random().toString(36).slice(2, 8),
        verified: false,
        destinationWallet: "test_session_secret",
      },
    });

    return NextResponse.json({
      success: true,
      tokens: [token1, token2, token3],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
