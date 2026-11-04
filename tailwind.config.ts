import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chocolate: {
          DEFAULT: "#49352D",
          50: "#F8F4F1",
          100: "#EDE3DD",
          200: "#D9C7BD",
          300: "#BEA393",
          400: "#A27F6C",
          500: "#876451",
          600: "#6D4E3F",
          700: "#5A4035",
          800: "#49352D",
          900: "#31231D",
        },
        cream: {
          DEFAULT: "#F5EBDD",
          50: "#FDFAF6",
          100: "#FAF4EA",
          200: "#F5EBDD",
          300: "#EEDDC7",
          400: "#E2C9AA",
        },
        blush: {
          DEFAULT: "#E8C7C3",
          100: "#F8EEEC",
          200: "#F1DEDB",
          300: "#E8C7C3",
          400: "#D9AAA5",
          500: "#C88D87",
        },
        gold: {
          DEFAULT: "#D5B17A",
          100: "#F6EDDD",
          200: "#EBD9BB",
          300: "#D5B17A",
          400: "#C39B5C",
          500: "#A98146",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 60px -24px rgba(73, 53, 45, 0.28)",
        card: "0 12px 40px -18px rgba(73, 53, 45, 0.22)",
        gold: "0 14px 34px -16px rgba(213, 177, 122, 0.7)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(1.45)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
