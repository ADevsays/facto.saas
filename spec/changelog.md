# Changelog

## Mejoras de UI & UX
- **Efecto Sci-Fi de Partículas en Buscador:** Se creó el componente `ParticleText.vue` para las categorías debajo del input de MRR. Cada 15 segundos, las categorías cambian: el texto se desvanece y estalla en sutiles partículas grises (polvo estelar) que se contraen para formar la nueva palabra.
- **Lógica de Rotación Garantizada:** Se actualizó `MrrInput.vue` para asegurar que las 3 categorías que rotan sean 100% distintas a las que se están mostrando actualmente, maximizando el dinamismo visual.
- **Asignación Dinámica de Colores por Categoría:** Se eliminó el mapeo "hardcodeado" de colores. Ahora la función hash en `gems.ts` (`getGemClass` y `getGemColor`) asigna automáticamente y de forma consistente un color de gema (Amatista, Esmeralda, Zafiro, Rubí o Cuarzo) a cualquier categoría, sin importar cuántas nuevas se agreguen en el futuro.
- **Hover Dinámico en el Ranking:** Se mejoró `RankingRow.vue` para que el efecto de `hover` adopte sutilmente el color específico de la categoría a la que pertenece el SaaS, destacándolos de manera elegante frente a los logos.
- **Glow Asimétrico en Tarjetas (Home y Lista):** Se refinó el efecto de iluminación difusa de fondo para que aparezca de forma esporádica (exactamente en el 20% de las tarjetas) tanto en las `SaasCard.vue` del Home como en las `SaasGemCard.vue` de la vista de lista, dándoles un aspecto más "raro" y premium.
- **Aleatoriedad en "Mira más startups":** En la sección `MoreStartupsSection.vue`, se implementó un desfase aleatorio para garantizar matemáticamente que siempre haya *exactamente una* tarjeta iluminada con color, pero que su posición (primera, segunda o tercera) varíe en cada carga de la página.

## Corrección de Errores (Bug Fixes)
- **Ancho Mermado en el Perfil del SaaS:** Se corrigió el contenedor en `SaasProfileView.vue` (debajo del input de MRR) eliminando la clase `md:w-1/2` que lo reducía al 50%. Ahora aprovecha todo el ancho igualando el gráfico superior.
- **Error de Carga en Categorías de Buscador (ReferenceError):** Se solucionó un bug en `MrrInput.vue` donde la directiva `{ immediate: true }` del `watch` intentaba acceder a la variable `stopWatch` antes de inicializarse. Se reemplazó por un control con variable booleana, permitiendo que las categorías se muestren al instante, especialmente útil cuando los datos cargaban desde caché.
