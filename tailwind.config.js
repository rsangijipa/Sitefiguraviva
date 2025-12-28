/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#412726', // Vinho Profundo (Base forte)
        secondary: '#7A5A54', // Vinho Médio
        accent: '#5D7052',  // Verde Botânico Escuro (Ajustado para contraste AA)
        'accent-light': '#AABEAB', // Verde Botânico Claro (Backgrounds)
        paper: '#F8F1E5',   // Off-white Papel (Base quente)
        surface: '#FBFAEC', // Off-white Claro (Cards)
        text: '#212328',    // Grafite (Leitura)
        muted: '#8C8C8C',   // Cinza Neutro
        gold: '#B08D55',    // Dourado Escurecido (Para texto/ícones - Contraste melhor)
        'gold-light': '#EAE4A6', // Amarelo (Detalhes/Bg)
        beige: '#E4CDB4',   // Bege

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
