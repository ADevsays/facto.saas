import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Aquí puedes agregar tus colores personalizados
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '100% 0' },
        },
      },
      animation: {
        shine: 'shine 12s ease-in-out infinite',
      },
    }
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.outline-text': {
          'background': 'linear-gradient(120deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 70%)',
          'background-size': '200% auto',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'rgba(0, 212, 255, 0.3)',
          'filter': 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.4))',
          'display': 'inline-block',
          'animation': 'shine 12s ease-in-out infinite',
        },
      })
    }),
  ],
  content: [
    './modules/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ]
}
