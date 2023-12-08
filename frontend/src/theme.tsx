import type { Theme } from 'theme-ui';
import { mix } from 'polished';

const primary = '#0051ae';
const secondary = '#009824';
const text = '#000';
const background = '#fff';

export const theme: Theme = {
  breakpoints: ['40em', '52em', '64em'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: '"Avenir Next", inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  colors: {
    text: text,
    text100: mix(0.1, text, '#fff'),
    text200: mix(0.2, text, '#fff'),
    text400: mix(0.4, text, '#fff'),
    text800: mix(0.8, text, '#fff'),
    background: background,
    primary: primary,
    primary400: mix(0.4, primary, '#fff'),
    primary800: mix(0.8, primary, '#fff'),
    secondary: secondary,
    secondary400: mix(0.4, secondary, '#fff'),
    secondary800: mix(0.8, secondary, '#fff'),
    muted: '#f6f6f6',
  },
  text: {
    heading: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    h1: {
      variant: 'text.heading',
      fontSize: 5,
    },
    h2: {
      variant: 'text.heading',
      fontSize: 4,
    },
    h3: {
      variant: 'text.heading',
      fontSize: 3,
    },
    h4: {
      variant: 'text.heading',
      fontSize: 2,
    },
    h5: {
      variant: 'text.heading',
      fontSize: 1,
    },
    h6: {
      variant: 'text.heading',
      fontSize: 0,
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
  },
  buttons: {
    primary: {
      color: 'background',
      bg: 'primary',
      filter: 'drop-shadow(1px 2px 3px var(--theme-ui-colors-primary400))',
      '&:hover': {
        bg: 'primary800',
        cursor: 'pointer',
      },
    },
    secondary: {
      color: 'background',
      bg: 'secondary',
      filter: 'drop-shadow(1px 2px 3px var(--theme-ui-colors-secondary400))',
      '&:hover': {
        bg: 'secondary800',
        cursor: 'pointer',
      },
    },
    outline: {
      color: 'text',
      bg: 'background',
      border: '1px solid',
      borderColor: 'text200',
      filter: 'drop-shadow(1px 2px 3px var(--theme-ui-colors-text400))',
      '&:hover': {
        bg: 'text200',
        cursor: 'pointer',
      },
    },
    close: {
      variant: 'buttons.outline',
      px: 2,
      py: 1,
      fontFamily: 'monospace',
      fontSize: 4,
      lineHeight: 1,
    },
  },
  forms: {
    input: {
      borderColor: 'gray',
      '&:focus': {
        borderColor: 'primary',
        boxShadow: (t) => `0 0 0 2px ${t.colors?.primary}`,
        outline: 'none',
      },
      '&:hover': {
        cursor: 'pointer',
      },
      p: 1,
    },
    select: {
      fontSize: 2,
      borderColor: 'gray',
      '&:focus': {
        borderColor: 'primary',
        boxShadow: (t) => `0 0 0 2px ${t.colors?.primary}`,
        outline: 'none',
      },
      '&:hover': {
        cursor: 'pointer',
      },
      p: 1,
      pr: 4,
      textOverflow: 'ellipsis',
      minWidth: 'max-content',
      width: 'max-content',
    },
    textarea: {
      borderColor: 'gray',
      '&:focus': {
        borderColor: 'primary',
        boxShadow: (t) => `0 0 0 2px ${t.colors?.primary}`,
        outline: 'none',
      },
      p: 1,
    },
    label: {
      fontSize: 1,
      fontWeight: 'bold',
      '&:has(input[type="radio"])': {
        '&:hover': {
          cursor: 'pointer',
        },
      },
      '&:has(input[type="checkbox"])': {
        '&:hover': {
          cursor: 'pointer',
        },
      },
    },
  },
  config: {
    useBorderBox: true,
  },
};
