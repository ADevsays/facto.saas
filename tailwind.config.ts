import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      screens: {
        md: '800px',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        surface: {
          dark: '#030305',
          card: 'rgba(255, 255, 255, 0.04)',
          'card-hover': 'rgba(255, 255, 255, 0.07)',
          elevated: '#131316',
          'elevated-hover': '#1a1a1e',
          contrast: '#1a1d28',
        },
        accent: {
          cyan: '#00D4FF',
        }
      },
    }
  },
  plugins: [],
  content: [
    './modules/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './ui/**/*.vue',
    './app.vue',
  ]
}
