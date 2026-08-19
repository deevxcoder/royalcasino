"use client";

import dynamic from "next/dynamic";

const LobbyContent = dynamic(
  () => import("@/components/LobbyContent").then((mod) => mod.LobbyContent),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#080b11] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
        <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
          Loading Royal Casino Lobby...
        </span>
      </div>
    ),
  }
);

export default function Page() {
  return <LobbyContent />;
}
