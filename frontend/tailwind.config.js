module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,svelte,ts,tsx,vue}',
  ],
  // These states are applied by the static admin script at runtime.
  safelist: [
    'text-amber-200',
    'border-red-300/40',
    'bg-red-300/10',
    'text-red-100',
    'border-transparent',
    'hover:border-white/30',
    'hover:bg-white/5',
    'text-white/85',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Chinese is the default CJK shape; Japanese is opt-in via jp-display-*.
        'real-sans': ['Inter', '"Noto Sans SC"', '"Microsoft YaHei"', '"PingFang SC"', 'sans-serif'],
        'real-mono': ['"JetBrains Mono"', 'Consolas', 'Courier New', '"Noto Sans SC"', '"Microsoft YaHei"', 'monospace'],
        'fiction-serif': ['Georgia', '"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', 'SimSun', 'serif'],
        'fiction-sans': ['"Noto Sans SC"', '"Microsoft YaHei"', '"PingFang SC"', 'sans-serif'],
        'formal-sans': ['Arial', '"Noto Sans SC"', '"Microsoft YaHei"', '"PingFang SC"', 'SimHei', 'sans-serif'],
        'formal-serif': ['"Times New Roman"', '"Noto Serif SC"', '"Songti SC"', 'SimSun', 'serif'],
        fiction: ['Georgia', '"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', 'SimSun', 'serif'],
        'readable-mono': ['"JetBrains Mono"', 'Consolas', 'Courier New', '"Noto Sans SC"', '"Microsoft YaHei"', 'monospace'],
        zh: ['Inter', '"Noto Sans SC"', '"Microsoft YaHei"', '"PingFang SC"', 'sans-serif'],
        // Japanese display fonts are only for explicitly marked Japanese text.
        'jp-display-sans': ['"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', 'sans-serif'],
        'jp-display-serif': ['"Noto Serif JP"', '"Yu Mincho"', '"Hiragino Mincho ProN"', 'serif'],
      },
      colors: {
        // Real: Deep Cyber/Tech Theme
        real: {
          bg: 'rgb(var(--real-bg) / <alpha-value>)',
          surface: 'rgb(var(--real-surface) / <alpha-value>)',
          surfaceHover: 'rgb(var(--real-surface-hover) / <alpha-value>)',
          text: 'rgb(var(--real-text) / <alpha-value>)',
          muted: 'rgb(var(--real-muted) / <alpha-value>)',
          accent: 'rgb(var(--real-accent) / <alpha-value>)',
          accentSecondary: 'rgb(var(--real-accent-secondary) / <alpha-value>)',
          glow: 'rgb(var(--real-accent) / 0.2)',
        },
        // Fiction: Warm Magical/Twilight Theme
        fiction: {
          bg: 'rgb(var(--fiction-bg) / <alpha-value>)',
          surface: 'rgb(var(--fiction-surface) / <alpha-value>)',
          surfaceHover: 'rgb(var(--fiction-surface-hover) / <alpha-value>)',
          text: 'rgb(var(--fiction-text) / <alpha-value>)',
          muted: 'rgb(var(--fiction-muted) / <alpha-value>)',
          accent: 'rgb(var(--fiction-accent) / <alpha-value>)',
          accentSecondary: 'rgb(var(--fiction-accent-secondary) / <alpha-value>)',
          gold: 'rgb(var(--fiction-accent) / <alpha-value>)',
          ink: 'rgb(var(--fiction-text) / <alpha-value>)',
          glow: 'rgb(var(--fiction-accent) / 0.2)',
        },
      },
      backgroundImage: {
        'real-gradient': 'linear-gradient(135deg, rgb(var(--real-bg)) 0%, rgb(var(--real-surface)) 100%)',
        'fiction-gradient': 'linear-gradient(135deg, rgb(var(--fiction-bg)) 0%, rgb(var(--fiction-surface)) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
};
