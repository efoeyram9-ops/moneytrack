import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eefaf4",
          100: "#d6f2e3",
          200: "#aee4c9",
          300: "#7ccfab",
          400: "#48b287",
          500: "#26946c",
          600: "#187657",
          700: "#145e47",
          800: "#124a39",
          900: "#0f3d2f",
          950: "#082219",
        },
        gold: {
          50: "#fdf8ec",
          100: "#faeec9",
          200: "#f4db93",
          300: "#edc35c",
          400: "#e6ac35",
          500: "#d4931f",
          600: "#b37317",
          700: "#8f5717",
          800: "#754619",
          900: "#623b19",
        },
        ink: {
          50: "#f5f6f6",
          100: "#e7e9e8",
          200: "#cdd2d0",
          300: "#a6aeab",
          400: "#788380",
          500: "#5c6663",
          600: "#495250",
          700: "#3d4442",
          800: "#343a38",
          900: "#1d2120",
          950: "#101312",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(16, 19, 18, 0.04), 0 2px 8px -2px rgba(16, 19, 18, 0.06)",
        card: "0 1px 3px 0 rgba(16, 19, 18, 0.05), 0 4px 16px -4px rgba(16, 19, 18, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
