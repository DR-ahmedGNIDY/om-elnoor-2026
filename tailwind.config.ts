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
        primary: {
          DEFAULT: "#173A66",
          50:  "#eef2f8",
          100: "#d5e0ef",
          200: "#abc1df",
          300: "#80a2cf",
          400: "#5683bf",
          500: "#173A66",
          600: "#133055",
          700: "#0f2644",
          800: "#0b1c33",
          900: "#071222",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#21497D",
          foreground: "#ffffff",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50:  "#fdf9ec",
          100: "#faf0cc",
          200: "#f5e099",
          300: "#efcf66",
          400: "#e9be33",
          500: "#D4AF37",
          600: "#aa8c2c",
          700: "#7f6921",
          800: "#554616",
          900: "#2a230b",
          foreground: "#0F2D52",
        },
        brand: {
          bg:   "#FAF8F3",
          text: "#0F2D52",
        },
      },

      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        sans:  ["var(--font-cairo)", "Cairo", "sans-serif"],
      },

      borderRadius: {
        "4xl": "2rem",
      },

      boxShadow: {
        "card":    "0 2px 12px rgba(23,58,102,0.07)",
        "card-lg": "0 8px 30px rgba(23,58,102,0.12)",
        "gold":    "0 4px 20px rgba(212,175,55,0.25)",
      },

      backgroundImage: {
        "hero-gradient":   "linear-gradient(135deg, #173A66 0%, #21497D 60%, #0F2D52 100%)",
        "gold-gradient":   "linear-gradient(135deg, #D4AF37 0%, #c49f2a 100%)",
        "card-gradient":   "linear-gradient(135deg, #173A66 0%, #21497D 100%)",
      },

      animation: {
        "fade-in":  "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
