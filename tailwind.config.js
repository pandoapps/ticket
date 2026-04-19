/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './{main,App}.{ts,tsx}',
    './{pages,components,hooks,utils,services}/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dde8ff',
          200: '#bed2ff',
          300: '#91b0ff',
          400: '#6186ff',
          500: '#3b61ff',
          600: '#2541f5',
          700: '#1d31dc',
          800: '#1d2cb0',
          900: '#1e2a8a',
        },
        accent: {
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
      },
      backgroundImage: {
        'app-gradient':
          'radial-gradient(1200px 600px at -10% -20%, rgba(125,123,255,0.35), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(217,70,239,0.25), transparent 55%), radial-gradient(800px 500px at 50% 120%, rgba(59,97,255,0.25), transparent 60%), linear-gradient(180deg, #f7f8ff 0%, #eef0ff 100%)',
        'hero-fade':
          'linear-gradient(180deg, rgba(10,12,40,0.1) 0%, rgba(10,12,40,0.55) 60%, rgba(10,12,40,0.85) 100%)',
      },
      boxShadow: {
        glass: '0 10px 30px -10px rgba(30, 42, 138, 0.25), 0 2px 6px -2px rgba(30, 42, 138, 0.1)',
        'glass-lg': '0 30px 60px -20px rgba(30, 42, 138, 0.25), 0 8px 20px -8px rgba(30, 42, 138, 0.15)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
