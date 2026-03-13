"use client";

import { useState, useEffect, useCallback } from "react";

interface Token {
  id: string;
  mintAddress: string;
  name: string;
  symbol: string;
  platform: string;
  socialHandle: string;
  creatorPublicKey: string;
  encryptedPrivateKey: string;
  launcherWallet: string;
  claimStatus: string;
  claimedAt: string | null;
  totalFeesEarned: number;
  createdAt: string;
}

interface Claim {
  id: string;
  tokenId: string;
  platform: string;
  socialHandle: string;
  verificationCode: string;
  verified: boolean;
  verifiedAt: string | null;
  destinationWallet: string | null;
  createdAt: string;
}

interface Stats {
  totalTokens: number;
  claimedTokens: number;
  unclaimedTokens: number;
  totalClaims: number;
  verifiedClaims: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<"stats" | "tokens" | "claims">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const headers = { "x-admin-password": password };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tokensRes, claimsRes] = await Promise.all([
        fetch("/api/admin?action=stats", { headers }),
        fetch("/api/admin?action=tokens", { headers }),
        fetch("/api/admin?action=claims", { headers }),
      ]);
      if (!statsRes.ok) {
        setAuthed(false);
        setAuthError("Session expired");
        return;
      }
      const statsData = await statsRes.json();
      const tokensData = await tokensRes.json();
      const claimsData = await claimsRes.json();
      setStats(statsData.stats);
      setTokens(tokensData.tokens || []);
      setClaims(claimsData.claims || []);
    } catch {
      setMessage("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [password]);

  const handleLogin = async () => {
    setAuthError("");
    const res = await fetch("/api/admin?action=stats", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthed(true);
      fetchData();
    } else {
      setAuthError("Wrong password");
    }
  };

  const handleDelete = async (type: string, id: string, label: string) => {
    if (!confirm(`Delete ${type}: ${label}?`)) return;
    const res = await fetch(`/api/admin?type=${type}&id=${id}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchData();
  };

  useEffect(() => {
    if (authed) fetchData();
  }, [authed, fetchData]);

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto pt-20">
        <h1 className="text-2xl font-bold text-pump-green mb-6 text-center">Admin Panel</h1>
        <div className="bg-pump-card border border-pump-border rounded-xl p-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin password"
            className="w-full bg-pump-dark border border-pump-border rounded-lg px-4 py-2.5 text-pump-light placeholder-pump-gray focus:outline-none focus:border-pump-green transition-colors"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-pump-green hover:bg-pump-green-dim text-black py-2.5 rounded-lg font-semibold transition-all"
          >
            Login
          </button>
          {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-pump-green">Admin Panel</h1>
        <button
          onClick={() => { setAuthed(false); setPassword(""); }}
          className="text-pump-gray hover:text-red-400 text-sm transition-colors"
        >
          Logout
        </button>
      </div>

      {message && (
        <div className="bg-pump-green/10 border border-pump-green/30 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-pump-green text-sm">{message}</span>
          <button onClick={() => setMessage("")} className="text-pump-gray hover:text-pump-light text-xs">dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["stats", "tokens", "claims"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? "bg-pump-green text-black"
                : "bg-pump-card border border-pump-border text-pump-gray hover:border-pump-green"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={fetchData}
          disabled={loading}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-pump-card border border-pump-border text-pump-gray hover:border-pump-green transition-all"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Stats Tab */}
      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-pump-card border border-pump-border rounded-xl p-4">
            <p className="text-pump-gray text-xs">Total Tokens</p>
            <p className="text-2xl font-bold text-pump-light">{stats.totalTokens}</p>
          </div>
          <div className="bg-pump-card border border-pump-border rounded-xl p-4">
            <p className="text-pump-gray text-xs">Claimed</p>
            <p className="text-2xl font-bold text-pump-green">{stats.claimedTokens}</p>
          </div>
          <div className="bg-pump-card border border-pump-border rounded-xl p-4">
            <p className="text-pump-gray text-xs">Unclaimed</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.unclaimedTokens}</p>
          </div>
          <div className="bg-pump-card border border-pump-border rounded-xl p-4">
            <p className="text-pump-gray text-xs">Total Claims</p>
            <p className="text-2xl font-bold text-pump-light">{stats.totalClaims}</p>
          </div>
          <div className="bg-pump-card border border-pump-border rounded-xl p-4">
            <p className="text-pump-gray text-xs">Verified Claims</p>
            <p className="text-2xl font-bold text-pump-green">{stats.verifiedClaims}</p>
          </div>
        </div>
      )}

      {/* Tokens Tab */}
      {tab === "tokens" && (
        <div className="space-y-2">
          {tokens.length === 0 ? (
            <p className="text-pump-gray text-center py-8">No tokens</p>
          ) : tokens.map((t) => (
            <div key={t.id} className="bg-pump-card border border-pump-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-pump-light font-semibold">{t.name}</span>
                  <span className="text-pump-gray text-sm">${t.symbol}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    t.claimStatus === "CLAIMED" ? "bg-pump-green/15 text-pump-green border-pump-green/30" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                  }`}>
                    {t.claimStatus.toLowerCase()}
                  </span>
                  <span className="text-pump-gray text-xs">{t.platform.toLowerCase()}</span>
                </div>
                <div className="text-pump-gray text-xs mt-1">
                  @{t.socialHandle} &middot; {t.mintAddress.slice(0, 16)}... &middot; {new Date(t.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete("token", t.id, `${t.name} ($${t.symbol})`)}
                className="ml-4 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Claims Tab */}
      {tab === "claims" && (
        <div className="space-y-2">
          {claims.length === 0 ? (
            <p className="text-pump-gray text-center py-8">No claims</p>
          ) : claims.map((c) => (
            <div key={c.id} className="bg-pump-card border border-pump-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-pump-green text-xs font-mono">{c.verificationCode}</code>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    c.verified ? "bg-pump-green/15 text-pump-green border-pump-green/30" : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                  }`}>
                    {c.verified ? "verified" : "pending"}
                  </span>
                  <span className="text-pump-gray text-xs">{c.platform.toLowerCase()}</span>
                </div>
                <div className="text-pump-gray text-xs mt-1">
                  @{c.socialHandle} &middot; token: {c.tokenId.slice(0, 12)}... &middot; {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete("claim", c.id, c.verificationCode)}
                className="ml-4 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
