/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'system-ui', 'sans-serif'],
      },
      colors: {
        tn: {
          bg: '#0d1117',
          surface: '#161b22',
          surface2: '#1c2128',
          header: '#131f48',
          'header-border': '#1e2f6a',
          border: '#30363d',
          hover: '#21262d',
          accent: '#238636',
          'accent-hover': '#2ea043',
          'accent-muted': '#1a6326',
          text: '#e6edf3',
          'text-muted': '#8b949e',
          'text-subtle': '#6e7681',
          link: '#58a6ff',
          warning: '#d29922',
          error: '#f85149',
          success: '#238636',
        },
        forest: {
          50: '#f1f7f3',
          100: '#dceee2',
          200: '#bbddc8',
          300: '#8cc4a4',
          400: '#5ba47e',
          500: '#3c8861',
          600: '#2c6c4c',
          700: '#23563d',
          800: '#1d4533',
          900: '#16382a',
        },
      },
    },
  },
  plugins: [],
};
