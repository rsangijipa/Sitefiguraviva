const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "false",
  theme: {
    extend: {
      colors: {
        gray: colors.stone, // Enforce organic gray
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
        paper: "var(--color-paper)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        gold: "var(--color-gold)",
        "gold-light": "var(--color-gold-light)",
        "gold-dark": "var(--color-gold-dark)",
        beige: "var(--color-beige)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: colors.sky[500],
        // Black & Sepia Evolution Tokens
        ink: "#0d0c0b",
        agedGold: "#c5a05b",
        glassBg: "rgba(255, 255, 255, 0.03)",
        glassBorder: "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      fontSize: {
        "fluid-h1": [
          "clamp(2.5rem, 8vw, 6rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "fluid-h2": [
          "clamp(2rem, 5vw, 4rem)",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],
        "fluid-h3": ["clamp(1.5rem, 3vw, 2.5rem)", { lineHeight: "1.3" }],
        "fluid-body": "clamp(1rem, 1.5vw, 1.125rem)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        "widest-extra": "0.3em",
      },
      backdropBlur: {
        glass: "12px",
        "glass-lg": "24px",
      },
      boxShadow: {
        "soft-sm":
          "0 2px 8px -1px rgba(27, 33, 45, 0.04), 0 1px 2px -1px rgba(27, 33, 45, 0.02)",
        "soft-md":
          "0 8px 24px -4px rgba(27, 33, 45, 0.06), 0 4px 8px -2px rgba(27, 33, 45, 0.03)",
        "soft-lg":
          "0 20px 48px -8px rgba(27, 33, 45, 0.08), 0 8px 16px -4px rgba(27, 33, 45, 0.04)",
        "soft-xl":
          "0 32px 64px -12px rgba(27, 33, 45, 0.10), 0 16px 32px -8px rgba(27, 33, 45, 0.05)",
        premium:
          "0 0 0 1px rgba(27, 33, 45, 0.04), 0 4px 12px rgba(27, 33, 45, 0.06), 0 12px 32px rgba(27, 33, 45, 0.04)",
        "elev-1": "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
        "elev-2":
          "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        "elev-3":
          "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)",
        "glow-gold":
          "0 0 20px rgba(212, 175, 55, 0.15), 0 8px 30px rgba(212, 175, 55, 0.1)",
        "inner-light": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)",
      },
      borderRadius: {
        "organic-1": "60% 40% 30% 70% / 60% 30% 70% 40%",
        "organic-2": "50% 50% 20% 80% / 25% 80% 20% 75%",
        "organic-3": "30% 70% 70% 30% / 30% 30% 70% 70%",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-delayed": "float 10s ease-in-out infinite 2s",
        "float-soft": "float-soft 12s ease-in-out infinite",
        aurora: "aurora 20s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-5px) rotate(0.5deg)" },
        },
        aurora: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-5%, 5%) scale(1.1)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        "gradient-shift": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
