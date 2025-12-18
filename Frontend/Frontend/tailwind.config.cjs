module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        darkPurple: {
          950: '#05000A', // A very dark purple, almost black
          900: '#10001A',
          800: '#1A002A',
          700: '#250035',
          600: '#300045',
          500: '#3A0054',
          400: '#450060',
          300: '#50006B',
          100: '#A000E0', // Lighter shade for text
        },
        yellowGradient: { 
          'start': '#FFD700',
          'end': '#FFA500',
        },
      },
    },
  },
  plugins: [],
}
