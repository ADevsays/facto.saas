# Cambios Pendientes (To-Do)

Aquí se registrarán todas las futuras tareas, ideas y cambios pendientes a implementar en Facto.

## SEO Dinámico (Pendiente)
- [ ] **Metadatos Dinámicos (`useSeoMeta`)**: Inyectar etiquetas de título, descripción e imagen (`og:image`) únicas en la vista de detalle del perfil de cada startup (`pages/saas/[slug].vue` o equivalente) basándose en los datos obtenidos de la BD.
- [ ] **Sitemap Dinámico**: Instalar y configurar `@nuxtjs/sitemap` en `nuxt.config.ts`. Conectar la configuración para que haga una consulta a `saas_entries` en Supabase y genere automáticamente las URLs `/saas/[slug]` para el sitemap XML.
- [ ] **Canonical Tags en Vistas con Filtros**: Agregar un tag `<link rel="canonical" href="https://tu-dominio/saas">` usando `useHead` en `SaasListView.vue` para evitar que Google indexe como contenido duplicado las variantes con query params (ej. `?c=design` o `?s=mrr`).
- [ ] **Google Search Console**: Dar de alta el dominio y enviar la URL del sitemap dinámico generado cuando la web esté en producción.

## Módulo de Ads & Subasta
- [x] **Subasta de 20 Cupos (#1 al #20)**: Implementación de cálculo dinámico de precio base ($1 USD) y puja (+1 USD).
- [x] **Marquesina Estricta en Header**: Despliegue secuencial de izquierda a derecha iniciando en 0px para máxima exposición del cupo #1.
- [x] **Notificación Outbid por Correo**: Despacho automático de correo transaccional vía Brevo SMTP al usuario desplazado.
- [x] **Herramienta Admin para Afiliados (`/admin/ads`)**: Panel con bypass de pago para inyección manual de afiliados y patrocinadores con `x-admin-key`.
- [x] **Subida de Logos en Modal**: Soporte multipart para carga directa de imágenes a Supabase Storage con previsualización.
- [x] **Rediseño Unificado de Modal de Ads**: Layout en una sola columna con beneficios sin algoritmos, selector de 20 puestos estilo `/saas` y puja personalizada dinámica.
- [x] **Puesto #1 en Oro Brillante**: Estilizado `#FFD700` con resplandor en tarjetas vacías y ocupadas.
- [x] **Mejoras UX en Flujo de Setup**: Limpieza de token en URL en recargas, normalización automática de URLs con `https://`, eliminación de pill `#2` y ancho homogéneo (`min-w-[340px]`) en anuncios activos.
- [ ] **Migración SQL en Supabase**: Ejecutar `ALTER TABLE ads ADD COLUMN IF NOT EXISTS position INTEGER...` en la consola de Supabase si se desea indexar y almacenar nativamente todas las columnas adicionales.
