import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        'georgia12': ['Georgia12', 'serif'],
        'georgia10': ['Georgia10', 'serif'],
        'courier12': ['Courier12', 'monospace'],
        'ttw': ['TravelingTypewriter', 'monospace'],
      },
      colors: {
        'primary': '#A20100',
        'secondary': '#FFF900',
        'tertiary': '#FFF7E2',
        'accent': '#280000',
        'ptype': '#F6FF00',
        'ntype': '#B60000',
        'metal': '#DADADA',
      },
    },
  },
  plugins: [],
} satisfies Config
