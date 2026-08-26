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
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '28px',
        pill: '100px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.04)',
        elevated: 'var(--shadow)',
        elevation: 'var(--shadow)',
      },
    },
  },
  plugins: [],
};
