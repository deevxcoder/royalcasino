"use client";

import React, { useState } from "react";
import { Play, Sparkles, Flame } from "lucide-react";
import { Game } from "@/lib/types";

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const [imgError, setImgError] = useState(false);

  // Determine fallback badge color based on provider
  const getGradient = () => {
    const p = (game.provider || "").toLowerCase();
    const uid = (game.game_uid || "").toLowerCase();
    if (uid.includes("coinflip")) return "from-amber-600/70 via-yellow-700/50 to-slate-900";
    if (uid.includes("andarbahar")) return "from-emerald-700/70 via-green-900/50 to-slate-900";
    if (uid.includes("chickencross")) return "from-yellow-600/70 via-amber-800/50 to-slate-900";
    if (p.includes("royal")) return "from-amber-800/60 to-purple-950/60";
    if (p.includes("spribe")) return "from-red-900/60 to-amber-900/40";
    if (p.includes("pragmatic")) return "from-amber-900/60 to-yellow-900/40";
    if (p.includes("smartsoft")) return "from-purple-900/60 to-indigo-900/40";
    return "from-slate-800 to-slate-900";
  };

  const isAviator = game.name.toLowerCase().includes("aviator");
  const isRoyal = (game.provider || "").toLowerCase().includes("royal") || (game.game_uid || "").startsWith("royal_");

  const getRoyalIcon = () => {
    if (game.game_uid === "royal_coinflip") return "🪙";
    if (game.game_uid === "royal_andarbahar") return "🎴";
    if (game.game_uid === "royal_chickencross") return "🐔";
    return "👑";
  };

  return (
    <div
      onClick={() => onPlay(game)}
      className="group relative cursor-pointer rounded-2xl overflow-hidden bg-casino-card border border-casino-border hover:border-amber-500/60 shadow-lg hover:shadow-gold-glow transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Game Thumbnail */}
      <div className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${getGradient()} flex items-center justify-center p-2`}>
        {isRoyal ? (
          <div className="flex flex-col items-center justify-center text-center p-2 space-y-1">
            <span className="text-4xl sm:text-5xl filter drop-shadow-lg transform group-hover:scale-115 transition-transform duration-300">
              {getRoyalIcon()}
            </span>
            <span className="font-black text-xs text-white uppercase tracking-wider line-clamp-1 drop-shadow">
              {game.name}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/50 text-amber-300 font-black">
              ORIGINAL
            </span>
          </div>
        ) : game.logo && !imgError ? (
          <img
            src={game.logo}
            alt={game.name}
            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-108"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <span className="font-extrabold text-sm text-white line-clamp-2">
              {game.name}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {isAviator ? (
            <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3 fill-white" />
              HOT
            </span>
          ) : isRoyal ? (
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
              👑 ROYAL
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] font-bold uppercase tracking-wider border border-white/10">
              {game.category || "Slot"}
            </span>
          )}
        </div>

        {/* Hover Overlay with PLAY Button */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
          <div className="w-12 h-12 rounded-full theme-btn-accent text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider theme-text-accent">
            PLAY NOW
          </span>
        </div>
      </div>

      {/* Game Info Bottom */}
      <div className="p-3 bg-[#0d121c] border-t border-casino-border/50">
        <h4 className="font-bold text-sm text-gray-100 truncate group-hover:theme-text-accent transition-colors">
          {game.name}
        </h4>
        <p className="text-[11px] font-medium text-gray-400 truncate mt-0.5">
          {game.provider}
        </p>
      </div>
    </div>
  );
};
