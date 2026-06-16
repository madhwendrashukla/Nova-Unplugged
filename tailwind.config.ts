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
        nova: {
          bg: "#0A0A0A",
          navy: "#111111",
          surface: "rgba(255,255,255,0.05)",
          border: "rgba(200, 144, 16, 0.35)",
          primary: "#E8A020",
          "primary-light": "#F0A500",
          accent: "#C8960C",
          "accent-light": "#D4A017",
          success: "#00FF88",
          warning: "#FFB800",
          danger: "#FF4444",
          muted: "#888888",
          text: "#FFFFFF",
          "text-dim": "#CCCCCC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "'Arial Black'", "sans-serif"],
        body: ["var(--font-body)", "'Helvetica Neue'", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        handwritten: ["var(--font-handwritten)", "cursive"],
      },
      backgroundImage: {
        "nova-gradient": "linear-gradient(135deg, #0A0A0A 0%, #1a1505 50%, #0A0A0A 100%)",
        "nova-hero": "radial-gradient(ellipse at bottom, #2b1f02 0%, #0A0A0A 60%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.4), inset 0 -2px 2px rgba(0,0,0,0.2)",
        "bento-glow": "0 0 20px rgba(255,255,255,0.2)",
        "glow-red": "0 0 40px rgba(232,160,32,0.6)",
        "glow-sm": "0 0 10px rgba(232,160,32,0.4)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-right": "slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.5s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(232,160,32,0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(232,160,32,0.8), 0 0 80px rgba(232,160,32,0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
