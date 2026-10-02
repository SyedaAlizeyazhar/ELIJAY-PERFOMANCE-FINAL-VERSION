import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-montserrat)", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      // ELIJAY brand palette — exact hex from the brand handoff.
      colors: {
        // Theme-aware tokens: values live in globals.css as RGB triplets so
        // opacity modifiers (bg-background/70 etc.) keep working in both themes.
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        ink: "#050607", // fixed midnight black, e.g. text on gold
        emerald: {
          // Card tint: deep emerald in dark mode, white in light mode.
          DEFAULT: "rgb(var(--emerald-surface) / <alpha-value>)",
          deep: "#003B32",
          teal: "rgb(var(--teal) / <alpha-value>)", // emerald teal — small accents only
        },
        gold: {
          DEFAULT: "rgb(var(--gold) / <alpha-value>)", // metallic gold (deeper in light)
          dark: "#C9912E",
          light: "#F5D27A",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: { DEFAULT: "#D6A343", foreground: "#050607" },
        accent: { DEFAULT: "#008A70", foreground: "#050607" },
        success: "#008A70",
        danger: "#C2483C",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(90deg, #C9912E 0%, #D6A343 45%, #F5D27A 100%)",
        "emerald-blob": "radial-gradient(circle at 50% 50%, #008A70 0%, #003B32 55%, transparent 75%)",
        "hero-gradient":
          "radial-gradient(ellipse 70% 55% at 50% -10%, rgba(0,59,50,0.55), transparent), radial-gradient(ellipse 50% 40% at 85% 5%, rgba(214,163,67,0.10), transparent)",
        "card-glow": "linear-gradient(180deg, rgba(0,138,112,0.06) 0%, rgba(20,23,22,0) 100%)",
      },
      boxShadow: {
        gold: "0 0 30px -8px rgba(214,163,67,0.45)",
        "gold-lg": "0 10px 40px -10px rgba(214,163,67,0.55)",
        "teal-glow": "0 0 24px -6px rgba(0,138,112,0.5)",
        lift: "0 24px 50px -20px rgba(0,0,0,0.85)",
      },
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-24px,0) scale(1.04)" },
        },
        caret: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "60%, 100%": { transform: "translateX(220%) skewX(-20deg)" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 1.8s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
        caret: "caret 1s step-end infinite",
        marquee: "marquee 28s linear infinite",
        shimmer: "shimmer 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
