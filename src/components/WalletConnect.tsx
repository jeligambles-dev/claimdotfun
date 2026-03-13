"use client";

import { useState, useEffect } from "react";

interface WalletState {
  connected: boolean;
  publicKey: string | null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, publicKey: null });

  const getProvider = () => {
    const w = window as unknown as {
      phantom?: { solana?: { isPhantom?: boolean; connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }> } };
      solana?: { isPhantom?: boolean; connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }> };
    };
    return w.phantom?.solana || w.solana;
  };

  const connect = async () => {
    try {
      const provider = getProvider();
      if (!provider?.isPhantom) {
        window.open("https://phantom.app/", "_blank");
        return;
      }
      const response = await provider.connect();
      setWallet({ connected: true, publicKey: response.publicKey.toString() });
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnect = async () => {
    try {
      const provider = getProvider();
      if (provider && 'disconnect' in provider) {
        await (provider as unknown as { disconnect: () => Promise<void> }).disconnect();
      }
    } catch { /* ignore */ }
    setWallet({ connected: false, publicKey: null });
  };

  useEffect(() => {
    const provider = getProvider();
    if (provider?.isPhantom) {
      provider.connect({ onlyIfTrusted: true }).then((resp) => {
        setWallet({ connected: true, publicKey: resp.publicKey.toString() });
      }).catch(() => {});
    }
  }, []);

  return { ...wallet, connect, disconnect };
}

export default function WalletButton() {
  const { connected, publicKey, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);

  if (connected && publicKey) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-pump-card border border-pump-green text-pump-green px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-pump-green/10"
        >
          <div className="w-2 h-2 rounded-full bg-pump-green" />
          {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
          <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-pump-card border border-pump-border rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-pump-border">
                <p className="text-pump-gray text-xs mb-1">Connected Wallet</p>
                <p className="text-pump-light text-xs font-mono break-all">{publicKey}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicKey);
                  setOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-pump-gray hover:text-pump-light hover:bg-pump-dark transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Address
              </button>
              <button
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="bg-gradient-to-r from-pump-teal to-pump-green hover:from-pump-teal/90 hover:to-pump-green/90 text-black px-6 py-2 rounded-lg font-medium transition-all"
    >
      Connect Wallet
    </button>
  );
}
