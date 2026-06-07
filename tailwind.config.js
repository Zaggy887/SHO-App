/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // `white` and the `ink` surface scale are variable-driven so the
        // light/dark theme toggle flips every screen automatically.
        white: 'rgb(var(--fg) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink-900) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
        },
        // Brand palette derived from the StrengthHub Online mockups
        brand: {
          DEFAULT: '#7ED957',
          50: '#f1fbe9',
          100: '#dff6c8',
          200: '#c2ee98',
          300: '#9fe264',
          400: '#7ED957',
          500: '#5cba36',
          600: '#469628',
          700: '#377322',
          800: '#2e5b20',
          900: '#284d1f',
        },
        accent: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          orange: '#F5A524',
          yellow: '#F5C518',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 24px -4px rgba(126,217,87,0.45)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
