/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void:  { 950:'#050408', 900:'#090710', 800:'#100e1c', 700:'#161428', 600:'#1e1b33', 500:'#28244a' },
        cyan:  { DEFAULT:'#06b6d4', dim:'#0891b2' },
        lum:   '#e2e8f0',
        ghost: '#94a3b8',
        shade: '#475569',
      },
      animation: {
        'fade-up':   'fadeUp .55s cubic-bezier(.22,1,.36,1) both',
        'beam':      'beam 2.8s linear infinite',
        'pulse-slow':'pulseSlow 3s ease-in-out infinite',
        'ticker':    'ticker 28s linear infinite',
      },
      keyframes: {
        fadeUp:    { from:{ opacity:'0', transform:'translateY(18px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        beam:      { from:{ transform:'translateX(-100%) skewX(-12deg)' }, to:{ transform:'translateX(300%) skewX(-12deg)' } },
        pulseSlow: { '0%,100%':{ opacity:'.4' }, '50%':{ opacity:'.9' } },
        ticker:    { from:{ transform:'translateX(0)' }, to:{ transform:'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
}
