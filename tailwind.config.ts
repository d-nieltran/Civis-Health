import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0f172a",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        gold: {
          DEFAULT: "#d4a843",
          50: "#fdf9ef",
          100: "#faf0d3",
          200: "#f4dea5",
          300: "#edc86d",
          400: "#d4a843",
          500: "#c4922a",
          600: "#a67420",
          700: "#88571d",
          800: "#71461f",
          900: "#5f3b1e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
