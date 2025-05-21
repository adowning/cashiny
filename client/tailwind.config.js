// apps/client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', // Scan Vue and JS/TS files for Tailwind classes
  ],
  theme: {
    extend: {
      // You can extend Tailwind's default theme here
      // colors: {
      //   primary: '#...',
      // },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // Optional: if you need form styling plugin
  ],
}
