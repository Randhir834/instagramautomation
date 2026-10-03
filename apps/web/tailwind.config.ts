import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Design tokens. Colours are checked for contrast: `ink` and `ink-soft` are
 * safe for text on white and paper; `ink-faint` is for icons and borders only.
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1160px' } },
    extend: {
      colors: {
        // shadcn/ui variables (see globals.css)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },

        // Brand palette
        paper: { DEFAULT: '#f7f4ee', deep: '#efeae0' },
        ink: { DEFAULT: '#1c1917', soft: '#57524b', faint: '#a39b8f' },
        line: { DEFAULT: '#e8e2d7', strong: '#d5cdbf' },
        brand: { DEFAULT: '#c43d22', dark: '#a0311a', tint: '#fbe9e3', soft: '#f5cfc3' },
        butter: { DEFAULT: '#f6d05c', dark: '#7a5a00', tint: '#fcf1cf' },
        sky: { DEFAULT: '#2f55d4', dark: '#1f3aa0', tint: '#e3e9fb' },
        rose: { DEFAULT: '#f29bb4', dark: '#9c2f52', tint: '#fde6ed' },
        moss: { DEFAULT: '#2f5d4a', dark: '#234638', tint: '#e2ede6' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        hand: ['var(--font-hand)', 'cursive'],
      },
      fontSize: {
        // Display sizes with tuned line-height and tracking.
        'display-sm': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-md': ['2.75rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.03', letterSpacing: '-0.025em' }],
        'display-xl': ['4.75rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(28, 25, 23, 0.06)',
        soft: '0 1px 2px rgba(28, 25, 23, 0.04), 0 2px 10px rgba(28, 25, 23, 0.05)',
        lift: '0 2px 4px rgba(28, 25, 23, 0.04), 0 14px 34px -10px rgba(28, 25, 23, 0.18)',
        pop: '0 30px 70px -24px rgba(28, 25, 23, 0.4), 0 8px 20px -8px rgba(28, 25, 23, 0.15)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        bob: 'bob 7s ease-in-out infinite',
        'bob-slow': 'bob 9s ease-in-out -3s infinite',
        'fade-up': 'fade-up 0.35s ease-out both',
      },
    },
  },
  plugins: [animate],
};

export default config;
