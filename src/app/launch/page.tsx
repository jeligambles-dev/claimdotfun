"use client";

import { useState, useRef } from "react";
import { Transaction } from "@solana/web3.js";
import { useWallet } from "@/components/WalletConnect";

const PLATFORMS = [
  { value: "TWITTER", label: "Twitter / X", placeholder: "@elonmusk" },
  { value: "INSTAGRAM", label: "Instagram", placeholder: "@instagram" },
  { value: "TIKTOK", label: "TikTok", placeholder: "@charlidamelio" },
];

export default function LaunchPage() {
  const { connected, publicKey, connect } = useWallet();
  const [platform, setPlatform] = useState("TWITTER");
  const [socialHandle, setSocialHandle] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialBuySOL, setInitialBuySOL] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ success?: boolean; error?: string; mintAddress?: string; signature?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setResult({ error: "Image must be under 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setImageDataUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = async () => {
    if (!connected || !publicKey) {
      connect();
      return;
    }

    const w = window as unknown as {
      phantom?: { solana?: { signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }> } };
      solana?: { signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }> };
    };
    const solana = w.phantom?.solana || w.solana;
    if (!solana) {
      setResult({ error: "Phantom wallet not found. Please install Phantom." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Step 1: Prepare — upload metadata, build funding tx
      setStatus("Uploading metadata...");
      const prepareRes = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          symbol: symbol.toUpperCase(),
          description: description || `Token for @${socialHandle}`,
          platform,
          socialHandle,
          launcherWallet: publicKey,
          initialBuySOL: parseFloat(initialBuySOL) || 0,
          imageData: imageDataUrl || undefined,
        }),
      });

      const prepareData = await prepareRes.json();
      if (!prepareRes.ok) {
        setResult({ error: prepareData.error });
        return;
      }

      // Step 2: Phantom signs and sends funding tx (~0.03 SOL + initial buy)
      setStatus(`Approve funding (${prepareData.fundingAmountSOL} SOL)...`);
      const fundingBytes = Uint8Array.from(atob(prepareData.fundingTransaction), (c) => c.charCodeAt(0));
      const fundingTx = Transaction.from(fundingBytes);
      await solana.signAndSendTransaction(fundingTx);

      // Wait for funding to confirm
      setStatus("Confirming funding...");
      await new Promise((r) => setTimeout(r, 8000));

      // Step 3: Server creates the token with the funded creator wallet
      setStatus("Creating token on pump.fun...");
      let execData;
      let execOk = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const execRes = await fetch("/api/launch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: "execute",
            tokenId: prepareData.tokenId,
            name,
            symbol: symbol.toUpperCase(),
            metadataUri: prepareData.metadataUri,
            encryptedPrivateKey: prepareData.encryptedPrivateKey,
            mintKeypairSecret: prepareData.mintKeypairSecret,
          }),
        });

        execData = await execRes.json();
        if (execRes.ok) {
          execOk = true;
          break;
        }

        // If it failed due to insufficient funds, wait and retry
        if (attempt < 2 && execData.error?.includes("insufficient")) {
          setStatus(`Waiting for funding confirmation (attempt ${attempt + 2}/3)...`);
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
        break;
      }

      if (!execOk) {
        setResult({ error: execData?.error || "Failed to create token" });
        return;
      }

      setResult({ success: true, mintAddress: execData.mintAddress, signature: execData.signature });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed or was rejected.";
      setResult({ error: message });
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const inputClasses = "w-full bg-pump-card border border-pump-border rounded-lg px-4 py-2.5 text-pump-light placeholder-pump-gray focus:outline-none focus:border-pump-green transition-colors";

  return (
    <div className="max-w-5xl mx-auto flex gap-10">
      {/* Left side: Visual explainer */}
      <div className="hidden lg:block w-80 flex-shrink-0 pt-2">
        <div className="sticky top-24 space-y-5">
          {/* What happens when you launch */}
          <div className="bg-pump-card border border-pump-border rounded-2xl p-5">
            <h3 className="text-pump-green font-bold text-sm mb-4">What happens when you launch</h3>

            {/* Step flow */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-pump-green text-black flex items-center justify-center text-[10px] font-black">1</div>
                  <div className="w-px flex-1 bg-pump-border mt-1" />
                </div>
                <div className="pb-3">
                  <div className="text-pump-light text-xs font-medium">Creator wallet generated</div>
                  <div className="text-pump-gray text-[10px] mt-0.5">A new Solana keypair is created and encrypted</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-pump-green text-black flex items-center justify-center text-[10px] font-black">2</div>
                  <div className="w-px flex-1 bg-pump-border mt-1" />
                </div>
                <div className="pb-3">
                  <div className="text-pump-light text-xs font-medium">Token deployed to pump.fun</div>
                  <div className="text-pump-gray text-[10px] mt-0.5">Bonding curve goes live, trading starts immediately</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-pump-green text-black flex items-center justify-center text-[10px] font-black">3</div>
                  <div className="w-px flex-1 bg-pump-border mt-1" />
                </div>
                <div className="pb-3">
                  <div className="text-pump-light text-xs font-medium">Fees route to creator wallet</div>
                  <div className="text-pump-gray text-[10px] mt-0.5">0.3% of every trade accrues automatically</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-pump-green/30 border border-pump-green text-pump-green flex items-center justify-center text-[10px] font-black">4</div>
                </div>
                <div>
                  <div className="text-pump-light text-xs font-medium">Creator claims via social proof</div>
                  <div className="text-pump-gray text-[10px] mt-0.5">They verify ownership and get the private key</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live preview mockup */}
          <div className="bg-pump-card border border-pump-border rounded-2xl p-5">
            <h3 className="text-pump-gray text-xs uppercase tracking-widest mb-3">Preview</h3>
            <div className="bg-pump-dark rounded-xl p-4 border border-pump-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-pump-green/20 border border-pump-green/30 flex items-center justify-center text-pump-green text-xs font-bold">
                  {symbol ? symbol.slice(0, 2).toUpperCase() : "??"}
                </div>
                <div>
                  <div className="text-pump-light text-sm font-semibold">{name || "Token Name"}</div>
                  <div className="text-pump-gray text-xs">${symbol ? symbol.toUpperCase() : "SYMBOL"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  platform === "TWITTER" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                  platform === "INSTAGRAM" ? "bg-pink-500/20 text-pink-400 border-pink-500/30" :
                  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                }`}>
                  {platform.toLowerCase()}
                </span>
                <span className="text-pump-gray text-xs">@{socialHandle || "handle"}</span>
              </div>
              <p className="text-pump-gray text-[10px] leading-relaxed">
                {description || "Token description will appear here..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 max-w-lg">
      <h1 className="text-3xl font-bold mb-2 text-pump-green">Launch a Token</h1>
      <p className="text-pump-gray mb-8">
        Create a pump.fun token and assign creator fees to a social media account.
      </p>

      <div className="space-y-5">
        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-pump-gray mb-2">Platform</label>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  platform === p.value
                    ? "bg-pump-green text-black"
                    : "bg-pump-card border border-pump-border text-pump-gray hover:border-pump-green"
                }`}
              >
                {p.value === "TWITTER" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                )}
                {p.value === "INSTAGRAM" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                )}
                {p.value === "TIKTOK" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.4a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.1l-.38.8z"/></svg>
                )}
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Social Handle */}
        <div>
          <label className="block text-sm font-medium text-pump-gray mb-1">Creator&apos;s Handle</label>
          <input
            type="text"
            value={socialHandle}
            onChange={(e) => setSocialHandle(e.target.value)}
            placeholder={PLATFORMS.find((p) => p.value === platform)?.placeholder}
            className={inputClasses}
          />
        </div>

        {/* Token Name */}
        <div>
          <label className="block text-sm font-medium text-pump-gray mb-1">Token Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Elon Coin"
            className={inputClasses}
          />
        </div>

        {/* Symbol */}
        <div>
          <label className="block text-sm font-medium text-pump-gray mb-1">Token Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. ELON"
            maxLength={10}
            className={inputClasses}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-pump-gray mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this token about?"
            rows={3}
            className={`${inputClasses} resize-none`}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-pump-gray mb-1">Token Image</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-pump-card border border-pump-border border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-pump-green transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Token preview" className="w-20 h-20 rounded-full mx-auto object-cover" />
            ) : (
              <div className="text-pump-gray text-sm">Click to upload image</div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Initial Buy */}
        <div>
          <label className="block text-sm font-medium text-pump-gray mb-1">Initial Buy (SOL) — optional</label>
          <input
            type="number"
            value={initialBuySOL}
            onChange={(e) => setInitialBuySOL(e.target.value)}
            placeholder="0"
            step="0.01"
            min="0"
            className={inputClasses}
          />
        </div>

        {/* Launch Button - always clickable, prompts wallet if not connected */}
        <button
          onClick={handleLaunch}
          disabled={loading || !name || !symbol || !socialHandle}
          className="w-full bg-pump-green hover:bg-pump-green-dim disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 rounded-xl font-semibold text-lg transition-all"
        >
          {loading ? (status || "Launching...") : !connected ? "Connect Wallet & Launch" : "Launch Token"}
        </button>

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-lg ${result.success ? "bg-pump-green/10 border border-pump-green/30" : "bg-red-900/30 border border-red-800"}`}>
            {result.success ? (
              <div>
                <p className="text-pump-green font-medium">Token launched successfully!</p>
                <p className="text-sm text-pump-gray mt-1">
                  Mint: <code className="text-pump-light">{result.mintAddress}</code>
                </p>
                <a
                  href={`https://pump.fun/coin/${result.mintAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pump-green text-sm hover:underline mt-1 inline-block"
                >
                  View on pump.fun
                </a>
              </div>
            ) : (
              <p className="text-red-400">{result.error}</p>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
