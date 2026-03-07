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
        background: "#0a0a0a",
        card: "#1a1a1a",
        "card-hover": "#252525",
        "border": "#2a2a2a",
        "text-primary": "#ffffff",
        "text-secondary": "#a0a0a0",
        accent: "#6366f1",
        "accent-hover": "#818cf8",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
