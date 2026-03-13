import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClaimDotFun — Launch Tokens for Creators",
  description: "Launch pump.fun tokens assigned to social media creators. Fees go to the creator when they claim.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-pump-light min-h-screen`}>
        <ToastProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-pump-dark rounded-2xl p-6 md:p-8 min-h-[80vh]">
              {children}
            </div>
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
