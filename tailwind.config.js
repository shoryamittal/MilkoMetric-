/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B1F1D',
          soft: '#4A5450',
          faint: '#8A928E',
        },
        canvas: {
          DEFAULT: '#FAFAF7',
          raised: '#FFFFFF',
          sunken: '#F2F1EB',
        },
        line: {
          DEFAULT: '#E4E2D8',
          soft: '#EDEBE1',
        },
        pasture: {
          50: '#F1F6F1',
          100: '#DEEBDF',
          300: '#9AC3A0',
          500: '#3E7C52',
          600: '#2F6B44',
          700: '#245537',
        },
        signal: {
          blue: '#2B5FA8',
          blueSoft: '#E9F0FA',
          amber: '#B3690E',
          amberSoft: '#FBF0E1',
          red: '#B23A34',
          redSoft: '#FBEAE8',
          critical: '#7E1F1B',
          criticalSoft: '#F5E1DF',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', '"Noto Sans Devanagari"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '22px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,31,29,0.04), 0 1px 0 rgba(27,31,29,0.03)',
        pop: '0 8px 24px rgba(27,31,29,0.10)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        riseIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        riseIn: 'riseIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
}
