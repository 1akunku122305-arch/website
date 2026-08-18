import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        light: {
          background: '#ffffff',
          surface: '#f8f8f8',
          'surface-muted': '#f3f3f3',
          border: '#e5e5e5',
          'text-primary': '#111111',
          'text-secondary': '#666666',
          'text-muted': '#888888',
          accent: '#111111',
        },
        dark: {
          background: '#0a0a0a',
          surface: '#111111',
          'surface-muted': '#171717',
          border: '#2a2a2a',
          'text-primary': '#f5f5f5',
          'text-secondary': '#a3a3a3',
          'text-muted': '#737373',
          accent: '#ffffff',
        },
        semantic: {
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          info: '#2563eb',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
