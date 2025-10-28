/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Enable class-based dark mode (light mode disabled by default)
  theme: {
    extend: {
      colors: {
        // Hikvision Brand Colors
        'hik-red': {
          DEFAULT: '#E30613', // Hikvision signature red
          50: '#FEE2E2',
          100: '#FECACA',
          200: '#FCA5A5',
          300: '#F87171',
          400: '#EF4444',
          500: '#E30613', // Primary
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#6B1B1B',
        },
        // Professional Grays
        'slate-custom': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Semantic Colors
        primary: {
          DEFAULT: '#E30613',
          light: '#EF4444',
          dark: '#B91C1C',
        },
        secondary: {
          DEFAULT: '#1F2937',
          light: '#374151',
          dark: '#111827',
        },
        accent: {
          DEFAULT: '#10B981', // Success green
          blue: '#3B82F6',
          yellow: '#F59E0B',
        },
        // Legacy support (keeping old names for backward compatibility)
        base: '#0F172A',
        cyan: '#3B82F6',
        amber: '#F59E0B',
        ink: '#F1F5F9',
        dark: '#0F172A',
        light: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(to bottom right, #0F172A, #1E293B)',
        'gradient-light': 'linear-gradient(to bottom right, #F8FAFC, #E2E8F0)',
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(227, 6, 19, 0.3)',
        'dark-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}

