"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ActiveClaim {
  createdAt: string;
}

interface TokenData {
  id: string;
  mintAddress: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  platform: string;
  socialHandle: string;
  creatorPublicKey: string;
  launcherWallet: string;
  claimStatus: string;
  claimedAt: string | null;
  totalFeesEarned: number;
  createdAt: string;
  activeClaim: ActiveClaim | null;
}

const platformColors: Record<string, string> = {
  TWITTER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  INSTAGRAM: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  TIKTOK: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const platformIcons: Record<string, React.ReactNode> = {
  TWITTER: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  INSTAGRAM: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  TIKTOK: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.4a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.1l-.38.8z" />
    </svg>
  ),
};

const platformProfileUrls: Record<string, (handle: string) => string> = {
  TWITTER: (h) => `https://x.com/${h}`,
  INSTAGRAM: (h) => `https://instagram.com/${h}`,
  TIKTOK: (h) => `https://tiktok.com/@${h}`,
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const statusColors: Record<string, string> = {
  UNCLAIMED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  PENDING: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  CLAIMED: "bg-pump-green/15 text-pump-green border-pump-green/30",
};

function TokenImage({ token }: { token: TokenData }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (token.imageUrl && token.imageUrl !== "(uploaded)" && token.imageUrl.startsWith("http")) {
      setSrc(token.imageUrl);
    } else {
      setSrc(`https://pump.fun/coin/${token.mintAddress}/image`);
    }
  }, [token]);

  if (failed || !src) {
    return (
      <div className="w-12 h-12 rounded-xl bg-pump-dark border border-pump-border flex items-center justify-center text-pump-green text-sm font-bold flex-shrink-0">
        {token.symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={token.name}
      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

function SocialHoverCard({ platform, handle, children }: { platform: string; handle: string; children: React.ReactNode }) {
  const [showCard, setShowCard] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const profileUrl = platformProfileUrls[platform]?.(handle) || "#";
  const icon = platformIcons[platform];
  const colorClass = platform === "TWITTER" ? "text-blue-400" : platform === "INSTAGRAM" ? "text-pink-400" : "text-cyan-400";
  const bgClass = platform === "TWITTER" ? "border-blue-500/30" : platform === "INSTAGRAM" ? "border-pink-500/30" : "border-cyan-500/30";

  useEffect(() => {
    setAvatarUrl(`/api/social-avatar?platform=${platform}&handle=${encodeURIComponent(handle)}`);
  }, [platform, handle]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowCard(true)}
      onMouseLeave={() => setShowCard(false)}
    >
      {children}
      {showCard && (
        <div className={`absolute z-50 bottom-full left-0 mb-2 w-64 bg-pump-card border ${bgClass} rounded-xl shadow-2xl shadow-black/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200`}>
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt={`@${handle}`}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div className={`w-10 h-10 rounded-full bg-pump-dark border border-pump-border flex items-center justify-center ${colorClass}`}>
                {icon}
              </div>
            )}
            <div>
              <p className="text-pump-light font-semibold text-sm">@{handle}</p>
              <p className="text-pump-gray text-xs capitalize">{platform.toLowerCase()}</p>
            </div>
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium border ${bgClass} ${colorClass} hover:bg-pump-dark transition-colors`}
          >
            {icon}
            <span>View Profile</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-pump-card border-b border-r border-pump-border rotate-45" />
        </div>
      )}
    </div>
  );
}

function ClaimingBadge({ activeClaim, platform, handle }: { activeClaim: ActiveClaim; platform: string; handle: string }) {
  const [showCard, setShowCard] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowCard(true)}
      onMouseLeave={() => setShowCard(false)}
    >
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-orange-500/15 text-orange-400 border-orange-500/30 cursor-default">
        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        claiming
      </div>
      {showCard && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-56 bg-pump-card border border-orange-500/30 rounded-xl shadow-2xl shadow-black/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 text-xs font-semibold">Active Claim Session</span>
          </div>
          <p className="text-pump-gray text-xs">
            Someone is verifying ownership of <span className="text-pump-light font-medium">@{handle}</span> on {platform.toLowerCase()}.
          </p>
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-pump-card border-b border-r border-orange-500/30 rotate-45" />
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-pump-gray hover:text-pump-light transition-colors ml-1 inline-flex items-center"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTokens = useCallback(() => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (search) params.set("search", search);

    fetch(`/api/tokens?${params}`)
      .then((res) => res.json())
      .then((data) => setTokens(data.tokens || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => {
    fetchTokens();
    // Refresh every 30s to keep claim timers in sync
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, [fetchTokens]);

  const claimedTokens = tokens.filter((t) => t.claimStatus === "CLAIMED");

  return (
    <div className="min-h-screen">
      {/* Header with pill gradient background */}
      <div className="relative mb-8 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pump-teal/10 to-pump-green/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pump-dark/80" />
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pump-teal to-pump-green bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-pump-gray mt-1">All launched tokens and claims</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <svg className="w-4 h-4 text-pump-gray absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tokens..."
                  className="bg-pump-dark border border-pump-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-pump-light placeholder-pump-gray focus:outline-none focus:border-pump-green transition-colors w-48"
                />
              </div>
              <div className="flex gap-2">
                {["all", "CLAIMED", "UNCLAIMED"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? "bg-gradient-to-r from-pump-teal to-pump-green text-black"
                        : "bg-pump-card border border-pump-border text-pump-gray hover:border-pump-green"
                    }`}
                  >
                    {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-pump-card/80 backdrop-blur rounded-xl p-5 border border-pump-border">
              <p className="text-pump-gray text-sm">Total Tokens</p>
              <p className="text-2xl font-bold text-pump-light">{tokens.length}</p>
            </div>
            <div className="bg-pump-card/80 backdrop-blur rounded-xl p-5 border border-pump-border">
              <p className="text-pump-gray text-sm">Claimed</p>
              <p className="text-2xl font-bold text-pump-green">{claimedTokens.length}</p>
            </div>
            <div className="bg-pump-card/80 backdrop-blur rounded-xl p-5 border border-pump-border">
              <p className="text-pump-gray text-sm">Unclaimed</p>
              <p className="text-2xl font-bold text-yellow-400">{tokens.length - claimedTokens.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Token List */}
      {loading ? (
        <div className="text-center text-pump-gray py-12">Loading...</div>
      ) : tokens.length === 0 ? (
        <div className="text-center text-pump-gray py-12">No tokens launched yet</div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.id}
              onClick={() => router.push(`/token/${token.id}`)}
              className="bg-pump-card rounded-xl p-5 border border-pump-border hover:border-pump-green/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TokenImage token={token} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-pump-light">{token.name}</span>
                      <span className="text-pump-gray text-sm">${token.symbol}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${platformColors[token.platform]}`}>
                        {platformIcons[token.platform]}
                        {token.platform.toLowerCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[token.claimStatus]}`}>
                        {token.claimStatus.toLowerCase()}
                      </span>
                      {token.activeClaim && (
                        <ClaimingBadge
                          activeClaim={token.activeClaim}
                          platform={token.platform}
                          handle={token.socialHandle}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <SocialHoverCard platform={token.platform} handle={token.socialHandle}>
                        <span className="text-pump-gray text-sm hover:text-pump-light cursor-pointer transition-colors underline decoration-dotted underline-offset-2">
                          @{token.socialHandle}
                        </span>
                      </SocialHoverCard>
                      {token.totalFeesEarned > 0 && (
                        <span className="text-pump-green text-xs font-medium">
                          {token.totalFeesEarned.toFixed(2)} SOL earned
                        </span>
                      )}
                      <span className="text-pump-gray text-xs">
                        Launched {timeAgo(token.createdAt)}
                      </span>
                      {token.claimedAt && (
                        <span className="text-pump-green/70 text-xs">
                          Claimed {timeAgo(token.claimedAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-pump-gray text-xs">Mint:</span>
                      <a
                        href={`https://pump.fun/coin/${token.mintAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pump-green/70 hover:text-pump-green text-xs font-mono transition-colors"
                      >
                        {token.mintAddress}
                      </a>
                      <CopyButton text={token.mintAddress} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-pump-gray text-xs">Claimer:</span>
                      <a
                        href={`https://solscan.io/account/${token.creatorPublicKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pump-gray/70 hover:text-pump-light text-xs font-mono transition-colors"
                      >
                        {token.creatorPublicKey}
                      </a>
                      <CopyButton text={token.creatorPublicKey} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <a
                    href={`https://pump.fun/coin/${token.mintAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pump-green text-sm hover:underline whitespace-nowrap"
                  >
                    View on pump.fun
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
