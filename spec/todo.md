# Cambios Pendientes (To-Do)

Aquí se registrarán todas las futuras tareas, ideas y cambios pendientes a implementar en Facto.

## SEO Dinámico (Pendiente)
- [ ] **Metadatos Dinámicos (`useSeoMeta`)**: Inyectar etiquetas de título, descripción e imagen (`og:image`) únicas en la vista de detalle del perfil de cada startup (`pages/saas/[slug].vue` o equivalente) basándose en los datos obtenidos de la BD.
- [ ] **Sitemap Dinámico**: Instalar y configurar `@nuxtjs/sitemap` en `nuxt.config.ts`. Conectar la configuración para que haga una consulta a `saas_entries` en Supabase y genere automáticamente las URLs `/saas/[slug]` para el sitemap XML.
- [ ] **Canonical Tags en Vistas con Filtros**: Agregar un tag `<link rel="canonical" href="https://tu-dominio/saas">` usando `useHead` en `SaasListView.vue` para evitar que Google indexe como contenido duplicado las variantes con query params (ej. `?c=design` o `?s=mrr`).
- [ ] **Google Search Console**: Dar de alta el dominio y enviar la URL del sitemap dinámico generado cuando la web esté en producción.
