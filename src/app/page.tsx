import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-[85vh]">
      {/* Hero */}
      <div className="text-center pt-16 pb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-pump-teal/5 to-pump-green/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative">
          <img src="/logo.png" alt="ClaimDotFun" className="w-40 h-40 rounded-3xl mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 bg-pump-card/80 border border-pump-border rounded-full px-4 py-1.5 mb-4">
            <span className="text-pump-gray text-xs">CA:</span>
            <span className="text-pump-green text-xs font-mono">{process.env.NEXT_PUBLIC_CA || "TBA"}</span>
          </div>
          <p className="text-pump-gray text-sm uppercase tracking-widest mb-4 font-medium">Powered by Pump.fun</p>
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-pump-light">Launch Tokens</span>
            <br />
            <span className="bg-gradient-to-r from-pump-teal to-pump-green bg-clip-text text-transparent">for Creators</span>
          </h1>
          <p className="text-pump-gray text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Assign pump.fun creator fees to any social media account.
            When they claim, they get the wallet.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/launch"
              className="bg-gradient-to-r from-pump-teal to-pump-green hover:from-pump-teal/90 hover:to-pump-green/90 text-black px-8 py-3.5 rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_30px_rgba(0,228,184,0.3)] hover:scale-105"
            >
              Launch a Token
            </Link>
            <Link
              href="/claim"
              className="border border-pump-border hover:border-pump-teal text-pump-light px-8 py-3.5 rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(0,228,184,0.1)]"
            >
              Claim Fees
            </Link>
          </div>
        </div>
      </div>

      {/* Supported Platforms */}
      <div className="w-full max-w-3xl mb-16">
        <p className="text-center text-pump-gray text-xs uppercase tracking-widest mb-6">Supported Platforms</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-pump-card border border-pump-border rounded-xl p-5 flex flex-col items-center gap-3 hover:border-blue-500/50 transition-all group">
            <svg className="w-8 h-8 text-pump-gray group-hover:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-pump-gray group-hover:text-blue-400 font-medium text-sm transition-colors">Twitter / X</span>
          </div>
          <div className="bg-pump-card border border-pump-border rounded-xl p-5 flex flex-col items-center gap-3 hover:border-pink-500/50 transition-all group">
            <svg className="w-8 h-8 text-pump-gray group-hover:text-pink-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <span className="text-pump-gray group-hover:text-pink-400 font-medium text-sm transition-colors">Instagram</span>
          </div>
          <div className="bg-pump-card border border-pump-border rounded-xl p-5 flex flex-col items-center gap-3 hover:border-cyan-500/50 transition-all group">
            <svg className="w-8 h-8 text-pump-gray group-hover:text-cyan-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-1-.08 6.28 6.28 0 00-6.28 6.28 6.28 6.28 0 006.28 6.28 6.28 6.28 0 006.28-6.28V8.69a8.16 8.16 0 004.74 1.52v-3.4a4.85 4.85 0 01-.71-.12z"/>
            </svg>
            <span className="text-pump-gray group-hover:text-cyan-400 font-medium text-sm transition-colors">TikTok</span>
          </div>
        </div>
      </div>

      {/* How It Works — Visual Steps */}
      <div className="w-full max-w-4xl mb-16">
        <p className="text-center text-pump-gray text-xs uppercase tracking-widest mb-8">How It Works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Step 1: Launch — mini UI mockup */}
          <div className="relative bg-pump-card rounded-2xl border border-pump-border hover:border-pump-green/30 transition-all group">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-pump-green text-black rounded-full flex items-center justify-center font-black text-sm z-10">1</div>
            {/* Mockup UI */}
            <div className="p-4 pt-5">
              <div className="bg-pump-dark rounded-lg p-3 border border-pump-border mb-2">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-14 h-5 rounded bg-pump-green/20 text-pump-green text-[10px] flex items-center justify-center font-medium">Twitter</div>
                  <div className="w-14 h-5 rounded bg-pump-border text-pump-gray text-[10px] flex items-center justify-center">Instagram</div>
                  <div className="w-14 h-5 rounded bg-pump-border text-pump-gray text-[10px] flex items-center justify-center">TikTok</div>
                </div>
                <div className="h-6 rounded bg-pump-border mb-1.5 flex items-center px-2">
                  <span className="text-pump-gray text-[10px]">@drake</span>
                </div>
                <div className="h-6 rounded bg-pump-border mb-1.5 flex items-center px-2">
                  <span className="text-pump-gray text-[10px]">Drake Coin</span>
                </div>
                <div className="h-6 rounded bg-pump-border mb-2 flex items-center px-2">
                  <span className="text-pump-gray text-[10px]">$DRAKE</span>
                </div>
                <div className="h-7 rounded-md bg-pump-green flex items-center justify-center">
                  <span className="text-black text-[10px] font-bold">Launch Token</span>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <h3 className="font-bold text-lg mb-2 text-pump-light group-hover:text-pump-green transition-colors">Launch</h3>
              <p className="text-pump-gray text-sm leading-relaxed">
                Pick a creator&apos;s handle, fill in token details, and deploy directly to pump.fun.
              </p>
            </div>
          </div>

          {/* Step 2: Fees Accrue — chart mockup */}
          <div className="relative bg-pump-card rounded-2xl border border-pump-border hover:border-pump-green/30 transition-all group">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-pump-green text-black rounded-full flex items-center justify-center font-black text-sm z-10">2</div>
            <div className="p-4 pt-5">
              <div className="bg-pump-dark rounded-lg p-3 border border-pump-border mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-pump-green/20 flex items-center justify-center text-pump-green text-[10px] font-bold">DK</div>
                  <div>
                    <div className="text-pump-light text-[11px] font-medium">Drake Coin</div>
                    <div className="text-pump-gray text-[9px]">@drake &middot; twitter</div>
                  </div>
                </div>
                {/* Mini chart bars */}
                <div className="flex items-end gap-1 h-12 mb-2">
                  <div className="flex-1 bg-pump-green/20 rounded-sm" style={{height: "30%"}} />
                  <div className="flex-1 bg-pump-green/30 rounded-sm" style={{height: "45%"}} />
                  <div className="flex-1 bg-pump-green/20 rounded-sm" style={{height: "35%"}} />
                  <div className="flex-1 bg-pump-green/40 rounded-sm" style={{height: "60%"}} />
                  <div className="flex-1 bg-pump-green/30 rounded-sm" style={{height: "50%"}} />
                  <div className="flex-1 bg-pump-green/50 rounded-sm" style={{height: "75%"}} />
                  <div className="flex-1 bg-pump-green/40 rounded-sm" style={{height: "65%"}} />
                  <div className="flex-1 bg-pump-green/60 rounded-sm" style={{height: "85%"}} />
                  <div className="flex-1 bg-pump-green rounded-sm" style={{height: "100%"}} />
                </div>
                <div className="flex justify-between">
                  <span className="text-pump-gray text-[9px]">Creator Fees</span>
                  <span className="text-pump-green text-[10px] font-bold">12.5 SOL</span>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <h3 className="font-bold text-lg mb-2 text-pump-light group-hover:text-pump-green transition-colors">Fees Accrue</h3>
              <p className="text-pump-gray text-sm leading-relaxed">
                100% of creator fees go to the wallet. They stack up, waiting to be claimed.
              </p>
            </div>
          </div>

          {/* Step 3: Claim — verification mockup */}
          <div className="relative bg-pump-card rounded-2xl border border-pump-border hover:border-pump-green/30 transition-all group">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-pump-green text-black rounded-full flex items-center justify-center font-black text-sm z-10">3</div>
            <div className="p-4 pt-5">
              <div className="bg-pump-dark rounded-lg p-3 border border-pump-border mb-2">
                <div className="text-pump-light text-[10px] font-medium mb-2">Verification Code:</div>
                <div className="bg-pump-card rounded p-2 mb-2 border border-pump-green/30">
                  <span className="text-pump-green text-[11px] font-mono">CLAIM_a8f2k9e1</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <div className="text-pump-gray text-[9px]">x.com/drake/status/18293...</div>
                </div>
                <div className="h-7 rounded-md bg-pump-green flex items-center justify-center">
                  <span className="text-black text-[10px] font-bold">Verify & Claim</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-pump-green text-[9px] font-medium">Wallet revealed!</span>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <h3 className="font-bold text-lg mb-2 text-pump-light group-hover:text-pump-green transition-colors">Claim</h3>
              <p className="text-pump-gray text-sm leading-relaxed">
                Post the code from your account, paste the link, and instantly receive your wallet private key.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Security Section */}
      <div className="w-full max-w-4xl mb-16">
        <p className="text-center text-pump-gray text-xs uppercase tracking-widest mb-8">Why It&apos;s Secure</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1: Post-Based Verification */}
          <div className="bg-pump-card border border-pump-border rounded-2xl hover:border-pump-green/30 transition-all group">
            <div className="p-4">
              <div className="bg-pump-dark rounded-lg p-3 border border-pump-border">
                {/* Mockup: URL being checked */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-pump-green/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <span className="text-pump-gray text-[10px]">Verifying post origin...</span>
                </div>
                <div className="bg-pump-card rounded p-2 border border-pump-border mb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-pump-gray text-[9px]">URL:</span>
                    <span className="text-blue-400 text-[9px]">x.com/</span>
                    <span className="text-pump-green text-[9px] font-bold">drake</span>
                    <span className="text-blue-400 text-[9px]">/status/182...</span>
                  </div>
                </div>
                <div className="bg-pump-card rounded p-2 border border-pump-border mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-pump-gray text-[9px]">Expected:</span>
                    <span className="text-pump-green text-[9px] font-bold">drake</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span className="text-pump-green text-[10px] font-medium">Username matches! Post is authentic.</span>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <h4 className="text-pump-light font-semibold mb-1 group-hover:text-pump-green transition-colors">Post-Based Verification</h4>
              <p className="text-pump-gray text-xs leading-relaxed">
                Only the real account owner can create a post from their handle. We verify the username in the URL matches.
              </p>
            </div>
          </div>

          {/* 2: Session-Locked Claims */}
          <div className="bg-pump-card border border-pump-border rounded-2xl hover:border-pump-green/30 transition-all group">
            <div className="p-4">
              <div className="bg-pump-dark rounded-lg p-3 border border-pump-border">
                {/* Mockup: two users, one blocked */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-pump-green/30 flex items-center justify-center text-[8px] text-pump-green font-bold">D</div>
                    <div className="flex-1">
                      <div className="text-pump-light text-[9px]">@drake starts claim</div>
                    </div>
                    <div className="bg-pump-green/10 border border-pump-green/30 rounded px-1.5 py-0.5">
                      <span className="text-pump-green text-[8px] font-mono">session: a8f2...</span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-pump-border" />
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center text-[8px] text-red-400 font-bold">A</div>
                    <div className="flex-1">
                      <div className="text-pump-gray text-[9px]">Attacker tries to verify</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5">
                      <span className="text-red-400 text-[8px] font-mono">no session</span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-pump-border" />
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                    <span className="text-red-400 text-[10px] font-medium">Blocked — invalid session</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <h4 className="text-pump-light font-semibold mb-1 group-hover:text-pump-green transition-colors">Session-Locked Claims</h4>
              <p className="text-pump-gray text-xs leading-relaxed">
                Each claim generates a secret tied to your browser. Even if someone sees the code, they can&apos;t claim without your session.
              </p>
            </div>
          </div>

          {/* 3: Encrypted Key Storage */}
          <div className="bg-pump-card border border-pump-border rounded-2xl hover:border-pump-green/30 transition-all group">
            <div className="p-4">
              <div className="bg-pump-dark rounded-lg p-3 border border-pump-border">
                {/* Mockup: encrypted vs decrypted key */}
                <div className="space-y-2">
                  <div>
                    <div className="text-pump-gray text-[9px] mb-1">Stored in database:</div>
                    <div className="bg-pump-card rounded p-2 border border-pump-border">
                      <div className="text-[9px] font-mono text-pump-gray break-all">U2FsdGVkX1+0eLX<span className="text-pump-border">...</span>R0wpw==</div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 text-pump-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      <span className="text-pump-green text-[8px]">AES-256 Encrypted</span>
                    </div>
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <div className="flex-1 h-px bg-pump-border" />
                    <span className="text-pump-gray text-[8px]">after verification</span>
                    <div className="flex-1 h-px bg-pump-border" />
                  </div>
                  <div>
                    <div className="text-pump-gray text-[9px] mb-1">Revealed to owner:</div>
                    <div className="bg-pump-card rounded p-2 border border-pump-green/30">
                      <div className="text-[9px] font-mono text-yellow-400 break-all">5Kd3nB<span className="text-pump-border">...</span>xP9mQ</div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      <span className="text-yellow-400 text-[8px]">Shown once, then cleared</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <h4 className="text-pump-light font-semibold mb-1 group-hover:text-pump-green transition-colors">Encrypted Key Storage</h4>
              <p className="text-pump-gray text-xs leading-relaxed">
                Private keys are AES-encrypted at rest. Decrypted only once during successful verification and never stored in plaintext.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Stats */}
      <div className="w-full max-w-3xl mb-16">
        <div className="bg-pump-card border border-pump-border rounded-2xl p-8 flex items-center justify-around">
          <div className="text-center">
            <div className="text-3xl font-black text-pump-green">100%</div>
            <div className="text-pump-gray text-xs mt-1">Creator Fees</div>
          </div>
          <div className="w-px h-12 bg-pump-border" />
          <div className="text-center">
            <div className="text-3xl font-black text-pump-light">3</div>
            <div className="text-pump-gray text-xs mt-1">Platforms</div>
          </div>
          <div className="w-px h-12 bg-pump-border" />
          <div className="text-center">
            <div className="text-3xl font-black text-pump-light">No Limit</div>
            <div className="text-pump-gray text-xs mt-1">To Claim</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-16">
        <Link
          href="/launch"
          className="inline-block bg-gradient-to-r from-pump-teal to-pump-green hover:from-pump-teal/90 hover:to-pump-green/90 text-black px-10 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_40px_rgba(0,228,184,0.25)] hover:scale-105"
        >
          Get Started
        </Link>
        <p className="text-pump-gray text-sm mt-4">No account needed. Just connect a wallet.</p>
        <div className="flex items-center gap-6 justify-center mt-6">
          <a
            href="https://github.com/jeligambles-dev/claimdotfun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pump-gray hover:text-pump-light transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-sm">GitHub</span>
          </a>
          <a
            href="https://x.com/claimdotfun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pump-gray hover:text-blue-400 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm">Twitter</span>
          </a>
        </div>
      </div>
    </div>
  );
}
