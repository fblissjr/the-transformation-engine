/** @type {import('tailwindcss').Config} */
/**
 * Tailwind CSS Configuration
 *
 * Defines the content sources to scan for utility classes
 * and extends the default theme with custom animations and keyframes.
 */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        slideDown: 'slideDown 0.2s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
