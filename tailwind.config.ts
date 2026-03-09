import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // モダンな暗色系カラーパレット
        background: "#09090b",      // zinc-950
        "surface-0": "#0c0c0e",     // 略明るい背景
        "surface-1": "#18181b",      // zinc-900
        "surface-2": "#27272a",     // zinc-800
        "surface-3": "#3f3f46",     // zinc-700
        border: "#27272a",           // zinc-800
        "border-light": "#3f3f46",  // zinc-700

        // テキストカラー
        "text-primary": "#fafafa",  // zinc-50
        "text-secondary": "#a1a1aa", // zinc-400
        "text-muted": "#71717a",    // zinc-500

        // セレブレートなアクセントカラー（ローズとバイオレットのグラデ）
        accent: "#d946ef",          // fuchsia-500
        "accent-soft": "#e879f9",   // fuchsia-400
        "accent-light": "#f5d0fe",   // fuchsia-200
        "accent-dark": "#a21caf",    // fuchsia-700

        // セカンダリーカラー（ブルー系）
        secondary: "#6366f1",        // indigo-500
        "secondary-soft": "#818cf8", // indigo-400
        "secondary-dark": "#4338ca", // indigo-700

        // グラデーション定義
        gradient: {
          "accent-1": "#d946ef",
          "accent-2": "#a21caf",
          "secondary-1": "#6366f1",
          "secondary-2": "#4338ca",
        },

        // 状態カラー
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",

        // インサイトカラー（Bentoグリッド用）
        "card-1": "rgba(217, 70, 239, 0.08)",   // fuchsia
        "card-2": "rgba(99, 102, 241, 0.08)",  // indigo
        "card-3": "rgba(34, 197, 94, 0.08)",   // green
        "card-4": "rgba(245, 158, 11, 0.08)",  // amber
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "var(--font-noto-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-xs": ["2rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
        "display-sm": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.025em" }],
        "display-md": ["2.5rem", { lineHeight: "2.75rem", letterSpacing: "-0.03em" }],
        "display-lg": ["3rem", { lineHeight: "3.25rem", letterSpacing: "-0.035em" }],
        "display-xl": ["3.75rem", { lineHeight: "4rem", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "elegant": "0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 8px 30px -5px rgba(0, 0, 0, 0.2)",
        "glow": "0 0 20px -5px rgba(217, 70, 239, 0.3)",
        "glow-strong": "0 0 30px -5px rgba(217, 70, 239, 0.4), 0 0 60px -10px rgba(217, 70, 239, 0.2)",
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "gradient-x": "gradientX 15s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
