import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";
import { decrypt } from "./encryption";
import { RPC_URL, DEPLOY_COST_SOL, PRIORITY_FEE_SOL } from "./constants";
const PUMP_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
const MPL_TOKEN_METADATA = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

interface LaunchTokenParams {
  name: string;
  symbol: string;
  description: string;
  imageFile?: Buffer;
  imageUrl?: string;
  creatorPublicKey: string;
  encryptedPrivateKey: string;
  launcherWallet: string;
  initialBuySOL: number;
}

interface PrepareResult {
  success: boolean;
  mintAddress?: string;
  error?: string;
  fundingTransaction?: string;
  fundingAmountSOL?: number;
  mintKeypairSecret?: string;
  metadataUri?: string;
}

interface LaunchResult {
  success: boolean;
  mintAddress?: string;
  signature?: string;
  error?: string;
}

export async function uploadTokenMetadata(
  name: string,
  symbol: string,
  description: string,
  imageFile?: Buffer,
  imageUrl?: string,
): Promise<{ metadataUri: string; metadataName: string; metadataSymbol: string }> {
  const formData = new FormData();

  if (imageFile) {
    formData.append("file", new Blob([new Uint8Array(imageFile)]), "token-image.png");
  } else if (imageUrl) {
    const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
    if (!imageResponse.ok) throw new Error("Failed to download image from URL");
    const imageBlob = await imageResponse.blob();
    formData.append("file", imageBlob, "token-image.png");
  } else {
    const placeholder = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    formData.append("file", new Blob([placeholder]), "token-image.png");
  }

  formData.append("name", name);
  formData.append("symbol", symbol);
  formData.append("description", description);
  formData.append("showName", "true");

  const response = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.metadataUri) {
    throw new Error("Failed to upload metadata to IPFS");
  }
  return {
    metadataUri: data.metadataUri,
    metadataName: data.metadata.name,
    metadataSymbol: data.metadata.symbol,
  };
}

/**
 * Build the raw pump.fun create instruction.
 * The `user` (creator wallet) becomes the on-chain creator who earns 0.3% fees.
 */
function buildPumpCreateInstruction(
  mint: PublicKey,
  user: PublicKey,
  name: string,
  symbol: string,
  uri: string,
): TransactionInstruction {
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint-authority")],
    PUMP_PROGRAM
  );
  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint.toBuffer()],
    PUMP_PROGRAM
  );
  const [global] = PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    PUMP_PROGRAM
  );
  const [eventAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    PUMP_PROGRAM
  );
  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), MPL_TOKEN_METADATA.toBuffer(), mint.toBuffer()],
    MPL_TOKEN_METADATA
  );
  const associatedBondingCurve = getAssociatedTokenAddressSync(
    mint,
    bondingCurve,
    true // allowOwnerOffCurve
  );

  // Instruction data: 8-byte discriminator + borsh strings + creator pubkey
  const discriminator = Buffer.from([24, 30, 200, 40, 5, 28, 7, 119]);
  const nameBytes = Buffer.from(name, "utf-8");
  const symbolBytes = Buffer.from(symbol, "utf-8");
  const uriBytes = Buffer.from(uri, "utf-8");

  // Borsh string = 4-byte LE length prefix + UTF-8 bytes
  const nameLen = Buffer.alloc(4);
  nameLen.writeUInt32LE(nameBytes.length);
  const symbolLen = Buffer.alloc(4);
  symbolLen.writeUInt32LE(symbolBytes.length);
  const uriLen = Buffer.alloc(4);
  uriLen.writeUInt32LE(uriBytes.length);

  const data = Buffer.concat([
    discriminator,
    nameLen, nameBytes,
    symbolLen, symbolBytes,
    uriLen, uriBytes,
    user.toBuffer(), // creator pubkey (32 bytes)
  ]);

  const keys = [
    { pubkey: mint,                     isSigner: true,  isWritable: true  },
    { pubkey: mintAuthority,            isSigner: false, isWritable: false },
    { pubkey: bondingCurve,             isSigner: false, isWritable: true  },
    { pubkey: associatedBondingCurve,   isSigner: false, isWritable: true  },
    { pubkey: global,                   isSigner: false, isWritable: false },
    { pubkey: MPL_TOKEN_METADATA,       isSigner: false, isWritable: false },
    { pubkey: metadata,                 isSigner: false, isWritable: true  },
    { pubkey: user,                     isSigner: true,  isWritable: true  },
    { pubkey: SystemProgram.programId,  isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID,         isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY,       isSigner: false, isWritable: false },
    { pubkey: eventAuthority,           isSigner: false, isWritable: false },
    { pubkey: PUMP_PROGRAM,             isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({ keys, programId: PUMP_PROGRAM, data });
}

/**
 * Step 1: Upload metadata, generate mint, build a funding transaction
 * for the launcher to sign via Phantom.
 */
export async function prepareLaunch(params: LaunchTokenParams): Promise<PrepareResult> {
  try {
    const mintKeypair = Keypair.generate();

    const { metadataUri } = await uploadTokenMetadata(
      params.name,
      params.symbol,
      params.description,
      params.imageFile,
      params.imageUrl,
    );

    // Funding amount: deploy cost + initial buy
    const fundingAmount = DEPLOY_COST_SOL + (params.initialBuySOL || 0);

    // Build funding tx: launcher -> creator wallet
    const connection = new Connection(RPC_URL, "confirmed");
    const launcherPubkey = new PublicKey(params.launcherWallet);
    const creatorPubkey = new PublicKey(params.creatorPublicKey);

    const fundingTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: launcherPubkey,
        toPubkey: creatorPubkey,
        lamports: Math.ceil(fundingAmount * LAMPORTS_PER_SOL),
      })
    );

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    fundingTx.recentBlockhash = blockhash;
    fundingTx.feePayer = launcherPubkey;

    const serializedFunding = fundingTx.serialize({ requireAllSignatures: false }).toString("base64");

    // Encode mint secret key for passing to step 2
    const mintSecret = Buffer.from(mintKeypair.secretKey).toString("base64");

    return {
      success: true,
      mintAddress: mintKeypair.publicKey.toBase58(),
      fundingTransaction: serializedFunding,
      fundingAmountSOL: fundingAmount,
      mintKeypairSecret: mintSecret,
      metadataUri,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Step 2: After funding is confirmed, build and send the pump.fun create transaction.
 * The creator wallet is the on-chain creator (earns 0.3% fees).
 */
export async function executeLaunch(params: {
  name: string;
  symbol: string;
  metadataUri: string;
  encryptedPrivateKey: string;
  mintKeypairSecret: string;
}): Promise<LaunchResult> {
  try {
    const privateKeyBase58 = decrypt(params.encryptedPrivateKey);
    const creatorKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
    const mintKeypair = Keypair.fromSecretKey(
      new Uint8Array(Buffer.from(params.mintKeypairSecret, "base64"))
    );

    const connection = new Connection(RPC_URL, "confirmed");

    // Build the raw pump.fun create instruction
    const createIx = buildPumpCreateInstruction(
      mintKeypair.publicKey,
      creatorKeypair.publicKey,
      params.name,
      params.symbol,
      params.metadataUri,
    );

    const tx = new Transaction().add(createIx);
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = creatorKeypair.publicKey;

    // Sign with both mint and creator keypairs
    tx.sign(mintKeypair, creatorKeypair);

    const signature = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(signature, "confirmed");

    return {
      success: true,
      mintAddress: mintKeypair.publicKey.toBase58(),
      signature,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Execute launch error:", message);
    return { success: false, error: message };
  }
}

export async function claimCreatorFees(encryptedPrivateKey: string): Promise<{
  success: boolean;
  signature?: string;
  error?: string;
}> {
  try {
    const privateKeyBase58 = decrypt(encryptedPrivateKey);
    const creatorKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));

    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: creatorKeypair.publicKey.toBase58(),
        action: "collectCreatorFee",
        pool: "pump",
        priorityFee: PRIORITY_FEE_SOL,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (response.status !== 200) {
      const errText = await response.text();
      return { success: false, error: errText };
    }

    const txData = await response.arrayBuffer();
    const { VersionedTransaction } = await import("@solana/web3.js");
    const vtx = VersionedTransaction.deserialize(new Uint8Array(txData));
    vtx.sign([creatorKeypair]);

    const connection = new Connection(RPC_URL, "confirmed");
    const signature = await connection.sendTransaction(vtx);
    await connection.confirmTransaction(signature, "confirmed");

    return { success: true, signature };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
