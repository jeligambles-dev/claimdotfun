# ClaimDotFun

Launch pump.fun tokens linked to social media creators. Creator wallet keys are encrypted and held in escrow until the real creator verifies ownership.

## The Problem

On pump.fun, creator rewards go to whatever wallet deployed the token. There is no way to link them to a Twitter, Instagram, or TikTok account. When someone launches a token in a creator's name, the deployer earns the fees — not the creator.

## How It Works

### 1. Launch
Anyone can launch a token for a creator. Pick a platform (Twitter, Instagram, or TikTok), enter the creator's handle, fill in token details, and deploy.

Behind the scenes, ClaimDotFun generates a fresh Solana keypair. This becomes the creator wallet. The token deploys to pump.fun using this wallet, so 100% of creator trading fees route to it.

The private key is AES-256 encrypted and stored in escrow. The launcher never sees it.

### 2. Fees Accumulate
Every trade on pump.fun generates creator fees. These fees accumulate in the creator wallet automatically. No action needed from anyone.

### 3. Creator Claims
When the real creator is ready, they verify ownership of their social account:

- **Twitter/X** — Post a tweet containing a verification code, paste the tweet URL
- **Instagram** — Add the verification code to your bio
- **TikTok** — Post a video with the code in the caption, paste the video URL

Once verified, the encrypted private key is decrypted and revealed. The creator imports it into Phantom or Solflare and the funds are theirs.

There is no time limit. Claims never expire.

## Key Details

- **One token per creator** — Each social account can only have one token to prevent fragmentation
- **Session-locked claims** — Each claim session is tied to the user's browser. Even if someone sees the verification code, they cannot claim without the session
- **Encrypted at rest** — Private keys are AES-256 encrypted and decrypted only once during successful verification
- **Multi-platform** — Supports Twitter/X, Instagram, and TikTok
- **No creator involvement at launch** — The creator does not need to know about the token for it to work

## Links

- [ClaimDotFun on X](https://x.com/claimdotfun)
