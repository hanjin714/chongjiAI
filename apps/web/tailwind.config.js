/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#f9d7a5',
          300: '#f5b96d',
          400: '#f09232',
          500: '#ec7412',
          600: '#dd5a08',
          700: '#b74209',
          800: '#92350f',
          900: '#772d10',
        },
        pet: {
          orange: '#FF8C42',
          pink: '#FF6B9D',
          blue: '#4ECDC4',
          purple: '#A855F7',
          yellow: '#FBBF24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
