import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCreatorWallet } from "@/lib/solana";
import { prepareLaunch, executeLaunch } from "@/lib/pumpfun";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";
import { VALID_PLATFORMS, MAX_TOKEN_NAME_LENGTH, MAX_SYMBOL_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE_BYTES, MAX_INITIAL_BUY_SOL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step } = body;

    const ip = getClientIp(req);
    const { limited } = rateLimit(`launch:${ip}`, 5); // 5 launches per minute
    if (limited) return rateLimitResponse();

    if (step === "execute") {
      return handleExecute(body);
    }
    return handlePrepare(body);
  } catch (error: unknown) {
    console.error("Launch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePrepare(body: Record<string, unknown>) {
  const { name, symbol, description, platform, socialHandle, launcherWallet, initialBuySOL, imageData } = body as {
    name: string; symbol: string; description: string; platform: string;
    socialHandle: string; launcherWallet: string; initialBuySOL: number; imageData?: string;
  };

  if (!name || !symbol || !platform || !socialHandle || !launcherWallet) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["TWITTER", "INSTAGRAM", "TIKTOK"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  if (name.length > MAX_TOKEN_NAME_LENGTH) {
    return NextResponse.json({ error: `Token name must be under ${MAX_TOKEN_NAME_LENGTH} characters` }, { status: 400 });
  }
  if (symbol.length > MAX_SYMBOL_LENGTH) {
    return NextResponse.json({ error: `Symbol must be under ${MAX_SYMBOL_LENGTH} characters` }, { status: 400 });
  }
  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json({ error: `Description must be under ${MAX_DESCRIPTION_LENGTH} characters` }, { status: 400 });
  }
  if (initialBuySOL < 0 || initialBuySOL > MAX_INITIAL_BUY_SOL) {
    return NextResponse.json({ error: `Initial buy must be between 0 and ${MAX_INITIAL_BUY_SOL} SOL` }, { status: 400 });
  }
  if (imageData && typeof imageData === "string") {
    const estimatedSize = (imageData.length * 3) / 4;
    if (estimatedSize > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }
  }

  const cleanHandle = socialHandle.replace("@", "");

  const existing = await prisma.token.findUnique({
    where: { platform_socialHandle: { platform, socialHandle: cleanHandle } },
  });

  if (existing) {
    return NextResponse.json(
      { error: `A token already exists for @${cleanHandle} on ${platform}` },
      { status: 409 }
    );
  }

  const wallet = generateCreatorWallet();

  let imageFile: Buffer | undefined;
  if (imageData && typeof imageData === "string" && imageData.startsWith("data:")) {
    const base64 = imageData.split(",")[1];
    imageFile = Buffer.from(base64, "base64");
  }

  const result = await prepareLaunch({
    name,
    symbol,
    description: description || `Token for @${cleanHandle}`,
    imageFile,
    creatorPublicKey: wallet.publicKey,
    encryptedPrivateKey: wallet.encryptedPrivateKey,
    launcherWallet,
    initialBuySOL: (initialBuySOL as number) || 0,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Save to DB
  const token = await prisma.token.create({
    data: {
      mintAddress: result.mintAddress!,
      name,
      symbol,
      description,
      imageUrl: imageData ? "(uploaded)" : null,
      platform,
      socialHandle: cleanHandle,
      creatorPublicKey: wallet.publicKey,
      encryptedPrivateKey: wallet.encryptedPrivateKey,
      launcherWallet,
    },
  });

  return NextResponse.json({
    success: true,
    step: "funding",
    tokenId: token.id,
    mintAddress: result.mintAddress,
    fundingTransaction: result.fundingTransaction,
    fundingAmountSOL: result.fundingAmountSOL,
    mintKeypairSecret: result.mintKeypairSecret,
    metadataUri: result.metadataUri,
    encryptedPrivateKey: wallet.encryptedPrivateKey,
  });
}

async function handleExecute(body: Record<string, unknown>) {
  const { tokenId, name, symbol, metadataUri, encryptedPrivateKey, mintKeypairSecret } = body as {
    tokenId: string; name: string; symbol: string; metadataUri: string;
    encryptedPrivateKey: string; mintKeypairSecret: string;
  };

  if (!tokenId || !metadataUri || !encryptedPrivateKey || !mintKeypairSecret) {
    return NextResponse.json({ error: "Missing execute params" }, { status: 400 });
  }

  const result = await executeLaunch({
    name,
    symbol,
    metadataUri,
    encryptedPrivateKey,
    mintKeypairSecret,
  });

  if (!result.success) {
    await prisma.token.delete({ where: { id: tokenId } }).catch((e) => {
      console.error("Failed to clean up token after launch failure:", e);
    });
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    step: "complete",
    mintAddress: result.mintAddress,
    signature: result.signature,
  });
}
