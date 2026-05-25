/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        // Obsidian / Quantum theme
        obsidian: {
          DEFAULT: "#0B0C10",
          900: "#0B0C10",
          800: "#10131A",
          700: "#1F232B",
          600: "#262B35",
        },
        quantum: {
          cyan: "#00E5FF",
          cyan2: "#00BCFF",
          violet: "#7000FF",
          purple: "#8B5CF6",
          lime: "#7CFFB2",
        },
        // Backwards-compat tokens used across legacy pages
        background: "#0B0C10",
        foreground: "#E2E8F0",
        card: "#10131A",
        border: "#1F232B",
        muted: "#1F232B",
        "text-secondary": "#94A3B8",
        "text-muted": "#64748B",
        "accent-cyan": "#00E5FF",
        "accent-green": "#7CFFB2",
        "accent-purple": "#8B5CF6",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        quantum: "0 0 25px rgba(0,229,255,0.2)",
        "quantum-strong": "0 0 35px rgba(0,229,255,0.4)",
        glass: "0 24px 80px rgba(2, 6, 23, 0.45)",
      },
      backgroundImage: {
        "grid-obsidian":
          "linear-gradient(to right, #1F232B 1px, transparent 1px), linear-gradient(to bottom, #1F232B 1px, transparent 1px)",
        "quantum-radial":
          "radial-gradient(circle at top right, rgba(0,229,255,0.15), transparent 35%), radial-gradient(circle at bottom left, rgba(139,92,246,0.18), transparent 30%)",
      },
      backgroundSize: {
        "grid-50": "50px 50px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slow-pulse": {
          "0%,100%": { opacity: "0.05" },
          "50%": { opacity: "0.12" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(60px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(60px) rotate(-360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 600ms ease both",
        "slow-pulse": "slow-pulse 6s ease-in-out infinite",
        orbit: "orbit 14s linear infinite",
      },
    },
  },
  plugins: [],
};
