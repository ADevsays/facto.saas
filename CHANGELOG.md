# CHANGELOG

## [Internacionalización, Subastas & Core] - 2026-09-21

### Internacionalización & Intlify Warnings
- **Carga de Mensajes Globales i18n**: Configuración explícita en `nuxt.config.ts` con `restructureDir: false`, `langDir: 'locales'` y asignación de `file: 'en.json'` / `file: 'es.json'`. Esto solucionó la falta de mensajes en `@nuxtjs/i18n` que causaba warnings de Intlify (`footer.*`, `seo.*`) y textos crudos en `GlobalFooter.vue` y `pages/index.vue`.
- **Detección Automática por GeoIP**: Soporte dual de encabezados `cf-ipcountry` y `x-vercel-ip-country` en `/api/geoip` con bypass de cookies persistentes para usuarios que navegan mediante VPN, dirigiendo automáticamente a `/en`.
- **Cobertura Modular Completa**: Creación y ampliación de diccionarios locales para `modules/ads`, `modules/visuals`, `modules/achievements` y páginas de detalle de SaaS con `useLanguage`, `useAppSeo` y `useLocalePath`.

### Subasta de Anuncios (`modules/ads`)
- **Protección de Puja Mínima en Puestos Ocupados**: Eliminación del fallo que permitía ofertar menos del precio requerido de superación de puja (+1 USD). Corrección del reseteo de estado global en `useAddAdModal.ts`, cálculo dinámico blindado `Math.max(slotMin, targetPrice)` en `AddAdModal.vue` y validación estricta con HTTP 400 en `/api/ads/checkout`.
- **Traducción de Dropdown y Controles**: Selector de puestos con formato `Spot #{slot}` / `Puesto #{slot}` y rótulos de incremento/decremento totalmente traducidos en `AddAdModal.vue`.

### Core & Framework
- **Resolución Nativa de `appManifest` en Vite Dev**: Integración del hook `ready` en `nuxt.config.ts` para crear el directorio y archivo placeholder `.nuxt/manifest/meta/${buildId}.json` en el arranque del servidor de desarrollo. Elimina el error `Pre-transform error: Failed to resolve import "#app-manifest"` de Vite 7 manteniendo la característica `appManifest` 100% activa.

## [Subasta y Modal de Anuncios] - 2026-09-21

### Modal de Compra y Puja Dinámica (`AddAdModal.vue`)
- **Rediseño Unificado**: Transformación a estructura de una sola columna sin contenedores internos ni paddings redundantes, con titular editorial en una línea y beneficios con iconografía minimalista.
- **Selector Dropdown de 20 Puestos**: Selector interactivo homologado con los filtros de `/saas`, con indicador cromático directo (verde para libre, ámbar para ocupado, oro para #1) sin etiquetas de texto "Libre".
- **Puja Personalizada conectada a Whop**: Stepper (`-` / `+`) y píldoras rápidas (`$mín`, `+$5`, `+$10`, `+$25`) con generación dinámica de planes ocultos `one_time` en Whop Checkout.

### Experiencia de Usuario y Robustez (UX & Reliability)
- **Prevención de Bucle de Error al Recargar**: Limpieza inmediata de los parámetros URL (`?ad_setup=true&token=...`) con `window.history.replaceState` y reconocimiento de tokens ya utilizados con mensaje amigable en `/api/ads/session`.
- **Normalización de URLs**: Anteposición automática de `https://` tanto en `setup.post.ts`, formulario `AddAdModal.vue` y `AdCard.vue` para prevenir que URLs sin protocolo se interpreten como rutas relativas locales redirigiendo al home.
- **Ancho Homologado y Consistente en Ads Activos (`AdCard.vue`)**:
  - Fijado ancho mínimo consistente (`min-w-[280px] md:min-w-[340px]`) y padding idéntico al de las tarjetas vacías (`AdEmptyCard.vue`) para que textos cortos no encojan el card.
  - Eliminación de la píldora `#X` derecha para liberar el 100% del espacio para el pitch.
  - Fallback de avatar con inicial de la startup si la imagen del logo falla.
  - Resplandor y auras luminosas llamativas (oro para puesto 1, cian para puestos 2 al 20).

## [Mundial de Países y Perfil Founder] - 2026-09-12

### Ranking Mundialista de Países (/saas/pais)
- **Banderas Oficiales y de Mayor Altura**:
  - Conexión con FlagCDN (/w160/) y diccionario fallback COUNTRY_ISO_MAP para renderizar la bandera de cada país sin fallos.
  - Incremento del contenedor a w-20 h-16 md:w-24 md:h-20 con esquinas redondeadas (rounded-2xl), sombra y object-cover.
- **Revenue Acumulado Real en vez de MRR**:
  - En /api/countries/leaderboard: cálculo de facturación real desde saas_metrics_cache (cargos históricos o ARR) y ordenamiento por revenue total.
  - Encabezado con Total Facturado sumado y startups con métrica etiquetada como REVENUE.
- **Input Add MRR Integrado bajo el Subtítulo**:
  - Integración de InputMrrView debajo del subtítulo del encabezado antes de las tarjetas de países.
- **Tarjetas 100% Clickeables**:
  - Contenedor completo de cada startup convertido en NuxtLink interactivo con hover y cursor pointer hacia su perfil.
- **Carga Confiable de Logos**:
  - Inclusión de websiteUrl en la API y cascada de fallbacks a favicons oficiales para evitar imágenes rotas.
- **Consistencia Tipográfica**:
  - Aplicación de doctrina Facto (font-serif para títulos/números destacados, font-sans para descriptores, font-mono para importes).

### Perfil de Fundador y Actividad de GitHub
- **Heatmap de Actividad de GitHub**: Calendario de 52 semanas en BentoGithubHeatmap.vue con i18n, edge-to-edge y sin links directos a repositorios privados.
- **Transición Fluida**: Eliminación del spinner intermedio a pantalla completa en pages/founder/[slug].vue.
- **Persistencia de Categorías**: Corrección de cierre al hacer clic fuera en CategorySelect.vue y guardado múltiple en saas_categories.

## [Unreleased] - 2026-08-20

### Internacionalizaci�n (i18n) y SEO Centralizado
- **Composables Core**:
  - useLanguage.ts: Centraliza la reactividad de idiomas (ES/EN), retorno de locale y sincronizaci�n de cambio de ruta con useSwitchLocalePath.
  - useAppSeo.ts: Unifica metadatos (	itle, description, OpenGraph, Twitter Cards, obots e hreflang) con canonicals din�micos autom�ticos.
- **Navegaci�n Preservada**:
  - Envolvimiento de todos los enlaces internos (NuxtLink) y navegaciones program�ticas (outer.push) con localePath() en vistas de inicio, listas, perfiles, tarjetas y footer.
  - Correcci�n de rutas de categor�a y pa�s en useCategoryFilter.ts y useCountryFilter.ts para reconocer tanto slugs en espa�ol (/categoria, /pais) como en ingl�s (/category, /country).
- **Traducci�n Visual de Categor�as**:
  - Diccionario centralizado utils/categories.ts con mapeo de slugs a nombres visuales en ingl�s y espa�ol (incluyendo IA / AI).
  - Mapeo din�mico y reactivo en useCategories.ts, useSaasList.ts y SaasHeaderSection.vue sin alterar identificadores ni claves de base de datos.
- **Correcciones de Estabilidad y SSR**:
  - Blindaje en VerificationLegend.vue para prevenir lectura de propiedades no definidas.
  - Aislamiento de timers setInterval en CountryCardsSection.vue y MrrInput.vue al contexto de cliente (import.meta.client / onMounted) evitando ejecuciones en SSR.
  - Sincronizaci�n de detecci�n autom�tica de idioma en layouts/default.vue restringida a la ruta ra�z / para evitar sobreescritura de contexto en navegaciones internas.
- **Documentaci�n & Est�ndares**:
  - Creaci�n y actualizaci�n de la skill .agents/skills/nuxt-i18n-module/SKILL.md.
  - Inclusi�n de la secci�n de especificaci�n *Internacionalizaci�n (i18n) y SEO Centralizado* en spec/spec.md.
