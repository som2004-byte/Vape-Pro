module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kali / Cyber-ghost inspired palette
        darkPurple: {
          // Deep navy / midnight background tones
          950: '#020617', // almost black with blue hint
          900: '#02081F',
          800: '#030A2A',
          700: '#050F3A',
          // Purple accent spectrum
          600: '#5B21FF',
          500: '#7C3AED',
          400: '#A855F7',
          300: '#C4B5FD',
          100: '#E5E7FF',
        },
        // Primary accent gradient: cyan / electric blue
        yellowGradient: {
          start: '#22D3EE', // cyan-400
          end: '#38BDF8',   // sky-400
        },
      },
    },
  },
  plugins: [],
}
