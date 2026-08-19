"use client";

import React from "react";
import { Flame, Rocket, Layers, Dice5, Radio, Sparkles } from "lucide-react";

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

const categories = [
  { id: "all", label: "All Games", icon: Flame },
  { id: "crash", label: "Crash & Aviator", icon: Rocket },
  { id: "slots", label: "Hot Slots", icon: Sparkles },
  { id: "live", label: "Live Casino", icon: Radio },
  { id: "table", label: "Table Games", icon: Dice5 },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "theme-btn-accent text-black"
                : "bg-casino-card hover:bg-casino-cardHover border border-casino-border text-gray-300 hover:text-white"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-black" : "theme-text-accent"}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
