/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: [
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        'coder-dark': '#0d0d0d',
        'coder-surface': '#1a1a1a',
        'neon-blue': '#3ABEFF',
        'soft-white': '#F1F5F9',
      },
      animation: {
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': {
            textShadow: '0 0 5px #3ABEFF, 0 0 10px #3ABEFF, 0 0 15px #3ABEFF',
            boxShadow: '0 0 5px #3ABEFF',
          },
          '100%': {
            textShadow: '0 0 10px #3ABEFF, 0 0 20px #3ABEFF, 0 0 30px #3ABEFF',
            boxShadow: '0 0 10px #3ABEFF, 0 0 20px #3ABEFF',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
          },
          '50%': {
            boxShadow:
              '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)',
          },
        },
      },
    },
  },
  plugins: [],
};
