"use client";

import React from "react";
import { Provider } from "@/lib/types";

interface ProviderFilterProps {
  providers: Provider[];
  selectedBrandId: number | null;
  onSelectBrand: (brandId: number | null) => void;
  loading: boolean;
}

export const ProviderFilter: React.FC<ProviderFilterProps> = ({
  providers,
  selectedBrandId,
  onSelectBrand,
  loading,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
          Game Providers ({providers.length})
        </h3>
        {selectedBrandId !== null && (
          <button
            onClick={() => onSelectBrand(null)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
          >
            Show All Providers
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* All Brands Pill */}
        <button
          onClick={() => onSelectBrand(null)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            selectedBrandId === null
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "bg-[#111622] hover:bg-[#182030] border border-casino-border text-gray-400 hover:text-gray-200"
          }`}
        >
          All Providers
        </button>

        {providers.slice(0, 20).map((provider) => {
          const isSelected = selectedBrandId === provider.brand_id;

          return (
            <button
              key={provider.brand_id}
              onClick={() => onSelectBrand(isSelected ? null : provider.brand_id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-gold-glow"
                  : "bg-[#111622] hover:bg-[#182030] border border-casino-border text-gray-300 hover:text-white"
              }`}
            >
              {provider.logo ? (
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xs">👑</span>
              )}
              <span>{provider.name}</span>
              {provider.game_count ? (
                <span className="text-[10px] px-1 py-0.2 rounded bg-black/40 text-gray-400">
                  {provider.game_count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
