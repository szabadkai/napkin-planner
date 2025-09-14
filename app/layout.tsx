import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Napkin Planner ✨",
  description: "Bounce business ideas and get a 1‑page napkin plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen relative text-slate-800">
        {/* Modern gradient background */}
        <div className="fixed inset-0 bg-mesh-gradient opacity-60" />
        <div className="fixed inset-0 bg-dot-grid" />
        
        {/* Floating orbs */}
        <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-500/30 blur-3xl float-animation" />
        <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl float-animation" style={{ animationDelay: '1s' }} />
        <div className="pointer-events-none fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl float-animation" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-4xl mx-auto px-6 py-12">{children}</div>
      </body>
    </html>
  );
}
