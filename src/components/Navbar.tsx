"use client";

import { useState } from "react";
import Link from "next/link";
import WalletButton from "./WalletConnect";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-pump-dark/90 backdrop-blur-sm border-b border-pump-border px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-pump-teal to-pump-green bg-clip-text text-transparent">
            ClaimDotFun
          </Link>
          <a
            href="https://x.com/claimdotfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pump-gray hover:text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/launch" className="text-pump-gray hover:text-pump-green transition-colors text-sm">
            Launch Token
          </Link>
          <Link href="/claim" className="text-pump-gray hover:text-pump-green transition-colors text-sm">
            Claim Fees
          </Link>
          <Link href="/dashboard" className="text-pump-gray hover:text-pump-green transition-colors text-sm">
            Dashboard
          </Link>
          <WalletButton />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-pump-gray hover:text-pump-green transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-4 pb-2 space-y-3 border-t border-pump-border pt-4">
          <Link href="/launch" onClick={() => setMobileOpen(false)} className="block text-pump-gray hover:text-pump-green transition-colors text-sm py-1">
            Launch Token
          </Link>
          <Link href="/claim" onClick={() => setMobileOpen(false)} className="block text-pump-gray hover:text-pump-green transition-colors text-sm py-1">
            Claim Fees
          </Link>
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-pump-gray hover:text-pump-green transition-colors text-sm py-1">
            Dashboard
          </Link>
          <div className="pt-2">
            <WalletButton />
          </div>
        </div>
      )}
    </nav>
  );
}
