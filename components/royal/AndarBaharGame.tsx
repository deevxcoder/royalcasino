"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, Flame, RefreshCw, Layers, Zap } from "lucide-react";

interface Card {
  rank: string;
  suit: string;
  color: "red" | "black";
  display: string;
}

interface AndarBaharGameProps {
  userBalance: number;
  onBalanceChange: (newBalance: number) => void;
}

export const AndarBaharGame: React.FC<AndarBaharGameProps> = ({
  userBalance,
  onBalanceChange,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [betSide, setBetSide] = useState<"andar" | "bahar">("andar");
  const [isDealing, setIsDealing] = useState(false);
  const [jokerCard, setJokerCard] = useState<Card | null>({ rank: "K", suit: "♠", color: "black", display: "K♠" });
  const [andarCards, setAndarCards] = useState<Card[]>([]);
  const [baharCards, setBaharCards] = useState<Card[]>([]);
  const [winningSide, setWinningSide] = useState<"andar" | "bahar" | null>(null);
  const [matchedCard, setMatchedCard] = useState<Card | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [history, setHistory] = useState<Array<"A" | "B">>(["A", "B", "A", "A", "B", "A"]);

  // Synthesize card deal & win sounds
  const playSound = (type: "deal" | "match" | "win" | "lose") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "deal") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === "win") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } else if (type === "lose") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const handleDeal = async () => {
    if (isDealing || betAmount <= 0 || betAmount > userBalance) return;

    setIsDealing(true);
    setLastWin(null);
    setWinningSide(null);
    setMatchedCard(null);
    setAndarCards([]);
    setBaharCards([]);

    try {
      const res = await fetch("/api/games/royal/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameUid: "royal_andarbahar",
          betAmount,
          betSide,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setIsDealing(false);
        return;
      }

      setJokerCard(data.jokerCard);

      // Animate dealing cards one-by-one with suspense
      const totalDealt = data.dealtAndar.length + data.dealtBahar.length;
      let aIdx = 0;
      let bIdx = 0;
      let turn: "andar" | "bahar" = "andar";

      const dealInterval = setInterval(() => {
        if (turn === "andar" && aIdx < data.dealtAndar.length) {
          const cardToAdd = data.dealtAndar[aIdx];
          setAndarCards((prev) => [...prev, cardToAdd]);
          playSound("deal");
          aIdx++;
          turn = "bahar";
        } else if (turn === "bahar" && bIdx < data.dealtBahar.length) {
          const cardToAdd = data.dealtBahar[bIdx];
          setBaharCards((prev) => [...prev, cardToAdd]);
          playSound("deal");
          bIdx++;
          turn = "andar";
        }

        // Check if finished dealing
        if (aIdx >= data.dealtAndar.length && bIdx >= data.dealtBahar.length) {
          clearInterval(dealInterval);
          setWinningSide(data.winningSide);
          setMatchedCard(data.matchedCard);
          setLastWin(data.won);
          setWinAmount(data.winAmount);
          onBalanceChange(data.newBalance);
          setHistory((h) => [data.winningSide === "andar" ? "A" : "B", ...h.slice(0, 9)]);

          if (data.won) {
            playSound("win");
          } else {
            playSound("lose");
          }
          setIsDealing(false);
        }
      }, Math.max(120, Math.min(300, 3000 / totalDealt)));
    } catch (e) {
      console.error(e);
      setIsDealing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-[#061810] via-[#0b2419] to-[#040e0a] text-white select-none overflow-y-auto">
      {/* Top Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            🎴
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Andar Bahar Live</h2>
            <p className="text-[10px] text-emerald-400 font-bold">Classic Indian Casino Table</p>
          </div>
        </div>

        {/* History Bead Plate */}
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-2xl bg-black/40 border border-white/10">
          <span className="text-[10px] font-black uppercase text-gray-400 mr-1">Road:</span>
          {history.map((side, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${
                side === "A"
                  ? "bg-rose-600 text-white border border-rose-300"
                  : "bg-blue-600 text-white border border-blue-300"
              }`}
            >
              {side}
            </div>
          ))}
        </div>
      </div>

      {/* Main Felt Casino Table Area */}
      <div className="w-full max-w-4xl mx-auto my-3 p-4 sm:p-6 rounded-3xl bg-[#0a2f20] border-4 border-amber-600/40 shadow-2xl space-y-4 relative">
        {/* Joker Opening Card in Center */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 drop-shadow">
            TRUMP JOKER CARD
          </span>
          <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-2xl bg-white text-black border-2 border-amber-400 shadow-gold-glow flex flex-col items-center justify-between p-2 transform hover:scale-105 transition-transform">
            <span
              className={`text-sm sm:text-base font-black self-start leading-none ${
                jokerCard?.color === "red" ? "text-rose-600" : "text-black"
              }`}
            >
              {jokerCard?.rank}
            </span>
            <span
              className={`text-2xl sm:text-3xl font-black ${
                jokerCard?.color === "red" ? "text-rose-600" : "text-black"
              }`}
            >
              {jokerCard?.suit}
            </span>
            <span
              className={`text-sm sm:text-base font-black self-end leading-none ${
                jokerCard?.color === "red" ? "text-rose-600" : "text-black"
              }`}
            >
              {jokerCard?.rank}
            </span>
          </div>
        </div>

        {/* Andar & Bahar Deal Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* ANDAR SIDE */}
          <div
            onClick={() => !isDealing && setBetSide("andar")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
              betSide === "andar"
                ? "bg-rose-950/40 border-rose-500 shadow-rose-glow"
                : "bg-black/30 border-white/10 hover:border-rose-500/50"
            } ${winningSide === "andar" ? "ring-4 ring-amber-400 animate-pulse" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="font-black text-sm uppercase text-rose-300">ANDAR</span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">1.90x</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">({andarCards.length} cards)</span>
            </div>

            {/* Dealt Cards Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 min-h-[68px]">
              {andarCards.length > 0 ? (
                andarCards.map((card, i) => (
                  <div
                    key={i}
                    className={`w-11 h-16 rounded-xl bg-white text-black border shrink-0 flex flex-col items-center justify-between p-1 shadow-md ${
                      card.rank === jokerCard?.rank ? "border-amber-500 ring-2 ring-amber-400 scale-105" : "border-gray-300"
                    }`}
                  >
                    <span className={`text-[10px] font-black leading-none ${card.color === "red" ? "text-rose-600" : "text-black"}`}>
                      {card.rank}
                    </span>
                    <span className={`text-base leading-none ${card.color === "red" ? "text-rose-600" : "text-black"}`}>
                      {card.suit}
                    </span>
                    <span className={`text-[10px] font-black leading-none self-end ${card.color === "red" ? "text-rose-600" : "text-black"}`}>
                      {card.rank}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic p-2">Cards deal here first</div>
              )}
            </div>
          </div>

          {/* BAHAR SIDE */}
          <div
            onClick={() => !isDealing && setBetSide("bahar")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
              betSide === "bahar"
                ? "bg-blue-950/40 border-blue-500 shadow-blue-glow"
                : "bg-black/30 border-white/10 hover:border-blue-500/50"
            } ${winningSide === "bahar" ? "ring-4 ring-amber-400 animate-pulse" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-black text-sm uppercase text-blue-300">BAHAR</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">2.00x</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">({baharCards.length} cards)</span>
            </div>

            {/* Dealt Cards Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 min-h-[68px]">
              {baharCards.length > 0 ? (
                baharCards.map((card, i) => (
                  <div
                    key={i}
                    className={`w-11 h-16 rounded-xl bg-white text-black border shrink-0 flex flex-col items-center justify-between p-1 shadow-md ${
                      card.rank === jokerCard?.rank ? "border-amber-500 ring-2 ring-amber-400 scale-105" : "border-gray-300"
                    }`}
                  >
                    <span className={`text-[10px] font-black leading-none ${card.color === "red" ? "text-rose-600" : "text-black"}`}>
                      {card.rank}
                    </span>
                    <span className={`text-base leading-none ${card.color === "red" ? "text-rose-600" : "text-black"}`}>
                      {card.suit}
                    </span>
                    <span className={`text-[10px] font-black leading-none self-end ${card.color === "red" ? "text-rose-600" : "text-black"}`}>
                      {card.rank}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic p-2">Cards deal here second</div>
              )}
            </div>
          </div>
        </div>

        {/* Win/Loss Notification */}
        {lastWin !== null && !isDealing && (
          <div
            className={`p-3 rounded-2xl text-center font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 ${
              lastWin
                ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400 shadow-emerald-glow"
                : "bg-rose-500/20 border border-rose-500 text-rose-400"
            }`}
          >
            {lastWin ? (
              <>
                <Trophy className="w-5 h-5" />
                <span>
                  {winningSide?.toUpperCase()} WON! YOU COLLECTED ₹{winAmount.toFixed(2)}
                </span>
              </>
            ) : (
              <span>{winningSide?.toUpperCase()} WON — TRY AGAIN!</span>
            )}
          </div>
        )}
      </div>

      {/* Betting Controls & Chips Bar */}
      <div className="w-full max-w-4xl mx-auto bg-[#0a1a12] border border-casino-border rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Bet Side Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setBetSide("andar")}
              disabled={isDealing}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                betSide === "andar"
                  ? "bg-rose-600 text-white shadow-rose-glow"
                  : "bg-[#06120b] border border-white/10 text-gray-400"
              }`}
            >
              BET ANDAR (1.9x)
            </button>
            <button
              type="button"
              onClick={() => setBetSide("bahar")}
              disabled={isDealing}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                betSide === "bahar"
                  ? "bg-blue-600 text-white shadow-blue-glow"
                  : "bg-[#06120b] border border-white/10 text-gray-400"
              }`}
            >
              BET BAHAR (2.0x)
            </button>
          </div>

          {/* Chips Grid */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[10, 50, 100, 500, 1000].map((chip) => (
              <button
                key={chip}
                onClick={() => setBetAmount(chip)}
                disabled={isDealing}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  betAmount === chip
                    ? "bg-amber-500 text-black border border-amber-400 shadow-gold-glow"
                    : "bg-[#06120b] border border-white/10 text-gray-300 hover:text-white"
                }`}
              >
                ₹{chip}
              </button>
            ))}
          </div>
        </div>

        {/* Deal Action Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-36">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
            <input
              type="number"
              min="1"
              max={userBalance}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={isDealing}
              className="w-full pl-7 pr-2 py-3 bg-[#06120b] border border-white/10 rounded-xl text-sm font-black text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleDeal}
            disabled={isDealing || betAmount <= 0 || betAmount > userBalance}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider shadow-emerald-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isDealing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>DEALING CARDS...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-black" />
                <span>DEAL {betSide.toUpperCase()} (₹{betAmount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
