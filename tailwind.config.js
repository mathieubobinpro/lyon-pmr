/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:  '#0066FF',
        success:  '#00C853',
        warning:  '#FF8800',
        dark:     '#1A1A1A',
        mid:      '#6B7280',
        light:    '#F5F5F7',
        card:     { DEFAULT: '#FFFFFF', dark: '#1C1C20' },
        app:      { DEFAULT: '#F5F5F7', dark: '#0F0F12' },
        border:   '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', '1.3'],
        xs:    ['13px', '1.4'],
        sm:    ['14px', '1.5'],
        base:  ['17px', '1.5'],
        lg:    ['18px', '1.4'],
        xl:    ['20px', '1.3'],
        '2xl': ['22px', '1.25'],
        '3xl': ['28px', '1.2'],
        '4xl': ['34px', '1.1'],
        '5xl': ['52px', '1'],
      },
      borderRadius: {
        card:   '16px',
        sheet:  '20px',
        btn:    '24px',
        badge:  '20px',
      },
      boxShadow: {
        card:   '0 4px 12px rgba(0,0,0,0.08)',
        sheet:  '0 -4px 24px rgba(0,0,0,0.14)',
        btn:    '0 4px 20px rgba(0,102,255,0.35)',
        fab:    '0 4px 14px rgba(0,0,0,0.18)',
        marker: '0 2px 8px rgba(0,0,0,0.2)',
      },
      minHeight: {
        touch: '56px',
        cta:   '64px',
        fab:   '56px',
      },
      minWidth: {
        touch: '56px',
      },
    },
  },
  plugins: [],
};
