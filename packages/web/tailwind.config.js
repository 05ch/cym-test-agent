/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071e3',
          'blue-hover': '#0077ED',
          'blue-light': 'rgba(0, 113, 227, 0.12)',
          teal: '#30b0c7',
          green: '#34c759',
          'green-light': 'rgba(52, 199, 89, 0.12)',
          amber: '#ff9500',
          'amber-light': 'rgba(255, 149, 0, 0.12)',
          red: '#ff3b30',
          'red-light': 'rgba(255, 59, 48, 0.12)',
          gray: '#86868b',
          'gray-light': '#f5f5f7',
          'gray-dark': '#1d1d1f',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          '"JetBrains Mono"',
          'monospace'
        ],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '22px',
        '4xl': '28px',
      },
      boxShadow: {
        'apple-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'apple-card': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px 0 rgba(0, 0, 0, 0.03)',
        'apple-glass': '0 20px 40px -8px rgba(0, 0, 0, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
        'apple-glass-dark': '0 20px 40px -8px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        'apple-blue': '0 8px 20px -4px rgba(0, 113, 227, 0.35)',
      }
    },
  },
  plugins: [],
}
