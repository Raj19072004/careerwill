/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7d0c7',
          300: '#a3b2a3',
          400: '#7a8f7a',
          500: '#5c735c',
          600: '#475a47',
          700: '#3a483a',
          800: '#2f3a2f',
          900: '#283128',
        },
        cream: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fdf2e7',
          300: '#fbe8d4',
          400: '#f8d9b8',
          500: '#f4c795',
          600: '#eeb06f',
          700: '#e5954a',
          800: '#d97f35',
          900: '#b8672d',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flow': 'flow 8s linear infinite',
        'rice-float': 'riceFloat 10s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(236, 72, 153, 0.6)' },
        },
        flow: {
          '0%': { transform: 'translateY(-100vh) translateX(0px)' },
          '100%': { transform: 'translateY(100vh) translateX(50px)' },
        },
        riceFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(90deg)' },
          '50%': { transform: 'translateY(-5px) rotate(180deg)' },
          '75%': { transform: 'translateY(-15px) rotate(270deg)' },
        }
      }
    },
  },
  plugins: [],
};