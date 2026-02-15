/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vein: {
          50: '#e0fffe',
          100: '#b3fffc',
          200: '#80fff9',
          300: '#4dfff6',
          400: '#00e5ff',
          500: '#00bcd4',
          600: '#0097a7',
          700: '#00796b',
          800: '#004d40',
          900: '#002622',
        },
        surface: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#151d38',
          600: '#1c2647',
          500: '#243056',
        },
        danger: '#ef4444',
        warning: '#eab308',
        success: '#22c55e',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Exo 2"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan-line': 'scanLine 2.5s ease-in-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', filter: 'brightness(1)' },
          '50%': { opacity: '0.9', filter: 'brightness(1.3)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'vein': '0 0 20px rgba(0, 229, 255, 0.3)',
        'vein-strong': '0 0 40px rgba(0, 229, 255, 0.5)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
