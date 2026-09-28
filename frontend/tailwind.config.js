/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070A13",
          900: "#0A0E1A",
          800: "#0F1526",
          700: "#161D33",
          600: "#232C48",
          400: "#8991AC",
          200: "#C7CCDC",
          100: "#F4F2EC",
        },
        brass: {
          300: "#E4C88C",
          400: "#D6B679",
          500: "#C9A667",
          600: "#A9854C",
        },
        sapphire: {
          400: "#7C97F0",
          500: "#5D7FE8",
          600: "#4A67C9",
        },
        risk: {
          high: "#D1594F",
          mid: "#DCA23E",
          low: "#4FAE7E",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 8px 30px -12px rgba(0,0,0,0.6)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(3%, -4%, 0) scale(1.05)" },
        },
        driftReverse: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-4%, 5%, 0) scale(1.08)" },
        },
      },
      animation: {
        drift: "drift 22s ease-in-out infinite",
        "drift-reverse": "driftReverse 26s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
