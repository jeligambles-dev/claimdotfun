import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { encrypt } from "./encryption";

export interface GeneratedWallet {
  publicKey: string;
  encryptedPrivateKey: string;
}

export function generateCreatorWallet(): GeneratedWallet {
  const keypair = Keypair.generate();
  const privateKeyBase58 = bs58.encode(keypair.secretKey);
  const encryptedPrivateKey = encrypt(privateKeyBase58);

  return {
    publicKey: keypair.publicKey.toBase58(),
    encryptedPrivateKey,
  };
}
