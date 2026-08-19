"use client";

import React, { useState } from "react";
import { X, Wallet, Check, Sparkles, ArrowRight } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (newBalance: number) => void;
}

const presets = [100, 500, 1000, 2500, 5000, 10000];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        onDepositSuccess(data.balance);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#0f1422] border border-casino-border rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Deposit Funds</h3>
              <p className="text-xs text-gray-400">Instant Player Balance Top-up</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-casino-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Amount (INR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-emerald-400">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-9 pr-4 py-3 bg-[#080c14] border border-casino-border focus:border-emerald-500 rounded-2xl text-xl font-black text-white focus:outline-none"
              min={10}
            />
          </div>
        </div>

        {/* Preset Pills */}
        <div className="grid grid-cols-3 gap-2">
          {presets.map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                amount === val
                  ? "bg-emerald-500 text-black shadow-emerald-glow"
                  : "bg-casino-card hover:bg-casino-cardHover border border-casino-border text-gray-300"
              }`}
            >
              +₹{val}
            </button>
          ))}
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={loading || amount <= 0}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm uppercase tracking-wider shadow-emerald-glow transition-all flex items-center justify-center gap-2"
        >
          {success ? (
            <>
              <Check className="w-5 h-5" />
              <span>Deposited Successfully!</span>
            </>
          ) : loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>Confirm Deposit ₹{amount}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
