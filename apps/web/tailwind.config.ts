import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ألوان هوية إيوان
        brand: {
          teal: "#00809D",
          "teal-700": "#006a82",
          "teal-900": "#004a5c",
          ink: "#03303c",
          night: "#022730",
          cream: "#FCF8DD",
          gold: "#FFD700",
          "gold-soft": "#F2D479",
          brass: "#D3AF37",
        },
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,74,92,0.06), 0 8px 24px -12px rgba(0,74,92,0.18)",
        luxe: "0 2px 6px rgba(2,39,48,0.08), 0 24px 50px -24px rgba(2,39,48,0.45)",
        gold: "0 10px 30px -12px rgba(211,175,55,0.45)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
