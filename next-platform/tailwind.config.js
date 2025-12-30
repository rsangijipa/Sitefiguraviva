const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            colors: {
                gray: colors.stone, // Enforce organic gray
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)',
                'accent-light': 'var(--color-accent-light)',
                paper: 'var(--color-paper)',
                surface: 'var(--color-surface)',
                text: 'var(--color-text)',
                muted: 'var(--color-muted)',
                gold: 'var(--color-gold)',
                'gold-light': 'var(--color-gold-light)',
                'gold-dark': 'var(--color-gold-dark)',
                beige: 'var(--color-beige)',
            },
            fontFamily: {
                serif: ['var(--font-serif)', 'serif'],
                sans: ['var(--font-sans)', 'sans-serif'],
            },
            fontSize: {
                'fluid-h1': 'clamp(2.5rem, 5vw, 4.5rem)',
                'fluid-h2': 'clamp(2rem, 4vw, 3.5rem)',
                'fluid-h3': 'clamp(1.5rem, 3vw, 2.5rem)',
                'fluid-body': 'clamp(1rem, 1.5vw, 1.125rem)',
            },
            boxShadow: {
                'soft-sm': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'soft-md': '0 8px 30px rgba(0, 0, 0, 0.04)',
                'soft-lg': '0 20px 40px rgba(0, 0, 0, 0.06)',
                'soft-xl': '0 30px 60px -10px rgba(0, 0, 0, 0.08)',
                'glow-gold': '0 0 20px rgba(176, 141, 85, 0.3)',
            },
            borderRadius: {
                'organic-1': '60% 40% 30% 70% / 60% 30% 70% 40%',
                'organic-2': '50% 50% 20% 80% / 25% 80% 20% 75%',
                'organic-3': '30% 70% 70% 30% / 30% 30% 70% 70%',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'scale-in': 'scaleIn 0.5s ease-out forwards',
                'slide-in-right': 'slideInRight 0.5s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                }
            }
        },
    },
    plugins: [],
}
