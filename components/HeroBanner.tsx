"use client";

import React from "react";
import { Play, Flame, ShieldCheck, Zap, Sparkles } from "lucide-react";

interface HeroBannerProps {
  onLaunchAviator: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onLaunchAviator }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#151c2c] via-[#0f1420] to-[#0a0d14] border border-casino-border shadow-2xl p-6 sm:p-10 mb-8">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Text & CTA */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full theme-bg-subtle theme-border-accent theme-text-accent text-xs font-bold uppercase tracking-wider border">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen GGR Casino Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            PLAY <span className="theme-gradient-text">AVIATOR</span> & 5,000+ CASINO HITS
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            Experience ultra-low latency game sessions powered by NexxAPI. Seamless AES-256 encrypted game launches with automated settlement callbacks.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onLaunchAviator}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl theme-btn-accent text-black font-black text-sm uppercase tracking-wider transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Launch Aviator (Spribe)</span>
            </button>

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Launch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Idempotent Callback</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Aviator Visual Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            onClick={onLaunchAviator}
            className="group relative cursor-pointer w-full max-w-sm rounded-2xl overflow-hidden bg-gradient-to-b from-[#1f293d] to-[#121724] border border-casino-border/80 hover:border-amber-500/60 p-3 shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 flex items-center justify-center">
              <img
                src="/api/media?url=https%3A%2F%2Fapi.nexxapi.tech%2Fmedia%2Fgames%2F737.png"
                alt="Aviator by Spribe"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-2 right-2 px-2 py-1 rounded bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <Flame className="w-3 h-3 fill-white" />
                #1 CRASH GAME
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                <div className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-gold-glow">
                  <Play className="w-6 h-6 fill-black ml-1" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <div>
                <h3 className="font-extrabold text-white text-base group-hover:text-amber-400 transition-colors">
                  Aviator
                </h3>
                <p className="text-xs text-gray-400 font-medium">Spribe · Crash / Flash</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                97% RTP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
