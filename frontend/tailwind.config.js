module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0faf0',
          100: '#dcf0dc',
          200: '#bbe3bb',
          300: '#8ecf8e',
          400: '#5db55d',
          500: '#3a9a3a',
          600: '#2d7d2d',
          700: '#236323',
          800: '#1e5020',
          900: '#1a431c',
        },
        forest: {
          50: '#f0f7f1',
          100: '#d8eddb',
          200: '#b3dab8',
          300: '#80be89',
          400: '#4d9e59',
          500: '#2d7d32',
          600: '#1e6623',
          700: '#1a5220',
          800: '#16421b',
          900: '#0d2b11',
        },
        amber: {
          50: '#fff8f0',
          100: '#feebd5',
          200: '#fdd4a8',
          300: '#fbb872',
          400: '#f99640',
          500: '#f77c1c',
          600: '#e86010',
          700: '#c14c0d',
          800: '#9a3e12',
          900: '#7d3312',
        },
        nature: {
          cream: '#faf7f0',
          leaf: '#4a7c4a',
          bark: '#8b6914',
          earth: '#6b4c2a',
          sky: '#e8f5e9',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
