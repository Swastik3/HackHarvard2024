/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4a90e2',
          DEFAULT: '#3a7bc8',
          dark: '#2a66ae',
        },
        secondary: {
          light: '#43cea2',
          DEFAULT: '#33b989',
          dark: '#23a470',
        },
      },
      gradientColorStops: theme => ({
        ...theme('colors'),
        'primary-start': '#4a90e2',
        'primary-end': '#43cea2',
      }),
    },
  },
  plugins: [],
}