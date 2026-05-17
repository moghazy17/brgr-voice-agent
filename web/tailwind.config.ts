import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brgr: {
          bg: "#18181B",
          surface: "#232327",
          gold: "#FFD860",
          goldink: "#000000",
          text: "#FAFAFA",
          muted: "#A1A1AA",
        },
      },
      boxShadow: {
        panel: "0 24px 60px rgba(0, 0, 0, 0.55)",
        gold: "0 0 0 0 rgba(255, 216, 96, 0.5)",
      },
      minHeight: {
        card: "9rem",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};

export default config;
