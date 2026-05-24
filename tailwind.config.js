/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#F7F5F0',
        surface: '#FFFFFF',
        border:  '#E2DDD4',
        accent:  '#1C4532',
        accentM: '#276749',
        accentL: '#EBF5EE',
        text:    '#18181B',
        muted:   '#71717A',
        hint:    '#A1A1AA',
        warn:    '#92400E',
        warnL:   '#FFFBEB',
        amber:   '#D97706',
        blue:    '#1E40AF',
        blueL:   '#EFF6FF',
      },
      fontFamily: {
        serif: ['Literata', 'Georgia', 'serif'],
        sans:  ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
