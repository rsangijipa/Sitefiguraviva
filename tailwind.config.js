/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#263A3A', // Deep Green (Brand)
        accent: '#B86E58',  // Terracotta
        paper: '#FAFAF9',   // Light Cream (New Background)
        surface: '#FFFFFF', // Pure White (Cards)
        text: '#374151',    // Dark Gray (Body)
        muted: '#9CA3AF',   // Gray (Secondary)
        gold: '#C5A065',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Lato', 'sans-serif'],
      },
      borderRadius: {
        'organic-1': '60% 40% 30% 70% / 60% 30% 70% 40%',
        'organic-2': '50% 50% 20% 80% / 25% 80% 20% 75%',
        'organic-3': '30% 70% 70% 30% / 30% 30% 70% 70%',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
