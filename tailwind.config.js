/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0c0f24",
          card: "#131738",
          cardSoft: "#181d45",
          border: "#232a5c",
          borderGlow: "#2e3778",
          cyan: "#00f5d4",
          blue: "#38bdf8",
          purple: "#7c3aed",
          indigo: "#4f46e5",
          pink: "#f43f5e",
          green: "#10b981",
          text: "#f8fafc",
          muted: "#94a3b8"
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 245, 212, 0.4)',
        'neon-blue': '0 0 20px -3px rgba(56, 189, 248, 0.4)',
        'neon-purple': '0 0 20px -3px rgba(124, 58, 237, 0.4)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
