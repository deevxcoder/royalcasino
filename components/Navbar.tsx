"use client";

import React, { useState } from "react";
import { Wallet, Plus, Shield, User, Flame, LogOut, Activity } from "lucide-react";

interface NavbarProps {
  user: { username: string; balance: number; currency: string; isAdmin?: boolean } | null;
  settings?: { siteName?: string; siteSubtitle?: string; logoUrl?: string | null; themeColor?: string };
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  settings,
  onOpenDeposit,
  onOpenAuth,
  onLogout,
}) => {
  const siteName = settings?.siteName || "NEXX CASINO";
  const siteSubtitle = settings?.siteSubtitle || "Casino Royale";
  const logoUrl = settings?.logoUrl;
  const themeColor = settings?.themeColor || "gold";

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-casino-border/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              className="w-10 h-10 object-contain rounded-xl shadow-lg"
              onError={(e) => ((e.target as HTMLElement).style.display = "none")}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl theme-btn-accent p-[2px] theme-glow flex items-center justify-center">
              <div className="w-full h-full bg-[#0d121c] rounded-[10px] flex items-center justify-center">
                <Flame className="w-6 h-6 theme-text-accent animate-pulse-slow" />
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-xl theme-gradient-text">
                {siteName}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wider font-medium uppercase -mt-0.5">
              {siteSubtitle}
            </p>
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin Backoffice Link (ONLY for Admin accounts) */}
          {user?.isAdmin && (
            <a
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-bold text-purple-300 hover:text-purple-200 transition-colors"
              title="Admin Backoffice"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Portal</span>
            </a>
          )}

          {/* User Wallet Balance Pill */}
          {user ? (
            <div className="flex items-center gap-2 bg-[#0e1422] border border-casino-border rounded-xl p-1 pr-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 px-2.5 py-1">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-semibold uppercase text-gray-400 leading-none">
                    Balance
                  </span>
                  <span className="text-sm font-black text-emerald-400 leading-tight">
                    ₹{user.balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Deposit Quick Action */}
              <button
                onClick={onOpenDeposit}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold shadow-emerald-glow transition-transform active:scale-95"
                title="Deposit Funds"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl theme-btn-accent text-black font-extrabold text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          )}

          {/* User Profile / Logout */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-casino-card border border-casino-border text-xs font-semibold text-gray-200">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>{user.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-casino-card hover:bg-rose-950/40 border border-casino-border hover:border-rose-500/40 text-gray-400 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
