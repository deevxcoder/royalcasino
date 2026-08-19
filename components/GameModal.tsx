"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2, RefreshCw, Wallet, Plus, AlertCircle, Sparkles } from "lucide-react";
import { Game } from "@/lib/types";
import { isRoyalGame } from "@/lib/royalGames";
import { CoinFlipGame } from "@/components/royal/CoinFlipGame";
import { AndarBaharGame } from "@/components/royal/AndarBaharGame";
import { ChickenCrossGame } from "@/components/royal/ChickenCrossGame";

interface GameModalProps {
  game: Game | null;
  launchUrl: string | null;
  loading: boolean;
  error: string | null;
  userBalance: number;
  onClose: () => void;
  onOpenDeposit: () => void;
  onRefreshBalance: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  game,
  launchUrl,
  loading,
  error,
  userBalance,
  onClose,
  onOpenDeposit,
  onRefreshBalance,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Poll player balance every 4 seconds while game is active to show live callback settlements
  useEffect(() => {
    if (!game) return;
    const interval = setInterval(() => {
      onRefreshBalance();
    }, 4000);
    return () => clearInterval(interval);
  }, [game, onRefreshBalance]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!game) return null;

  const isNativeRoyal = isRoyalGame(game.game_uid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl h-[92vh] max-h-[900px] flex flex-col bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Top Control & Status Bar */}
        <div className="h-14 px-4 bg-[#101522] border-b border-slate-800 flex items-center justify-between shrink-0">
          {/* Game Title & Provider */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">{game.name}</h3>
              <p className="text-[11px] text-amber-400 font-bold leading-tight">
                {isNativeRoyal ? "👑 Royal Studio (RGS)" : game.provider}
              </p>
            </div>
          </div>

          {/* Center Balance & Quick Deposit */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800 px-3 py-1.5 rounded-xl">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase font-bold text-gray-400 leading-none">Wallet</span>
                <span className="text-xs font-black text-emerald-400 leading-tight">
                  ₹{userBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={onRefreshBalance}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Sync Balance"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenDeposit}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Cash</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {launchUrl && (
              <a
                href={launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
                title="Open Game in New Tab"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Popout Tab</span>
              </a>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 hover:text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Exit to Lobby</span>
            </button>
          </div>
        </div>

        {/* Game Screen Container */}
        <div className="relative flex-1 w-full h-full bg-black overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
              <div className="w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
              <div>
                <h4 className="text-lg font-black text-white">Launching {game.name}...</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Connecting session to Royal B2B RGS Gateway...
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center max-w-md p-6 bg-[#161c2b] border border-rose-500/40 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Launch Notice</h4>
                <p className="text-xs text-rose-300 mt-1">{error}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenDeposit}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                >
                  Deposit Funds
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-gray-300 text-xs font-bold"
                >
                  Back to Lobby
                </button>
              </div>
            </div>
          )}

          {launchUrl && !loading && !error && (
            <iframe
              src={launchUrl}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; payment"
              title={game.name}
            />
          )}

          {!launchUrl && !loading && !error && isNativeRoyal && (
            game.game_uid === "royal_coinflip" ? (
              <CoinFlipGame userBalance={userBalance} onBalanceChange={onRefreshBalance} />
            ) : game.game_uid === "royal_andarbahar" ? (
              <AndarBaharGame userBalance={userBalance} onBalanceChange={onRefreshBalance} />
            ) : (
              <ChickenCrossGame userBalance={userBalance} onBalanceChange={onRefreshBalance} />
            )
          )}
        </div>
      </div>
    </div>
  );
};
