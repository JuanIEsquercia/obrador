import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Design System "The Digital Foreman" ──────────────────────
        primary:                     '#003e6f',
        'primary-container':         '#005596',
        'primary-fixed':             '#d3e4ff',
        'primary-fixed-dim':         '#a2c9ff',
        'on-primary':                '#ffffff',
        'on-primary-container':      '#a4caff',
        'on-primary-fixed':          '#001c38',
        'on-primary-fixed-variant':  '#004881',
        'inverse-primary':           '#a2c9ff',

        secondary:                        '#855300',
        'secondary-container':            '#fea619',
        'secondary-fixed':                '#ffddb8',
        'secondary-fixed-dim':            '#ffb95f',
        'on-secondary':                   '#ffffff',
        'on-secondary-container':         '#684000',
        'on-secondary-fixed':             '#2a1700',
        'on-secondary-fixed-variant':     '#653e00',

        tertiary:                         '#26404b',
        'tertiary-container':             '#3d5762',
        'tertiary-fixed':                 '#cbe7f5',
        'tertiary-fixed-dim':             '#afcbd8',
        'on-tertiary':                    '#ffffff',
        'on-tertiary-container':          '#b0ccd9',
        'on-tertiary-fixed':              '#021f29',
        'on-tertiary-fixed-variant':      '#304a55',

        surface:                          '#f8f9fa',
        'surface-dim':                    '#d9dadb',
        'surface-bright':                 '#f8f9fa',
        'surface-variant':                '#e1e3e4',
        'surface-tint':                   '#1b60a2',
        'surface-container-lowest':       '#ffffff',
        'surface-container-low':          '#f3f4f5',
        'surface-container':              '#edeeef',
        'surface-container-high':         '#e7e8e9',
        'surface-container-highest':      '#e1e3e4',
        'inverse-surface':                '#2e3132',
        'inverse-on-surface':             '#f0f1f2',

        'on-surface':                     '#191c1d',
        'on-surface-variant':             '#414750',
        'on-background':                  '#191c1d',
        background:                       '#f8f9fa',

        outline:                          '#727781',
        'outline-variant':                '#c1c7d2',

        error:                            '#ba1a1a',
        'error-container':                '#ffdad6',
        'on-error':                       '#ffffff',
        'on-error-container':             '#93000a',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
