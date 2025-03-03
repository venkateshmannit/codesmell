/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        ulp: ['-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica', 'sans-serif'],
      },
      colors: {
        textPrimary: 'rgb(30, 33, 42)', // Adding text color globally
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
