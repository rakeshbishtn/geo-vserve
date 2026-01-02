/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vserve-navy': '#0a1628',
        'vserve-dark': '#0f2137',
        'vserve-orange': '#ff6b35',
        'vserve-orange-dark': '#e55a2b',
        'vserve-blue': '#3b82f6',
        'vserve-purple': '#8b5cf6',
        'vserve-green': '#10b981',
        'vserve-red': '#ef4444',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'gradient': 'gradient 8s ease infinite',
        'score-fill': 'scoreFill 1.5s ease-out forwards',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
      },
    },
  },
  plugins: [],
}
