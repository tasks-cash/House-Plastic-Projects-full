import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        surface: {
          DEFAULT: "#09090b",
          card: "#18181b",
          elevated: "#27272a",
          border: "#3f3f46",
        },
        accent: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
          muted: "#064e3b",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.5)",
        glow: "0 0 24px rgba(16, 185, 129, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
