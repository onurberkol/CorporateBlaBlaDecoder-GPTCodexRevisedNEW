import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F1EA',
        card: '#FBFAF6',
        surfaceAlt: '#EDE7DA',
        line: '#DDD4C3',
        ink: '#1A1714',
        inkText: '#221F1B',
        inkSoft: '#6B6358',
        muted: '#A89E8E',
        red: '#BC3B2E',
        redWash: '#F6E3DF',
        redText: '#8E2A20',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
