"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Flame, Play, AlertCircle, Zap, Shield, Sparkles, RefreshCw } from "lucide-react";

interface ChickenCrossGameProps {
  userBalance: number;
  onBalanceChange: (newBalance: number) => void;
}

export const ChickenCrossGame: React.FC<ChickenCrossGameProps> = ({
  userBalance,
  onBalanceChange,
}) => {
  const [betAmount, setBetAmount] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [gameState, setGameState] = useState<"idle" | "playing" | "crashed" | "cashed_out">("idle");
  const [currentLane, setCurrentLane] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [multipliers, setMultipliers] = useState<number[]>([1.25, 1.60, 2.20, 3.40, 5.80, 11.0, 25.0, 60.0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [winAmount, setWinAmount] = useState<number>(0);

  const laneIcons = ["🚗", "🚕", "🚙", "🚌", "🏎️", "🚚", "🚂", "🚁"];

  // WebAudio Sound Effects
  const playSound = (type: "hop" | "crash" | "cashout") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "hop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300 + currentLane * 60, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600 + currentLane * 60, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === "cashout") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === "crash") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // Start new round
  const handleStartGame = async () => {
    if (isProcessing || betAmount <= 0 || betAmount > userBalance) return;
    setIsProcessing(true);
    setCurrentLane(0);
    setCurrentMultiplier(1.0);
    setWinAmount(0);

    try {
      const res = await fetch("/api/games/royal/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameUid: "royal_chickencross",
          action: "start",
          betAmount,
          difficulty,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGameState("playing");
        setMultipliers(data.multipliers);
        onBalanceChange(data.newBalance);
        playSound("hop");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step to next lane
  const handleStep = async () => {
    if (isProcessing || gameState !== "playing") return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/games/royal/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameUid: "royal_chickencross",
          action: "step",
          currentLane,
          difficulty,
          betAmount,
        }),
      });

      const data = await res.json();

      if (data.crashed) {
        playSound("crash");
        setGameState("crashed");
        setCurrentLane(data.currentLane);
      } else {
        playSound("hop");
        setCurrentLane(data.currentLane);
        setCurrentMultiplier(data.currentMultiplier);

        if (data.completed) {
          playSound("cashout");
          setGameState("cashed_out");
          setWinAmount(data.winAmount);
          onBalanceChange(data.newBalance);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cash out current multiplier
  const handleCashout = async () => {
    if (isProcessing || gameState !== "playing" || currentLane === 0) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/games/royal/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameUid: "royal_chickencross",
          action: "cashout",
          currentMultiplier,
          betAmount,
          currentLane,
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSound("cashout");
        setGameState("cashed_out");
        setWinAmount(data.winAmount);
        onBalanceChange(data.newBalance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-[#111624] via-[#0c121e] to-[#070a12] text-white select-none overflow-y-auto">
      {/* Top Info Bar */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-bold text-lg">
            🐔
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Chicken Road Cross</h2>
            <p className="text-[10px] text-yellow-400 font-bold">Crossy Crash & Cashout</p>
          </div>
        </div>

        {/* Current Multiplier Display */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#080d18] border border-amber-500/40 shadow-gold-glow">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-gray-300 font-bold">Current:</span>
          <span className="text-sm font-black text-amber-400">
            {currentMultiplier.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Main Road Track Lanes */}
      <div className="w-full max-w-3xl mx-auto my-3 p-4 rounded-3xl bg-[#080c16] border-2 border-casino-border shadow-2xl space-y-2 relative overflow-hidden">
        {/* Road Lanes Grid */}
        <div className="space-y-1.5">
          {/* Finish Line (Jackpot) */}
          <div className="h-10 rounded-xl bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-amber-500/30 border border-amber-400/50 flex items-center justify-between px-4 text-xs font-black text-amber-300">
            <span className="flex items-center gap-1.5">
              <span>🏁 FINISH LINE JACKPOT</span>
            </span>
            <span className="text-sm text-yellow-400">
              {multipliers[multipliers.length - 1]}x
            </span>
          </div>

          {/* Traffic Lanes (Reversed: top is high multiplier, bottom is start) */}
          {multipliers
            .slice(0, multipliers.length - 1)
            .map((mult, idx) => {
              const laneNum = multipliers.length - 1 - idx; // 7, 6, 5... 1
              const isChickenHere = currentLane === laneNum && gameState !== "crashed";
              const isPastLane = currentLane > laneNum;
              const isCrashHere = currentLane === laneNum && gameState === "crashed";

              return (
                <div
                  key={laneNum}
                  className={`h-11 rounded-xl border flex items-center justify-between px-4 transition-all ${
                    isCrashHere
                      ? "bg-rose-950/60 border-rose-500 shadow-rose-glow"
                      : isChickenHere
                      ? "bg-amber-500/25 border-amber-400 shadow-gold-glow scale-[1.01]"
                      : isPastLane
                      ? "bg-emerald-950/30 border-emerald-500/30 opacity-70"
                      : "bg-[#0f1422] border-white/5 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400">Lane {laneNum}</span>
                    <span className="text-sm">
                      {isCrashHere ? "💥 SPLAT!" : isChickenHere ? "🐔 HOPPING!" : laneIcons[laneNum % laneIcons.length]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isChickenHere && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-black font-black animate-pulse">
                        YOU ARE HERE
                      </span>
                    )}
                    <span
                      className={`text-xs font-black ${
                        isPastLane || isChickenHere ? "text-emerald-400" : "text-gray-400"
                      }`}
                    >
                      {mult}x
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Starting Sidewalk */}
          <div
            className={`h-10 rounded-xl border flex items-center justify-between px-4 text-xs font-bold ${
              currentLane === 0 && gameState === "playing"
                ? "bg-amber-500/20 border-amber-400 text-white"
                : "bg-[#0b101c] border-white/5 text-gray-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🌾 Safe Sidewalk (Start)</span>
              {currentLane === 0 && gameState === "playing" && <span>🐔</span>}
            </span>
            <span>1.00x</span>
          </div>
        </div>

        {/* Game State Overlay Notifications */}
        {gameState === "crashed" && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-center font-black text-sm uppercase text-rose-300 shadow-rose-glow animate-bounce">
            💥 CHICKEN GOT HIT BY TRAFFIC! ROUND OVER
          </div>
        )}

        {gameState === "cashed_out" && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-center font-black text-sm uppercase text-emerald-300 shadow-emerald-glow flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <span>CASHED OUT ₹{winAmount.toFixed(2)} ({currentMultiplier}x)!</span>
          </div>
        )}
      </div>

      {/* Action Control Panel */}
      <div className="w-full max-w-3xl mx-auto bg-[#0a101d] border border-casino-border rounded-3xl p-4 space-y-3 shadow-xl">
        {gameState === "idle" || gameState === "crashed" || gameState === "cashed_out" ? (
          /* Pre-game Setup Controls */
          <div className="space-y-3">
            {/* Difficulty Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Traffic Danger:</span>
              <div className="flex items-center gap-1.5 flex-1">
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                      difficulty === diff
                        ? diff === "easy"
                          ? "bg-emerald-500 text-black shadow-emerald-glow"
                          : diff === "medium"
                          ? "bg-amber-500 text-black shadow-gold-glow"
                          : "bg-rose-500 text-white shadow-rose-glow"
                        : "bg-[#060a12] text-gray-400 border border-white/10 hover:text-white"
                    }`}
                  >
                    {diff === "easy" ? "Safe (15x Max)" : diff === "medium" ? "City (60x Max)" : "Fury (250x Max)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Input & Start Button */}
            <div className="flex items-center gap-3">
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="1"
                  max={userBalance}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-7 pr-2 py-3 bg-[#060a12] border border-white/10 rounded-xl text-sm font-black text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleStartGame}
                disabled={isProcessing || betAmount <= 0 || betAmount > userBalance}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>START CROSSING (BET ₹{betAmount})</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Gameplay Buttons: Hop or Cashout */
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleStep}
              disabled={isProcessing}
              className="py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="text-xl">🐾</span>
                  <span>HOP FORWARD</span>
                </>
              )}
            </button>

            <button
              onClick={handleCashout}
              disabled={isProcessing || currentLane === 0}
              className="py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider shadow-emerald-glow flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <Trophy className="w-4 h-4" />
              <span>
                CASH OUT ₹{(betAmount * currentMultiplier).toFixed(2)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
