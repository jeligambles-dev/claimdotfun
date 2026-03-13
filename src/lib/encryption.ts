import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";

const WEAK_KEY = !ENCRYPTION_KEY || ENCRYPTION_KEY === "CHANGE_ME_TO_A_RANDOM_64_HEX_CHAR_STRING";
if (WEAK_KEY) {
  console.warn("WARNING: Set a proper ENCRYPTION_KEY in .env");
}

function assertKey() {
  if (WEAK_KEY && process.env.NODE_ENV === "production") {
    throw new Error("FATAL: Set a proper ENCRYPTION_KEY in .env before running in production");
  }
}

// Derive a 32-byte key from the env variable using SHA-256
const KEY = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  assertKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(ciphertext: string): string {
  assertKey();
  // Support legacy CryptoJS format (starts with "U2F" base64)
  if (!ciphertext.includes(":")) {
    // Legacy CryptoJS encrypted data — try to decrypt with CryptoJS compat
    // For now, throw a clear error
    throw new Error("Legacy encrypted data detected. Re-encrypt with current system.");
  }
  const [ivHex, encryptedHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
