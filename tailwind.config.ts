import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg: {
          base: "#070A0F",
          surface: "#0D1117",
          elevated: "#131923",
          hover: "#1A2233",
        },
        brand: {
          primary: "#6366F1",
          "primary-light": "#818CF8",
          "primary-dim": "#3730A3",
          secondary: "#22D3EE",
          "secondary-dim": "#0E7490",
        },
        status: {
          success: "#10B981",
          "success-dim": "#065F46",
          warning: "#F59E0B",
          "warning-dim": "#92400E",
          danger: "#EF4444",
          "danger-dim": "#7F1D1D",
          info: "#3B82F6",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
          muted: "#475569",
          dim: "#334155",
        },
        border: {
          subtle: "#1E2D3D",
          default: "#243447",
          strong: "#334155",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "orbit": "orbit 20s linear infinite",
        "scan": "scan 3s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
        orbit: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
        "hero-gradient": "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 60%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(99,102,241,0.3)",
        "glow-secondary": "0 0 20px rgba(34,211,238,0.3)",
        "glow-success": "0 0 20px rgba(16,185,129,0.3)",
        "glow-danger": "0 0 20px rgba(239,68,68,0.3)",
        "card": "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
