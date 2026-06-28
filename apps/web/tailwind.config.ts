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
          cream: "#FCF8DD",
          gold: "#FFD700",
          brass: "#D3AF37",
        },
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,74,92,0.06), 0 8px 24px -12px rgba(0,74,92,0.18)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
