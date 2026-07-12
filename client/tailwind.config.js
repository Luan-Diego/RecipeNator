/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base quente
        cream: '#FBF3E8',
        paper: '#FFFAF3',
        sand: '#F1E2CC',
        line: '#EBD9BF',
        espresso: '#2A1710',
        roast: '#5B3420',
        cacau: '#6B4A38',
        caramel: '#9A4F12',
        // Acentos
        tomato: '#B8321C',
        chili: '#8F2415',
        saffron: '#F2B233',
        paprika: '#E0702B',
        // Verde: SOMENTE para vegetariano/vegano
        herb: '#2F6B3F',
        'herb-deep': '#1F4A2B',
        leaf: '#5FA05A',
        mint: '#E6F0DC',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '28px',
      },
    },
  },
  plugins: [],
};
