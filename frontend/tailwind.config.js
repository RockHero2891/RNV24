/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: { 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
        warning: { 400: '#facc15', 500: '#eab308', 600: '#ca8a04' },
        danger:  { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / .07), 0 1px 2px -1px rgb(0 0 0 / .07)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / .10), 0 2px 4px -2px rgb(0 0 0 / .08)',
        'input-focus': '0 0 0 3px rgb(37 99 235 / .15)',
      },
      keyframes: {
        'fade-in':  { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        'slide-in': { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'none' } },
        pulse2:     { '0%,100%': { opacity: '1' }, '50%': { opacity: '.4' } },
        'progress-shine': {
          from: { backgroundPosition: '200% center' },
          to:   { backgroundPosition: '-200% center' },
        },
      },
      animation: {
        'fade-in':  'fade-in .25s ease both',
        'slide-in': 'slide-in .2s ease both',
        pulse2:     'pulse2 1.6s ease-in-out infinite',
        'progress-shine': 'progress-shine 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
