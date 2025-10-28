/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0B1220',
        cyan: '#13B0E6',
        amber: '#FFC857',
        ink: '#E5EAF2',
        primary: '#13B0E6',
        secondary: '#FFC857',
        dark: '#0B1220',
        light: '#E5EAF2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

