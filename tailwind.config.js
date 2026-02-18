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
          50: '#e8edf5',
          100: '#c5d1e8',
          200: '#9eb3d8',
          300: '#7795c8',
          400: '#5a7ebc',
          500: '#3d67b0',
          600: '#2a5298',
          700: '#1D3F87',
          800: '#163266',
          900: '#0f2445',
        },
        secondary: {
          50: '#faf8f3',
          100: '#f5f0e3',
          200: '#e8dfc7',
          300: '#dccfab',
          400: '#d4b36a',
          500: '#C5A25D',
          600: '#a88a4e',
          700: '#8b723f',
          800: '#6e5a30',
          900: '#514221',
        },
        gold: {
          50: '#faf8f3',
          100: '#f5f0e3',
          200: '#E5D1A2',
          300: '#d4b36a',
          400: '#C5A25D',
          500: '#a88a4e',
          600: '#8b723f',
          700: '#6e5a30',
          800: '#514221',
          900: '#342b15',
        },
        navy: {
          50: '#e8edf5',
          100: '#c5d1e8',
          200: '#9eb3d8',
          300: '#7795c8',
          400: '#5a7ebc',
          500: '#3d67b0',
          600: '#2a5298',
          700: '#1D3F87',
          800: '#163266',
          900: '#0f2445',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 