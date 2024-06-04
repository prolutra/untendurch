import daisyui from "daisyui"

/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /bg-safety/,
    }
  ],
  theme: {
    extend: {
      colors: {
        'safety-NO_RISK': '#059840',
        'safety-LOW_RISK': '#D8C300',
        'safety-MEDIUM_RISK': '#FD8800',
        'safety-HIGH_RISK': '#D02500',
        'safety-VERY_HIGH_RISK': '#7500D1',
      },
    },
  },
  daisyui: {
    themes: [{
      light: {
        ...require("daisyui/src/theming/themes")["light"],
        primary: "#0290b0",
        'primary-content': "#ffffff",
        secondary: "#4c0e8e",
        'secondary-content': "#ffffff",
        '--input-size-xs': '1rem',
        '--input-size-sm': '1.5rem',
        '--input-size-md': '2rem',
        '--input-size-lg': '3rem',
        '.btn,.btn-md': {
          'height': 'var(--input-size-md)',
          'min-height': 'var(--input-size-md)',
        },
        '.btn-xs': {
          'height': 'var(--input-size-xs)',
          'min-height': 'var(--input-size-xs)',
        },
        '.btn-sm': {
          'height': 'var(--input-size-sm)',
          'min-height': 'var(--input-size-sm)',
        },
        '.btn-lg': {
          'height': 'var(--input-size-lg)',
          'min-height': 'var(--input-size-lg)',
        },
        '.btn-square,.btn-circle': {
          'width': 'var(--input-size-md)',
        },
        '.btn-square.btn-xs,.btn-circle.btn-xs': {
          'width': 'var(--input-size-xs)',
        },
        '.btn-square.btn-sm,.btn-circle.btn-sm': {
          'width': 'var(--input-size-sm)',
        },
        '.btn-square.btn-lg,.btn-circle.btn-lg': {
          'width': 'var(--input-size-lg)',
        },
        '.file-input,.select,.input': {
          'min-height': 'var(--input-size-md)',
          'height': 'var(--input-size-md)',
        },
        '.file-input.file-input-xs,.select.select-xs,.input.input-xs': {
          'min-height': 'var(--input-size-xs)',
          'height': 'var(--input-size-xs)',
        },
        '.file-input.file-input-sm,.select.select-sm,.input.input-sm': {
          'min-height': 'var(--input-size-sm)',
          'height': 'var(--input-size-sm)',
        },
        '.file-input.file-input-lg,.select.select-lg,.input.input-lg': {
          'min-height': 'var(--input-size-lg)',
          'height': 'var(--input-size-lg)',
        },
      }}
    ]
  },
  plugins: [
    daisyui,
  ],
}
