import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Aquí puedes agregar tus colores personalizados
      }
    }
  },
  plugins: [],
  content: [
    './modules/**/*.{js,vue,ts}',
    // El módulo de Nuxt ya incluye automáticamente componentes, páginas, layouts, etc.
    // Solo agrega rutas extra si tienes archivos fuera de la estructura estándar de Nuxt.
  ]
}
