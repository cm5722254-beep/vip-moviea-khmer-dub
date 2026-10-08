/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // =====================================================================
      // CINEMATIC COLOR PALETTE — Dark Royal Gold Theme
      // =====================================================================
      colors: {
        // Base backgrounds
        cinema: {
          bg:       '#0a0a0f',   // Primary deep black
          secondary:'#12121a',   // Secondary background
          card:     '#1a1a24',   // Card / panel background
          elevated: '#22222e',   // Elevated card (modals, popovers)
          border:   '#2a2a3a',   // Subtle borders
          muted:    '#3a3a4e',   // Muted/disabled elements
        },

        // Gold accent system
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f5c842',   // Bright gold highlight
          500: '#d4af37',   // Primary gold accent
          600: '#b8960c',
          700: '#92710a',
          800: '#6b5208',
          900: '#4a3906',
          950: '#2a1f03',
        },

        // Text hierarchy
        text: {
          primary:   '#f0e6c8',  // Warm white / parchment
          secondary: '#b8a882',  // Muted gold-toned text
          muted:     '#6b6282',  // Very muted
          inverse:   '#0a0a0f',  // Text on gold backgrounds
        },

        // Status colors adapted for dark theme
        success: {
          DEFAULT: '#22c55e',
          dark:    '#16a34a',
          light:   '#4ade80',
          bg:      '#052e16',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark:    '#d97706',
          light:   '#fcd34d',
          bg:      '#2d1a00',
        },
        error: {
          DEFAULT: '#ef4444',
          dark:    '#dc2626',
          light:   '#f87171',
          bg:      '#2d0a0a',
        },
        info: {
          DEFAULT: '#3b82f6',
          dark:    '#2563eb',
          light:   '#60a5fa',
          bg:      '#0a1929',
        },

        // Premium tier indicators
        tier: {
          free:    '#6b7280',
          premium: '#d4af37',
          vip:     '#a855f7',
        },
      },

      // =====================================================================
      // TYPOGRAPHY — Khmer-compatible fonts
      // =====================================================================
      fontFamily: {
        // Khmer script (primary for content)
        khmer: [
          '"Noto Serif Khmer"',
          '"Khmer OS"',
          '"Khmer OS Muol"',
          '"Hanuman"',
          '"Battambang"',
          'serif',
        ],
        // Khmer UI (sans-serif for UI elements)
        'khmer-sans': [
          '"Noto Sans Khmer"',
          '"Khmer OS Siemreap"',
          '"Hanuman"',
          'sans-serif',
        ],
        // Latin UI font
        sans: [
          '"Inter"',
          '"SF Pro Display"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        // Display / heading font
        display: [
          '"Cinzel"',
          '"Noto Serif Khmer"',
          '"Playfair Display"',
          'Georgia',
          'serif',
        ],
        // Mono
        mono: [
          '"Fira Code"',
          '"JetBrains Mono"',
          '"Cascadia Code"',
          'monospace',
        ],
      },

      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.5' }],
        'sm':   ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem',     { lineHeight: '1.7' }],   // Extra line height for Khmer
        'lg':   ['1.125rem', { lineHeight: '1.7' }],
        'xl':   ['1.25rem',  { lineHeight: '1.6' }],
        '2xl':  ['1.5rem',   { lineHeight: '1.5' }],
        '3xl':  ['1.875rem', { lineHeight: '1.4' }],
        '4xl':  ['2.25rem',  { lineHeight: '1.3' }],
        '5xl':  ['3rem',     { lineHeight: '1.2' }],
        '6xl':  ['3.75rem',  { lineHeight: '1.1' }],
      },

      // =====================================================================
      // SPACING & SIZING
      // =====================================================================
      spacing: {
        '4.5':  '1.125rem',
        '13':   '3.25rem',
        '15':   '3.75rem',
        '18':   '4.5rem',
        '22':   '5.5rem',
        '26':   '6.5rem',
        '30':   '7.5rem',
        '34':   '8.5rem',
        '88':   '22rem',
        '100':  '25rem',
        '112':  '28rem',
        '128':  '32rem',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top':    'env(safe-area-inset-top)',
      },

      // =====================================================================
      // BORDERS
      // =====================================================================
      borderRadius: {
        'xs':   '0.1875rem',
        '4xl':  '2rem',
        '5xl':  '2.5rem',
      },

      borderWidth: {
        '0.5': '0.5px',
        '3':   '3px',
      },

      // =====================================================================
      // SHADOWS — Cinematic glow effects
      // =====================================================================
      boxShadow: {
        'gold-sm':  '0 0 8px rgba(212, 175, 55, 0.25)',
        'gold':     '0 0 20px rgba(212, 175, 55, 0.35)',
        'gold-lg':  '0 0 40px rgba(212, 175, 55, 0.45)',
        'gold-xl':  '0 0 60px rgba(212, 175, 55, 0.5)',
        'gold-inner':'inset 0 0 20px rgba(212, 175, 55, 0.15)',
        'dark':     '0 4px 20px rgba(0, 0, 0, 0.8)',
        'dark-lg':  '0 8px 40px rgba(0, 0, 0, 0.9)',
        'card':     '0 2px 16px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 175, 55, 0.08)',
        'card-hover':'0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 175, 55, 0.2)',
        'modal':    '0 25px 80px rgba(0, 0, 0, 0.95)',
        'vip':      '0 0 30px rgba(168, 85, 247, 0.4)',
      },

      // =====================================================================
      // BACKGROUND GRADIENTS
      // =====================================================================
      backgroundImage: {
        'gold-gradient':       'linear-gradient(135deg, #d4af37 0%, #f5c842 50%, #d4af37 100%)',
        'gold-radial':         'radial-gradient(ellipse at center, #f5c842 0%, #d4af37 60%, #b8960c 100%)',
        'dark-gradient':       'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
        'card-gradient':       'linear-gradient(145deg, #1e1e2a 0%, #1a1a24 100%)',
        'hero-gradient':       'linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.6) 40%, #0a0a0f 100%)',
        'overlay-gradient':    'linear-gradient(180deg, rgba(10,10,15,0) 0%, rgba(10,10,15,0.95) 100%)',
        'shimmer':             'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.1) 50%, transparent 100%)',
        'vip-gradient':        'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%)',
        'border-gradient':     'linear-gradient(135deg, rgba(212,175,55,0.4), rgba(212,175,55,0.1), rgba(212,175,55,0.4))',
      },

      // =====================================================================
      // ANIMATIONS & TRANSITIONS
      // =====================================================================
      transitionDuration: {
        '0':   '0ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200':'1200ms',
        '1500':'1500ms',
        '2000':'2000ms',
      },

      transitionTimingFunction: {
        'cinema':      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'cinema-in':   'cubic-bezier(0.55, 0, 1, 0.45)',
        'cinema-out':  'cubic-bezier(0, 0.55, 0.45, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':      'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      keyframes: {
        // Fade in from below
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Fade in from above
        'fade-down': {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Fade in from left
        'fade-right': {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Fade in from right
        'fade-left': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Scale in
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Gold shimmer effect
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Pulse glow
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%':       { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        // Gentle float
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        // Spin slow
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Skeleton loading
        'skeleton': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        // Slide up panel
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        // Slide down panel
        'slide-down': {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        // Cinematic reveal (horizontal wipe)
        'wipe-right': {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
        // Number counter tick
        'count-up': {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        // Flicker (TV/cinema effect)
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '92%':       { opacity: '1' },
          '93%':       { opacity: '0.8' },
          '94%':       { opacity: '1' },
          '96%':       { opacity: '0.9' },
          '97%':       { opacity: '1' },
        },
      },

      animation: {
        'fade-up':     'fade-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'fade-down':   'fade-down 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'fade-right':  'fade-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'fade-left':   'fade-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'scale-in':    'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'shimmer':     'shimmer 2s linear infinite',
        'pulse-gold':  'pulse-gold 2s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'spin-slow':   'spin-slow 8s linear infinite',
        'skeleton':    'skeleton 1.4s ease infinite',
        'slide-up':    'slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'slide-down':  'slide-down 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'wipe-right':  'wipe-right 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'count-up':    'count-up 0.3s ease both',
        'flicker':     'flicker 8s linear infinite',
      },

      // =====================================================================
      // BACKDROP FILTERS
      // =====================================================================
      backdropBlur: {
        xs: '2px',
      },

      // =====================================================================
      // ASPECT RATIOS
      // =====================================================================
      aspectRatio: {
        'video':    '16 / 9',
        'poster':   '2 / 3',
        'banner':   '21 / 9',
        'square':   '1 / 1',
        'theater':  '2.39 / 1',
      },

      // =====================================================================
      // Z-INDEX SCALE
      // =====================================================================
      zIndex: {
        '60':  '60',
        '70':  '70',
        '80':  '80',
        '90':  '90',
        '100': '100',
        'overlay': '1000',
        'modal':   '1100',
        'toast':   '1200',
        'tooltip': '1300',
      },
    },
  },
  plugins: [
    // Custom utility plugin
    function({ addUtilities, addComponents, theme }) {
      // Glass morphism utilities
      addUtilities({
        '.glass': {
          background: 'rgba(26, 26, 36, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(10, 10, 15, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.08)',
        },
        '.glass-gold': {
          background: 'rgba(212, 175, 55, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
        },
        // Text gradient utilities
        '.text-gradient-gold': {
          background: 'linear-gradient(135deg, #d4af37 0%, #f5c842 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.text-gradient-silver': {
          background: 'linear-gradient(135deg, #9ca3af 0%, #e5e7eb 50%, #9ca3af 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.text-gradient-vip': {
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        // Scrollbar hide
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbarWidth': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        // Safe area utilities for mobile
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.px-safe': {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        // Line clamp utilities
        '.line-clamp-1': { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical' },
        '.line-clamp-2': { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' },
        '.line-clamp-3': { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical' },
        // Skeleton loader
        '.skeleton': {
          background: 'linear-gradient(90deg, #1a1a24 25%, #22222e 50%, #1a1a24 75%)',
          backgroundSize: '400px 100%',
          animation: 'skeleton 1.4s ease infinite',
        },
      })

      // Reusable component classes
      addComponents({
        '.btn-gold': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.5rem',
          background: 'linear-gradient(135deg, #d4af37 0%, #f5c842 50%, #d4af37 100%)',
          color: '#0a0a0f',
          fontWeight: '700',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 0 24px rgba(212, 175, 55, 0.5)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.btn-ghost': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.5rem',
          background: 'transparent',
          color: '#d4af37',
          fontWeight: '600',
          borderRadius: '0.5rem',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'rgba(212, 175, 55, 0.1)',
            borderColor: 'rgba(212, 175, 55, 0.7)',
          },
        },
        '.card-cinema': {
          background: '#1a1a24',
          border: '1px solid rgba(212, 175, 55, 0.08)',
          borderRadius: '0.75rem',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            borderColor: 'rgba(212, 175, 55, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(212, 175, 55, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      })
    },
  ],
}
