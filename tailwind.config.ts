import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        casino: {
          dark: "#0a0d14",
          card: "#121722",
          cardHover: "#182030",
          border: "#1f293d",
          gold: "#f59e0b",
          goldLight: "#fbbf24",
          goldDark: "#b45309",
          emerald: "#10b981",
          emeraldLight: "#34d399",
          ruby: "#ef4444",
          purple: "#8b5cf6",
          blue: "#3b82f6",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)",
        "emerald-gradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(26, 33, 48, 0.8) 0%, rgba(15, 20, 30, 0.95) 100%)",
        "radial-glow": "radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "gold-glow": "0 0 20px -3px rgba(245, 158, 11, 0.35)",
        "emerald-glow": "0 0 20px -3px rgba(16, 185, 129, 0.35)",
        "neon-card": "0 8px 30px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(245, 158, 11, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(245, 158, 11, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
