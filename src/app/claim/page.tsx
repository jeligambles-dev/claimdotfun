"use client";

import { useState, useEffect } from "react";

const PLATFORMS = [
  { value: "TWITTER", label: "Twitter / X", icon: "x", postExample: "https://x.com/yourname/status/123..." },
  { value: "INSTAGRAM", label: "Instagram", icon: "ig", postExample: "https://instagram.com/p/ABC123..." },
  { value: "TIKTOK", label: "TikTok", icon: "tt", postExample: "https://tiktok.com/@yourname/video/123..." },
];

type Step = "search" | "post" | "verify" | "success";

interface ClaimData {
  claimId: string;
  sessionSecret: string;
  verificationCode: string;
  tokenName: string;
  tokenSymbol: string;
}

interface WalletData {
  publicKey: string;
  privateKey: string;
  tokenName: string;
  tokenSymbol: string;
  mintAddress: string;
}

export default function ClaimPage() {
  const [step, setStep] = useState<Step>("search");
  const [platform, setPlatform] = useState("TWITTER");
  const [socialHandle, setSocialHandle] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  // Clear sensitive data from memory after 5 minutes
  useEffect(() => {
    if (walletData) {
      const timer = setTimeout(() => {
        setWalletData(null);
        setShowPrivateKey(false);
        setStep("search");
      }, 5 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [walletData]);

  const startClaim = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, socialHandle }),
      });
      const data = await res.json();
      if (res.ok) {
        setClaimData(data);
        setStep("post");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (claimData) {
      navigator.clipboard.writeText(claimData.verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const verify = async () => {
    if (!claimData || (platform !== "INSTAGRAM" && !postUrl)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: claimData.claimId,
          sessionSecret: claimData.sessionSecret,
          postUrl: platform === "INSTAGRAM" ? "bio-check" : postUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWalletData({
          publicKey: data.wallet.publicKey,
          privateKey: data.wallet.privateKey,
          tokenName: data.token.name,
          tokenSymbol: data.token.symbol,
          mintAddress: data.token.mintAddress,
        });
        setStep("success");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-pump-card border border-pump-border rounded-lg px-4 py-2.5 text-pump-light placeholder-pump-gray focus:outline-none focus:border-pump-green transition-colors";
  const currentPlatform = PLATFORMS.find((p) => p.value === platform)!;

  const stepIndex = step === "search" ? 0 : step === "post" ? 1 : step === "verify" ? 2 : 3;
  const steps = [
    { label: "Find Token", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { label: "Post Code", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { label: "Verify", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { label: "Wallet", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
  ];

  return (
    <div className="max-w-5xl mx-auto flex gap-10">
      {/* Left side: Visual progress & info */}
      <div className="hidden lg:block w-80 flex-shrink-0 pt-2">
        <div className="sticky top-24 space-y-5">

          {/* Step progress */}
          <div className="bg-pump-card border border-pump-border rounded-2xl p-5">
            <h3 className="text-pump-gray text-xs uppercase tracking-widest mb-4">Claim Progress</h3>
            <div className="space-y-0">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      i < stepIndex ? "bg-pump-green text-black" :
                      i === stepIndex ? "bg-pump-green/20 border-2 border-pump-green text-pump-green" :
                      "bg-pump-dark border border-pump-border text-pump-gray"
                    }`}>
                      {i < stepIndex ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/></svg>
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-px h-6 mt-1 ${i < stepIndex ? "bg-pump-green" : "bg-pump-border"}`} />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <div className={`text-xs font-medium ${
                      i <= stepIndex ? "text-pump-light" : "text-pump-gray"
                    }`}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform-specific guide */}
          <div className="bg-pump-card border border-pump-border rounded-2xl p-5">
            <h3 className="text-pump-green font-bold text-sm mb-4">
              {platform === "TWITTER" ? "Twitter / X Guide" : platform === "INSTAGRAM" ? "Instagram Guide" : "TikTok Guide"}
            </h3>
            <div className="bg-pump-dark rounded-xl p-4 border border-pump-border space-y-3">

              {/* ── TWITTER GUIDE ── */}
              {platform === "TWITTER" && (
                <>
                  {/* Step: Compose tweet */}
                  <div className="bg-pump-card rounded-lg p-3 border border-pump-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </div>
                      <span className="text-pump-light text-[10px] font-medium">@yourname</span>
                      <span className="text-pump-gray text-[9px]">&middot; just now</span>
                    </div>
                    <p className="text-pump-light text-[10px] mb-1">claiming my creator token!</p>
                    <p className="text-pump-green text-[10px] font-mono bg-pump-green/10 rounded px-1.5 py-0.5 inline-block">CLAIM_x8f2k9e1</p>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 text-[8px] font-bold">1</span>
                    </div>
                    <span className="text-pump-gray text-[9px]">Tweet the code from your account</span>
                  </div>

                  <div className="h-px bg-pump-border" />

                  {/* Step: Copy URL */}
                  <div className="bg-pump-card rounded-lg p-3 border border-blue-500/20">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      <span className="text-pump-gray text-[9px]">Copy tweet URL from browser</span>
                    </div>
                    <div className="bg-pump-dark rounded px-2 py-1.5 border border-pump-border">
                      <span className="text-blue-400 text-[9px] font-mono">x.com/yourname/status/182...</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 text-[8px] font-bold">2</span>
                    </div>
                    <span className="text-pump-gray text-[9px]">Paste the tweet link here</span>
                  </div>

                  <div className="h-px bg-pump-border" />

                  {/* Step: Verified */}
                  <div className="bg-pump-green/10 rounded-lg p-3 border border-pump-green/30 flex items-center gap-2">
                    <svg className="w-4 h-4 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span className="text-pump-green text-[10px] font-medium">Wallet key revealed!</span>
                  </div>
                </>
              )}

              {/* ── INSTAGRAM GUIDE ── */}
              {platform === "INSTAGRAM" && (
                <>
                  {/* Step: Edit profile */}
                  <div className="bg-pump-card rounded-lg p-3 border border-pump-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-pump-card flex items-center justify-center">
                          <span className="text-pump-light text-[8px] font-bold">YN</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-pump-light text-[10px] font-semibold">yourname</div>
                        <div className="text-pump-gray text-[8px]">Edit Profile</div>
                      </div>
                    </div>
                    <div className="bg-pump-dark rounded-lg p-2 border border-pump-border">
                      <div className="text-pump-gray text-[8px] mb-1">Bio</div>
                      <div className="text-pump-light text-[9px]">photographer & creator</div>
                      <div className="text-pump-green text-[9px] font-mono mt-0.5">CLAIM_x8f2k9e1</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <span className="text-pink-400 text-[8px] font-bold">1</span>
                    </div>
                    <span className="text-pump-gray text-[9px]">Add code to your Instagram bio</span>
                  </div>

                  <div className="h-px bg-pump-border" />

                  {/* Step: Click verify */}
                  <div className="bg-pump-card rounded-lg p-3 border border-pink-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-pink-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z"/></svg>
                        <span className="text-pump-gray text-[9px]">We check your public bio</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <span className="text-pink-400 text-[8px] font-bold">2</span>
                    </div>
                    <span className="text-pump-gray text-[9px]">Click &quot;Verify &amp; Claim&quot; — no URL needed</span>
                  </div>

                  <div className="h-px bg-pump-border" />

                  {/* Step: Verified */}
                  <div className="bg-pump-green/10 rounded-lg p-3 border border-pump-green/30 flex items-center gap-2">
                    <svg className="w-4 h-4 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span className="text-pump-green text-[10px] font-medium">Wallet key revealed!</span>
                  </div>

                  <div className="mt-2 text-pump-gray text-[8px] italic">You can remove the code from your bio after claiming.</div>
                </>
              )}

              {/* ── TIKTOK GUIDE ── */}
              {platform === "TIKTOK" && (
                <>
                  {/* Step: Post video */}
                  <div className="bg-pump-card rounded-lg p-3 border border-pump-border">
                    <div className="flex gap-2">
                      <div className="w-12 h-16 rounded-lg bg-pump-dark border border-pump-border flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"/></svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-pump-light text-[10px] font-semibold">@yourname</span>
                          <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.4a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.1l-.38.8z"/></svg>
                        </div>
                        <p className="text-pump-light text-[9px]">claiming my token!</p>
                        <p className="text-pump-green text-[9px] font-mono bg-pump-green/10 rounded px-1 py-0.5 inline-block mt-0.5">CLAIM_x8f2k9e1</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-cyan-400 text-[8px] font-bold">1</span>
                    </div>
                    <span className="text-pump-gray text-[9px]">Post a video with the code in the caption</span>
                  </div>

                  <div className="h-px bg-pump-border" />

                  {/* Step: Copy URL */}
                  <div className="bg-pump-card rounded-lg p-3 border border-cyan-500/20">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                      <span className="text-pump-gray text-[9px]">Share &rarr; Copy Link</span>
                    </div>
                    <div className="bg-pump-dark rounded px-2 py-1.5 border border-pump-border">
                      <span className="text-cyan-400 text-[9px] font-mono">tiktok.com/@yourname/video/...</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-cyan-400 text-[8px] font-bold">2</span>
                    </div>
                    <span className="text-pump-gray text-[9px]">Paste the video link here</span>
                  </div>

                  <div className="h-px bg-pump-border" />

                  {/* Step: Verified */}
                  <div className="bg-pump-green/10 rounded-lg p-3 border border-pump-green/30 flex items-center gap-2">
                    <svg className="w-4 h-4 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span className="text-pump-green text-[10px] font-medium">Wallet key revealed!</span>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Right side: Claim form */}
      <div className="flex-1 max-w-lg">
      <h1 className="text-3xl font-bold mb-2 text-pump-green">Claim Your Token</h1>
      <p className="text-pump-gray mb-8">
        Verify your social account to receive your creator wallet and fees.
      </p>

      {/* Step 1: Search */}
      {step === "search" && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-pump-gray mb-2">Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    platform === p.value
                      ? "bg-pump-green text-black"
                      : "bg-pump-card border border-pump-border text-pump-gray hover:border-pump-green"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pump-gray mb-1">Your Handle</label>
            <input
              type="text"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              placeholder="@yourhandle"
              className={inputClasses}
            />
          </div>

          <button
            onClick={startClaim}
            disabled={loading || !socialHandle}
            className="w-full bg-pump-green hover:bg-pump-green-dim disabled:opacity-50 text-black py-3 rounded-xl font-semibold transition-all"
          >
            {loading ? "Searching..." : "Find My Token"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}

      {/* Step 2: Post the code */}
      {step === "post" && claimData && (
        <div className="space-y-5">
          <div className="bg-pump-card rounded-xl p-5 border border-pump-border">
            <div className="flex items-center justify-between mb-4">
              <p className="text-pump-green font-medium">
                Token found: {claimData.tokenName} ({claimData.tokenSymbol})
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-pump-light text-sm font-medium mb-2">Step 1: Copy your verification code</p>
                <div
                  onClick={copyCode}
                  className="bg-pump-dark rounded-lg p-4 border border-pump-border flex items-center justify-between cursor-pointer hover:border-pump-green transition-colors"
                >
                  <code className="text-pump-green text-lg font-mono select-all">
                    {claimData.verificationCode}
                  </code>
                  <span className="text-pump-gray text-xs ml-3">
                    {copied ? "Copied!" : "Click to copy"}
                  </span>
                </div>
              </div>

              {platform === "INSTAGRAM" ? (
                <>
                  <div>
                    <p className="text-pump-light text-sm font-medium mb-1">Step 2: Add the code to your Instagram bio</p>
                    <p className="text-pump-gray text-xs">
                      Go to your Instagram profile, tap &quot;Edit Profile&quot;, and paste the code anywhere in your bio.
                      You can remove it after verification is complete.
                    </p>
                  </div>
                  <div>
                    <p className="text-pump-light text-sm font-medium mb-1">Step 3: Click verify below</p>
                    <p className="text-pump-gray text-xs">
                      We&apos;ll check your public Instagram bio for the code.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-pump-light text-sm font-medium mb-1">Step 2: Post it from your account</p>
                    <p className="text-pump-gray text-xs">
                      {platform === "TWITTER"
                        ? "Post a tweet containing this code from your account. It must be public."
                        : "Post a TikTok video with this code in the caption. It must be public."
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-pump-light text-sm font-medium mb-1">Step 3: Paste the post link below</p>
                    <p className="text-pump-gray text-xs mb-2">
                      e.g. {currentPlatform.postExample}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {platform !== "INSTAGRAM" && (
            <div>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="Paste your post URL here..."
                className={inputClasses}
              />
            </div>
          )}

          <button
            onClick={() => { setStep("verify"); verify(); }}
            disabled={loading || (platform !== "INSTAGRAM" && !postUrl)}
            className="w-full bg-pump-green hover:bg-pump-green-dim disabled:opacity-50 text-black py-3 rounded-xl font-semibold transition-all"
          >
            {loading ? "Verifying..." : "Verify & Claim"}
          </button>

          <button
            onClick={() => { setStep("search"); setClaimData(null); setError(""); setPostUrl(""); }}
            className="w-full text-pump-gray hover:text-pump-light text-sm transition-colors"
          >
            Go back
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="bg-pump-dark rounded-lg p-3 border border-pump-border">
            <p className="text-pump-gray text-xs">
              <span className="text-pump-green font-medium">Why is this secure?</span>{" "}
              {platform === "INSTAGRAM"
                ? "Only you can edit your Instagram bio. We check your public profile for the verification code."
                : "Only you can create posts from your account. We verify the post URL belongs to your handle and contains your unique code."
              }{" "}
              Your claim session doesn&apos;t expire — take your time.
            </p>
          </div>
        </div>
      )}

      {/* Step 2b: Verifying state */}
      {step === "verify" && (
        <div className="space-y-5">
          <div className="bg-pump-card rounded-xl p-8 border border-pump-border text-center">
            <div className="inline-block w-8 h-8 border-2 border-pump-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-pump-light font-medium">Verifying your post...</p>
            <p className="text-pump-gray text-sm mt-2">Checking that your post contains the code and belongs to your account.</p>
          </div>

          {error && (
            <div className="space-y-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => { setStep("post"); setError(""); }}
                className="w-full border border-pump-border hover:border-pump-green text-pump-light py-2 rounded-lg text-sm transition-all"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Success */}
      {step === "success" && walletData && (
        <div className="space-y-5">
          <div className="bg-pump-green/10 border border-pump-green/30 rounded-xl p-5">
            <p className="text-pump-green font-bold text-lg mb-1">Claimed!</p>
            <p className="text-pump-light text-sm">
              You now own the creator wallet for {walletData.tokenName} ({walletData.tokenSymbol}).
            </p>
          </div>

          <div className="bg-pump-card rounded-xl p-5 border border-pump-border space-y-4">
            <div>
              <p className="text-pump-gray text-xs uppercase tracking-wide mb-1">Public Key</p>
              <code className="text-sm text-pump-light break-all select-all">{walletData.publicKey}</code>
            </div>
            <div>
              <p className="text-pump-gray text-xs uppercase tracking-wide mb-1">Private Key</p>
              {showPrivateKey ? (
                <div className="space-y-2">
                  <code className="text-sm text-yellow-400 break-all select-all block">{walletData.privateKey}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(walletData.privateKey);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-xs text-pump-gray hover:text-pump-light transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPrivateKey(true)}
                  className="text-pump-green text-sm hover:underline"
                >
                  Click to reveal (keep this secret!)
                </button>
              )}
            </div>
            <div>
              <p className="text-pump-gray text-xs uppercase tracking-wide mb-1">Token</p>
              <a
                href={`https://pump.fun/coin/${walletData.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pump-green text-sm hover:underline"
              >
                View on pump.fun
              </a>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
            <p className="text-yellow-400 text-sm font-medium">
              Import this private key into Phantom or Solflare to access your creator fees.
              Never share your private key with anyone. You can now remove the verification post.
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
