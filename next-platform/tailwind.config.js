/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#263A3A',
                accent: '#B86E58',
                paper: '#F7F5EF',
                gold: '#C5A065',
                sage: '#94A696',
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
