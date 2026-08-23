/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          active: "#cdffad",
          neutral: "#c5edab",
          pale: "#e2f6d5",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Wise System Specific Tokens
        wise: {
          primary: "#9fe870",
          "primary-active": "#cdffad",
          "primary-pale": "#e2f6d5",
          ink: "#0e0f0c",
          "ink-deep": "#163300",
          body: "#454745",
          mute: "#868685",
          canvas: "#ffffff",
          "canvas-soft": "#e8ebe6",
          positive: "#2ead4b",
          "positive-deep": "#054d28",
          warning: "#ffd11a",
          "warning-deep": "#b86700",
          negative: "#d03238",
          "negative-deep": "#a72027",
        },

        entrada: "var(--color-entrada)",
        saida: "var(--color-saida)",
        primaria: "var(--color-primaria)",
        laranja: "var(--color-laranja)",
        azul: "var(--color-azul)",
        ink: "var(--color-ink)",
        surface: "var(--color-surface)",
        "surface-variant": "var(--color-surface-variant)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        line: "var(--color-line)",
        outline: "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",
        "input-surface": "var(--bg-input)",
      },
      borderRadius: {
        none: "0px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "24px",
        "3xl": "24px",
        pill: "9999px",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "SF Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(14, 15, 12, 0.04)",
        "card-hover": "0 8px 24px rgba(14, 15, 12, 0.08)",
        elevation: "0 10px 30px rgba(14, 15, 12, 0.12)",
      },
    },
  },
  plugins: [],
};
