import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#DFE968',
          50: '#FAFCE6',
          100: '#F5F9CC',
          200: '#EBF499',
          300: '#DFE968',
          400: '#D2DE38',
          500: '#B8C51D',
          600: '#8E9816',
        },
        cream: {
          DEFAULT: '#FBF1CF',
          50: '#FDFBF4',
          100: '#FBF6DF',
          200: '#FBF1CF',
          300: '#F7E7A8',
        },
        blush: {
          DEFAULT: '#F6C8D6',
          50: '#FDF5F8',
          100: '#FBE6ED',
          200: '#F6C8D6',
          300: '#EEA2B9',
        },
        peach: {
          DEFAULT: '#F3A878',
          50: '#FDF6F1',
          100: '#FAECE2',
          200: '#F7D4BE',
          300: '#F3A878',
          400: '#EF823C',
        },
        cta: {
          DEFAULT: '#F6BB84',
          hover: '#F4AB69',
        },
        ink: {
          DEFAULT: '#1C1C1C',
          light: '#333333',
          muted: '#555555',
        },
        card: {
          cream: '#FBF6DF',
        },
        utility: {
          success: '#557A50',
          warning: '#9A6A2F',
          error: '#A84B4B',
          info: '#596D85',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        script: ['Yellowtail', 'cursive'],
        editorial: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'pill': '999px',
        'card': '28px',
        'card-lg': '36px',
        'card-sm': '16px',
        'blob': '40% 60% 70% 30% / 40% 50% 60% 50%',
      },
      boxShadow: {
        'editorial': '0 8px 24px rgba(28, 28, 28, 0.07)',
        'editorial-hover': '0 12px 32px rgba(28, 28, 28, 0.12)',
        'card-subtle': '0 4px 16px rgba(28, 28, 28, 0.05)',
      },
      borderWidth: {
        '1.5': '1.5px',
      }
    },
  },
  plugins: [],
};

export default config;
