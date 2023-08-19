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
    },
  },
  plugins: [],
} satisfies Config
