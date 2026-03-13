"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface TokenDetail {
  id: string;
  mintAddress: string;
  name: string;
  symbol: string;
  description: string | null;
  imageUrl: string | null;
  platform: string;
  socialHandle: string;
  creatorPublicKey: string;
  launcherWallet: string;
  claimStatus: string;
  claimedAt: string | null;
  claimedBy: string | null;
  totalFeesEarned: number;
  createdAt: string;
}

const platformColors: Record<string, string> = {
  TWITTER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  INSTAGRAM: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  TIKTOK: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const statusColors: Record<string, string> = {
  UNCLAIMED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  CLAIMED: "bg-pump-green/15 text-pump-green border-pump-green/30",
};

const platformProfileUrls: Record<string, (handle: string) => string> = {
  TWITTER: (h) => `https://x.com/${h}`,
  INSTAGRAM: (h) => `https://instagram.com/${h}`,
  TIKTOK: (h) => `https://tiktok.com/@${h}`,
};

function CopyField({ label, value, href }: { label: string; value: string; href?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-pump-dark rounded-lg p-3 border border-pump-border">
      <p className="text-pump-gray text-xs uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-pump-green text-sm font-mono break-all hover:underline flex-1">
            {value}
          </a>
        ) : (
          <span className="text-pump-light text-sm font-mono break-all flex-1">{value}</span>
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-pump-gray hover:text-pump-light transition-colors flex-shrink-0"
          title="Copy"
        >
          {copied ? (
            <svg className="w-4 h-4 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function TokenDetailPage() {
  const params = useParams();
  const [token, setToken] = useState<TokenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tokenId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    fetch(`/api/tokens/${tokenId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Token not found");
        return res.json();
      })
      .then((data) => setToken(data.token))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tokenId]);

  if (loading) {
    return <div className="text-center text-pump-gray py-20">Loading...</div>;
  }

  if (error || !token) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error || "Token not found"}</p>
        <Link href="/dashboard" className="text-pump-green hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const profileUrl = platformProfileUrls[token.platform]?.(token.socialHandle) || "#";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/dashboard" className="text-pump-gray hover:text-pump-green text-sm transition-colors mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-pump-card rounded-2xl border border-pump-border p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-pump-dark border border-pump-border flex items-center justify-center text-pump-green text-xl font-bold flex-shrink-0">
            {token.symbol.slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-pump-light">{token.name}</h1>
              <span className="text-pump-gray text-lg">${token.symbol}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${platformColors[token.platform]}`}>
                {token.platform.toLowerCase()}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[token.claimStatus]}`}>
                {token.claimStatus.toLowerCase()}
              </span>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pump-gray hover:text-pump-light text-sm transition-colors"
              >
                @{token.socialHandle}
              </a>
            </div>
            {token.description && (
              <p className="text-pump-gray text-sm mt-3">{token.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CopyField
          label="Mint Address"
          value={token.mintAddress}
          href={`https://pump.fun/coin/${token.mintAddress}`}
        />
        <CopyField
          label="Claimer Wallet"
          value={token.creatorPublicKey}
          href={`https://solscan.io/account/${token.creatorPublicKey}`}
        />
        <CopyField
          label="Launcher Wallet"
          value={token.launcherWallet}
          href={`https://solscan.io/account/${token.launcherWallet}`}
        />
        <div className="bg-pump-dark rounded-lg p-3 border border-pump-border">
          <p className="text-pump-gray text-xs uppercase tracking-wide mb-1">Fees Earned</p>
          <span className="text-pump-green text-sm font-bold">{token.totalFeesEarned.toFixed(4)} SOL</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-pump-card rounded-2xl border border-pump-border p-6 mb-6">
        <h3 className="text-pump-light font-semibold mb-4">Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pump-green text-black flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-pump-light text-sm">Token Launched</p>
              <p className="text-pump-gray text-xs">{new Date(token.createdAt).toLocaleString()}</p>
            </div>
          </div>
          {token.claimedAt && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pump-green text-black flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-pump-light text-sm">Claimed by @{token.claimedBy || token.socialHandle}</p>
                <p className="text-pump-gray text-xs">{new Date(token.claimedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          {!token.claimedAt && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pump-dark border border-yellow-500/30 text-yellow-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-yellow-400 text-sm">Awaiting Claim</p>
                <p className="text-pump-gray text-xs">Creator has not yet verified ownership</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <a
          href={`https://pump.fun/coin/${token.mintAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-pump-green hover:bg-pump-green-dim text-black py-3 rounded-xl font-semibold text-center transition-all"
        >
          View on pump.fun
        </a>
        {token.claimStatus === "UNCLAIMED" && (
          <Link
            href={`/claim?platform=${token.platform}&handle=${token.socialHandle}`}
            className="flex-1 border border-pump-green text-pump-green hover:bg-pump-green/10 py-3 rounded-xl font-semibold text-center transition-all"
          >
            Claim This Token
          </Link>
        )}
      </div>
    </div>
  );
}
