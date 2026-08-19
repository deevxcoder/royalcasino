"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, Flame, RefreshCw, Coins, Zap } from "lucide-react";

interface CoinFlipGameProps {
  userBalance: number;
  onBalanceChange: (newBalance: number) => void;
}

export const CoinFlipGame: React.FC<CoinFlipGameProps> = ({
  userBalance,
  onBalanceChange,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [history, setHistory] = useState<Array<"heads" | "tails">>(["heads", "tails", "heads", "heads", "tails"]);
  const [streak, setStreak] = useState<number>(0);
  const [coinRotation, setCoinRotation] = useState<number>(0);

  // Play synthetic WebAudio casino sounds
  const playSound = (type: "flip" | "win" | "lose") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "flip") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === "win") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === "lose") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {}
  };

  const handleFlip = async () => {
    if (isFlipping || betAmount <= 0 || betAmount > userBalance) return;

    setIsFlipping(true);
    setLastWin(null);
    playSound("flip");

    // Add multiple full rotations (e.g. 5 to 8 full spins)
    const extraRotations = 1800 + Math.floor(Math.random() * 360);
    setCoinRotation((prev) => prev + extraRotations);

    try {
      const res = await fetch("/api/games/royal/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameUid: "royal_coinflip",
          betAmount,
          choice,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        if (data.success) {
          setFlipResult(data.coinResult);
          setLastWin(data.won);
          setWinAmount(data.winAmount);
          onBalanceChange(data.newBalance);
          setHistory((prev) => [data.coinResult, ...prev.slice(0, 9)]);

          if (data.won) {
            playSound("win");
            setStreak((s) => s + 1);
          } else {
            playSound("lose");
            setStreak(0);
          }
        }
        setIsFlipping(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsFlipping(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#090d16] via-[#0d1322] to-[#080b12] text-white select-none overflow-y-auto">
      {/* Top Header & Streak Pill */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            🪙
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Coin Flip Royale</h2>
            <p className="text-[10px] text-amber-400 font-bold">Payout: 1.96x</p>
          </div>
        </div>

        {/* Live Streak Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111728] border border-casino-border">
          <Flame className={`w-4 h-4 ${streak > 0 ? "text-amber-400 fill-amber-400 animate-bounce" : "text-gray-500"}`} />
          <span className="text-xs font-bold text-gray-300">Streak:</span>
          <span className="text-xs font-black text-amber-400">{streak} WINS</span>
        </div>
      </div>

      {/* History Road Map */}
      <div className="w-full max-w-2xl flex items-center justify-center gap-2 my-2 py-1.5 px-3 rounded-2xl bg-[#080c14] border border-casino-border/60">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-2">History:</span>
        <div className="flex items-center gap-2 overflow-x-auto">
          {history.map((res, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${
                res === "heads"
                  ? "bg-gradient-to-tr from-amber-600 to-yellow-400 text-black border border-yellow-200"
                  : "bg-gradient-to-tr from-blue-600 to-cyan-400 text-black border border-cyan-200"
              }`}
            >
              {res === "heads" ? "H" : "T"}
            </div>
          ))}
        </div>
      </div>

      {/* Center 3D Animated Coin Area */}
      <div className="my-6 sm:my-10 flex flex-col items-center justify-center">
        <div
          className="relative w-40 h-40 sm:w-48 sm:h-48 cursor-pointer group"
          onClick={handleFlip}
          style={{ perspective: 1000 }}
        >
          {/* Animated Coin */}
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-2xl transition-transform duration-1000 ease-out relative"
            style={{
              transform: `rotateY(${coinRotation}deg)`,
              transformStyle: "preserve-3d",
              background:
                choice === "heads"
                  ? "radial-gradient(circle at 35% 35%, #fde047, #ca8a04 60%, #854d0e 95%)"
                  : "radial-gradient(circle at 35% 35%, #38bdf8, #0284c7 60%, #075985 95%)",
              border: "6px solid rgba(255, 255, 255, 0.4)",
              boxShadow: isFlipping
                ? "0 0 50px rgba(234, 179, 8, 0.6)"
                : "0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255,255,255,0.4)",
            }}
          >
            {/* Outer Rim Ring */}
            <div className="w-[88%] h-[88%] rounded-full border-2 border-dashed border-white/60 flex flex-col items-center justify-center gap-1 shadow-inner">
              <span className="text-4xl sm:text-5xl font-black drop-shadow-md">
                {isFlipping ? "🪙" : flipResult ? (flipResult === "heads" ? "👑" : "💎") : choice === "heads" ? "👑" : "💎"}
              </span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-black/80 drop-shadow-sm">
                {isFlipping ? "FLIPPING..." : flipResult ? flipResult.toUpperCase() : choice.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Win/Loss Banner */}
        {lastWin !== null && !isFlipping && (
          <div
            className={`mt-4 px-6 py-2 rounded-2xl font-black text-sm uppercase tracking-wider animate-bounce flex items-center gap-2 ${
              lastWin
                ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400 shadow-emerald-glow"
                : "bg-rose-500/20 border border-rose-500 text-rose-400"
            }`}
          >
            {lastWin ? (
              <>
                <Trophy className="w-4 h-4" />
                <span>YOU WON ₹{winAmount.toFixed(2)}!</span>
              </>
            ) : (
              <span>BETTER LUCK NEXT FLIP!</span>
            )}
          </div>
        )}
      </div>

      {/* Betting & Selection Controls */}
      <div className="w-full max-w-2xl bg-[#0f1424] border border-casino-border rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl">
        {/* Choice Buttons: Heads vs Tails */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setChoice("heads")}
            disabled={isFlipping}
            className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 transition-all ${
              choice === "heads"
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 font-black shadow-gold-glow scale-[1.02]"
                : "bg-[#090d16] text-gray-400 border-casino-border hover:border-gray-600 font-bold"
            }`}
          >
            <span className="text-xl">👑</span>
            <div className="text-left leading-tight">
              <div className="text-xs font-black uppercase">HEADS (1.96x)</div>
              <div className="text-[10px] opacity-80">Crown Side</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setChoice("tails")}
            disabled={isFlipping}
            className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 transition-all ${
              choice === "tails"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-black border-cyan-300 font-black shadow-cyan-glow scale-[1.02]"
                : "bg-[#090d16] text-gray-400 border-casino-border hover:border-gray-600 font-bold"
            }`}
          >
            <span className="text-xl">💎</span>
            <div className="text-left leading-tight">
              <div className="text-xs font-black uppercase">TAILS (1.96x)</div>
              <div className="text-[10px] opacity-80">Diamond Side</div>
            </div>
          </button>
        </div>

        {/* Bet Chips & Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
            <span>BET AMOUNT (INR)</span>
            <span className="text-emerald-400 font-black">
              Potential Win: ₹{(betAmount * 1.96).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input
                type="number"
                min="1"
                max={userBalance}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={isFlipping}
                className="w-full pl-8 pr-3 py-2.5 bg-[#090d16] border border-casino-border focus:border-amber-500 rounded-xl text-base font-black text-white focus:outline-none"
              />
            </div>

            {/* Quick Multipliers */}
            <button
              onClick={() => setBetAmount((b) => Math.max(1, Math.floor(b / 2)))}
              disabled={isFlipping}
              className="px-3 py-2.5 bg-[#090d16] hover:bg-white/10 border border-casino-border rounded-xl text-xs font-bold text-gray-300"
            >
              1/2
            </button>
            <button
              onClick={() => setBetAmount((b) => Math.min(userBalance, b * 2))}
              disabled={isFlipping}
              className="px-3 py-2.5 bg-[#090d16] hover:bg-white/10 border border-casino-border rounded-xl text-xs font-bold text-gray-300"
            >
              2x
            </button>
            <button
              onClick={() => setBetAmount(userBalance)}
              disabled={isFlipping}
              className="px-3 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-xs font-black text-amber-400"
            >
              MAX
            </button>
          </div>

          {/* Quick Chip Presets */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {[10, 50, 100, 500, 1000].map((chip) => (
              <button
                key={chip}
                onClick={() => setBetAmount(chip)}
                disabled={isFlipping}
                className={`py-1.5 rounded-lg border text-xs font-black transition-all ${
                  betAmount === chip
                    ? "bg-amber-500 text-black border-amber-400 shadow-gold-glow"
                    : "bg-[#090d16] hover:bg-[#121828] border-casino-border text-gray-300"
                }`}
              >
                ₹{chip}
              </button>
            ))}
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          disabled={isFlipping || betAmount <= 0 || betAmount > userBalance}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-base uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isFlipping ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>FLIPPING COIN...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-black" />
              <span>FLIP COIN (BET ₹{betAmount})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
