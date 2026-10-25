import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { boxShadow: { panel: '0 18px 45px rgba(0,0,0,.22)' } } },
  plugins: [],
};
export default config;
