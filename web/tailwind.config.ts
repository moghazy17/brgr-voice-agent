import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brgr: {
          bg: "#FFF6E5",
          paper: "#F7EBD0",
          surface: "#FFFFFF",
          ink: "#1A1410",
          char: "#2D1B14",
          red: "#D7263D",
          ember: "#E85A1A",
          mustard: "#FFC93A",
          cream: "#FFF6E5",
          muted: "#6B5B4A",
          line: "#1A14101A",
          // legacy tokens — kept so older class refs don't break during refactor
          gold: "#FFC93A",
          goldink: "#1A1410",
          text: "#1A1410",
        },
      },
      fontFamily: {
        display: ["var(--font-anton)", "Impact", "Arial Black", "sans-serif"],
        body: ["var(--font-inter-tight)", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["var(--font-tajawal)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        diner: "0 18px 0 -6px #1A1410, 0 22px 40px rgba(26, 20, 16, 0.18)",
        chip: "0 4px 0 #1A1410",
        orb: "0 30px 80px rgba(215, 38, 61, 0.45), 0 0 0 6px #1A1410, 0 0 0 12px #FFC93A",
        card: "0 10px 0 -4px #1A1410, 0 14px 24px rgba(26, 20, 16, 0.12)",
        panel: "0 24px 60px rgba(26, 20, 16, 0.22)",
        gold: "0 0 0 0 rgba(255, 201, 58, 0.5)",
      },
      minHeight: {
        card: "9rem",
      },
      keyframes: {
        "neon-flicker": {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 22%, 24%, 55%": { opacity: "0.55" },
        },
        "orb-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "rise": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "neon-flicker": "neon-flicker 4s infinite",
        "orb-pulse": "orb-pulse 1.8s ease-out infinite",
        "rise": "rise 0.35s cubic-bezier(.2,.7,.2,1) both",
        "ticker": "ticker 40s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};

export default config;
