/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        tablet: '810px',
        desktopWide: '1440px',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          active: 'var(--color-primary-active)',
          disabled: 'var(--color-primary-disabled)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* Wise Design System Specific Colors */
        'forest-ink': '#163300',
        'lime-voltage': '#9fe870',
        spruce: '#054d28',
        'linen-mist': '#e2f6d5',
        'signal-blue': '#0b4c72',
        'alarm-red': '#cb272f',
        charcoal: '#454745',
        obsidian: '#0e0f0c',
        pebble: '#868685',
        slate: '#6a6c6a',
        fog: '#e8ebe6',
        paper: '#ffffff',

        /* Legacy mapping compatibility */
        entrada: 'var(--color-entrada)',
        saida: 'var(--color-saida)',
        primaria: 'var(--color-primaria)',
        laranja: 'var(--color-laranja)',
        azul: 'var(--color-azul)',
        ink: 'var(--color-ink)',
        surface: 'var(--color-canvas)',
        'surface-variant': 'var(--color-surface-soft)',
        'surface-card': 'var(--color-surface-card)',
        'surface-strong': 'var(--color-surface-strong)',
        'surface-subtle': 'var(--color-surface-subtle)',
        'on-surface': 'var(--color-ink)',
        'on-surface-variant': 'var(--color-body)',
        line: 'var(--color-hairline)',
        outline: 'var(--color-muted)',
        'outline-variant': 'var(--color-muted-soft)',
        'input-surface': 'var(--color-surface-card)',
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '10px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '28px',
        pill: '100px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'wise-sans': ['Wise Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Wise Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow)',
        'card-hover': '0 4px 16px rgba(22, 51, 0, 0.08)',
        elevated: 'var(--shadow)',
        elevation: 'var(--shadow)',
        subtle: 'rgba(14, 15, 12, 0.12) 0px 0px 0px 1px',
      },
    },
  },
  plugins: [],
};
