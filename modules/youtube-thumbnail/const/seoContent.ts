export interface FaqItem {
  question: string
  answer: string
}

export const YOUTUBE_THUMBNAIL_FAQS: FaqItem[] = [
  {
    question: '¿De dónde obtiene esta herramienta las diferentes resoluciones de la miniatura?',
    answer: 'YouTube almacena de forma automática múltiples versiones comprimidas de cada miniatura en sus servidores (CDNs públicas `img.youtube.com`). La versión MaxRes HD (1280x720) corresponde a `maxresdefault.jpg`, SD (640x480) a `sddefault.jpg`, HQ (480x360) a `hqdefault.jpg`, MQ (320x180) a `mqdefault.jpg` y Default (120x90) a `default.jpg`. Esta herramienta consulta e inspecciona directamente dichas variantes sin marca de agua.',
  },
  {
    question: '¿Por qué la versión MaxRes HD a veces no está disponible o muestra una imagen gris?',
    answer: 'YouTube genera la versión MaxRes (1280x720) solo cuando el creador subió el video en resolución 720p o superior y adjuntó una miniatura personalizada. Si el video es antiguo, de baja resolución o no tiene miniatura personalizada, la versión MaxRes no existirá en los servidores y las opciones recomendadas son SD o HQ.',
  },
  {
    question: '¿Es legal descargar e inspirarse en las miniaturas de otros canales?',
    answer: 'Sí. Obtener miniaturas para analizar su composición, paleta de colores, tipografía y contraste con fines de investigación o estudio de estrategia de contenido es totalmente válido. Sin embargo, no debes resubir miniaturas de otros autores tal cual para tus propios videos.',
  },
  {
    question: '¿Cuál es la resolución recomendada para las miniaturas de YouTube en 2026?',
    answer: 'La resolución recomendada por YouTube es 1280 x 720 píxeles con un ancho mínimo de 640 píxeles, manteniendo siempre la relación de aspecto 16:9 y un peso de archivo menor a 2MB en formatos JPG, PNG o WEBP.',
  },
]

export const YOUTUBE_THUMBNAIL_ARTICLES = [
  {
    title: 'Estrategia de Miniaturas para Founders que Hacen Contenido',
    highlightWord: 'Founders',
    content: `Para un fundador de SaaS, YouTube no es un canal de entretenimiento: es un motor de adquisición de clientes orgánico. La miniatura representa hasta el 80% de la decisión de clic de un usuario.

Analizar las miniaturas en alta resolución de tus competidores o referentes de la industria te permite identificar patrones visuales ganadores: el uso de rostros con emociones auténticas, contrastes agresivos en modo oscuro y textos de máximo 3 a 4 palabras.

Esta herramienta te permite extraer directamente los archivos originales guardados en los CDN de YouTube para que puedes estudiarlos, archivarlos o utilizarlos en tus benchmarks de diseño.`,
  },
  {
    title: 'Cómo los Servidores de YouTube Almacenan las Miniaturas',
    highlightWord: 'Servidores',
    content: `Cada vez que se publica un video en YouTube, la plataforma procesa la miniatura seleccionada y genera 5 copias estandarizadas en sus servidores CDN (img.youtube.com/vi/{ID}).

Cada copia tiene un nombre clave predefinido: maxresdefault.jpg (1280x720), sddefault.jpg (640x480), hqdefault.jpg (480x360), mqdefault.jpg (320x180) y default.jpg (120x90).

Facto no requiere backend ni almacenamiento intermedio: nuestro composable detecta el ID del video y accede instantáneamente a dichos servidores públicos desde tu navegador.`,
  }
]
