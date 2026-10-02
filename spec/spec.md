# spec.md â€” Documento de Verdad

Este archivo es la Ãºnica fuente de verdad del proyecto. El agente lo lee antes de implementar cualquier feature y lo actualiza al completarlo.

Cada feature sigue la estructura: **Contrato â†’ Dominio â†’ ValidaciÃ³n**.

---

# QuÃ© es Facto

Facto es una plataforma que permite a los fundadores de SaaS publicar sus productos en un ranking global. El ranking se ordena por MRR (Monthly Recurring Revenue) y permite a los usuarios filtrar por categorÃ­a, nombre, fundador, etc.

Su forma de monetizaciÃ³n es mediante anuncios pagados en la banda superior, con un lÃ­mite de solo 20 espacios disponibles.

AdemÃ¡s de su funciÃ³n principal maneja tools orbitantes Ãºtiles para los usuarios.

## DiseÃ±o Global (Layout)

El diseÃ±o de Facto es minimalista, oscuro y premium. 

### Banda de Anuncios (Ads Banner)
- **Persistencia**: La banda de anuncios (`AdsBandSection.vue`) es un elemento global ubicado en el layout `default.vue`.
- **Visibilidad**: Debe estar visible por defecto en todas las rutas del sitio, **excepto en `/info`**.
- **Comportamiento**: Se mantiene en la parte superior (`sticky top-0`) actuando como el detalle superior constante de la navegaciÃ³n.
- **ImplicaciÃ³n en PÃ¡ginas**: Todas las pÃ¡ginas (excepto `/info`) deben estructurarse asumiendo la presencia de este banner (ej: rellenos superiores adecuados para que el contenido no quede oculto bajo el banner sticky).


---

## Buscador de Startups

Buscador global que permite filtrar el ranking de startups por cualquier criterio (nombre, categorÃ­a, fundador, etc.).

### Contrato
- **SincronizaciÃ³n**: Composable global `composables/useStartupSearch.ts`.
- **Interface `StartupSearchState`**:
  - `query`: `string` (texto de bÃºsqueda).
- **Componente**: `modules/input-mrr/components/MrrInput.vue` (refactorizado como barra de bÃºsqueda).

### Dominio
- "El buscador debe filtrar las startups del ranking en tiempo real."
- "La bÃºsqueda debe ser insensible a mayÃºsculas/minÃºsculas (case-insensitive)."
- "Se debe buscar coincidencia en los campos: `name`, `category`, `founder` y `mrr`."
- "Si la `query` estÃ¡ vacÃ­a, se muestra la lista completa."
- "Si no hay coincidencias, se debe mostrar un estado vacÃ­o en el ranking."

### ValidaciÃ³n
- **Happy Path**: Buscar "Stripe" -> Solo se muestra el registro de Stripe.
- **Happy Path**: Buscar "Design" -> Se muestran todas las startups de esa categorÃ­a.
- **BÃºsqueda VacÃ­a**: Borrar el texto -> Se restauran los 10 registros originales.
- **Edge Case**: BÃºsqueda con caracteres especiales o espacios extra -> El sistema debe hacer `trim()` y manejar strings seguros.
- **Edge Case**: Sin resultados -> El ranking muestra "No se encontraron resultados".

---

## Agregar un SaaS

Flujo de dos pasos que permite a un founder publicar su SaaS en el ranking. **El orden del flujo es: primero los datos del SaaS, despuÃ©s (opcionalmente) el API key.** La arquitectura del provider es **provider-agnostic**: el mismo flujo soporta Stripe, MercadoPago y futuros. El MRR se calcula servidor a servidor y se recalcula en cada visita a la pÃ¡gina del SaaS.

> **DiseÃ±o**: Todos los componentes visuales deben aplicar la skill `facto-design`.

### Contrato

**UbicaciÃ³n arquitectÃ³nica:**
- `modules/add-saas/types/index.ts` â€” tipos compartidos del mÃ³dulo
- `modules/add-saas/views/AddSaasView.vue` â€” pÃ¡gina principal (`/agregar`)
- `modules/add-saas/sections/StepInfoSection.vue` â€” Paso 1: formulario de datos del SaaS
- `modules/add-saas/sections/StepKeySection.vue` â€” Paso 2: conexiÃ³n opcional del API key
- `modules/add-saas/components/ProviderSelector.vue` â€” selector visual de provider (Stripe / MercadoPago)
- `modules/add-saas/components/CategorySelect.vue` â€” dropdown de categorÃ­as (cargadas desde `useSaasList`)
- `modules/add-saas/components/MrrStatusBadge.vue` â€” badge de estado MRR (conectado / bloqueado / cero)
- `modules/add-saas/server/services/provider.interface.ts` â€” interfaz base de provider
- `modules/add-saas/server/services/stripe.service.ts` â€” implementaciÃ³n Stripe
- `modules/add-saas/server/services/mercadopago.service.ts` â€” implementaciÃ³n MercadoPago
- `modules/add-saas/server/services/provider.factory.ts` â€” factory que resuelve el service por provider
- `modules/add-saas/server/api/validate.post.ts` â€” validaciÃ³n del key (provider-agnostic)
- `modules/add-saas/server/api/publish.post.ts` â€” publicaciÃ³n del SaaS
- `modules/add-saas/server/api/[id]/mrr.get.ts` â€” MRR on-demand (llama al service del provider correcto)

**Flujo UX:**
1. El founder hace click en "Agrega tu MRR" en la home â†’ navega a `/add`.
1. El founder hace click en "Agrega tu MRR" en la home → navega a `/add`.
2. **Paso 1 — Datos del SaaS** (`StepInfoSection`): Formulario con los campos:
   - `name` (string, obligatorio)
   - `logoUrl` (string, URL de imagen, opcional)
   - `founderName` (string, opcional)
   - `websiteUrl` (string, URL, opcional)
   - `startupType` (string libre, ej: "B2B SaaS", "PLG", "Marketplace", opcional)
   - `categorySlug` (uuid vía `CategorySelect`, obligatorio)
   - `countrySlug` (string, ISO o slug del país vía `CountrySelect`, opcional)
3. **Paso 2 — API Key** (`StepKeySection`): El founder elige un provider y pega su key.
   - Si conecta key válida → MRR calculado y visible en el ranking.
   - Si **salta este paso** (CTA "Publicar sin MRR") → SaaS publicado con `mrr: null`, badge "MRR bloqueado" en la UI.

**Interfaces TypeScript:**
```ts
type PaymentProvider = 'stripe' | 'mercadopago' | 'whop'

interface ProviderValidationResult {
  valid: boolean
  mrr: number | null
  currency: string
  error?: 'invalid_key' | 'no_subscriptions' | 'api_error'
}

interface PaymentProviderService {
  validate(apiKey: string): Promise<ProviderValidationResult>
  getMrr(apiKey: string): Promise<ProviderValidationResult>
}

interface SaasSubmission {
  name: string
  logoUrl?: string
  websiteUrl?: string
  founderName?: string
  startupType?: string
  categorySlug: string
  countrySlug?: string             // opcional: ISO del país
  providerSlug?: PaymentProvider   // opcional: si no hay key, se omite
  providerKey?: string             // opcional: API key en texto plano (el server la cifra)
  isIncognito: boolean
}

interface SaasPublicProfile {
  id: string
  name: string | null
  logoUrl: string | null
  websiteUrl: string | null
  founderName: string | null
  startupType: string | null
  category: string
  provider: PaymentProvider | null
  isIncognito: boolean
  mrr: number | null
  currency: string
  publishedAt: string
}
```

**Endpoints** *(archivos en `modules/add-saas/server/api/`)*:
- `POST /api/add-saas/validate` — recibe `{ providerSlug, providerKey }`, devuelve `ProviderValidationResult`
- `POST /api/add-saas/publish` — recibe `SaasSubmission`, devuelve `SaasPublicProfile`
- `GET /api/add-saas/[id]/mrr` — recalcula MRR usando el provider y key almacenados

**Patrón para agregar un nuevo provider:**
1. Crear `modules/add-saas/server/services/<provider>.service.ts` implementando `PaymentProviderService`.
2. Registrarlo en `provider.factory.ts`.
3. Añadirlo al tipo `PaymentProvider`.
4. No se requieren cambios en endpoints ni en la UI del flujo.

---

**Stripe** (`provider: 'stripe'`):
- Permiso requerido en Restricted Key: lectura de Cargos (`rak_charge_read`), Suscripciones (`rak_subscription_read`), Planes (`rak_plan_read`) y Productos (`rak_product_read`).
- Creación automatizada: Enlace parametrizado que preselecciona todos estos permisos en la consola de Stripe.
- Endpoints de consulta:
  - `GET https://api.stripe.com/v1/subscriptions?status=all&limit=100` (Historial completo de suscripciones para cálculo de MRR).
  - `GET https://api.stripe.com/v1/charges?limit=100` (Historial de cargos exitosos para Revenue).
- Header: `Authorization: Bearer <providerKey>`
- Cálculo MRR por suscripción: `items.data[].price.unit_amount × quantity × (interval === 'year' ? 1/12 : interval === 'week' ? 4.33 : 1) / 100`

**MercadoPago** (`provider: 'mercadopago'`):
- Credencial: Access Token (modo producción, solo lectura de suscripciones y pagos)
- Endpoints de consulta:
  - `GET https://api.mercadopago.com/preapproval/search?limit=100` (Historial de preaprobaciones/suscripciones).
  - `GET https://api.mercadopago.com/v1/payments/search?status=approved&limit=100` (Historial de pagos recibidos exitosos).
- Header: `Authorization: Bearer <providerKey>`
- Cálculo MRR por suscripción: `results[].auto_recurring.transaction_amount` (ya viene mensual).
- Moneda: `results[].auto_recurring.currency_id` (ej: `COP`, `ARS`, `BRL`, `MXN`, `CLP`).

### Dominio

**Paso 1 — Datos del SaaS:**
- "El campo `name` es obligatorio. El resto son opcionales."
- "El campo `categorySlug` debe corresponder a un slug válido de la tabla `categories`. El componente `CategorySelect` carga las opciones desde `useSaasList`."
- "El campo `startupType` es un texto libre descriptivo (ej: B2B SaaS, PLG, Marketplace)."
- "Completar este paso habilita el botón de continuar al Paso 2."

**Paso 2 — API Key (opcional):**
- "El founder elige su provider y pega su API key. El servidor instancia el service vía `provider.factory.ts`."
- "Si el provider responde 401/403 → `valid: false`, `error: 'invalid_key'`. Se muestra error inline sin bloquear la publicación."
- "Si la llamada es exitosa pero no hay suscripciones activas → `valid: true`, `mrr: 0`."
- "Si el founder salta el Paso 2 → `providerSlug` y `providerKey` se omiten; el SaaS se publica con `mrr: null`."
- "El MRR se normaliza siempre a mensual. La conversión de moneda es responsabilidad del service de cada provider."
- "El API key se almacena cifrado en Supabase (columna `provider_key_encrypted`)."

**Publicación:**
- "Al publicar, el SaaS aparece inmediatamente en el ranking sin moderación."
- "Si `mrr: null`, aparece al fondo del ranking con badge 'MRR bloqueado' visible en su perfil."

**Recálculo de MRR y Obtención de Historial:**
- "Al visitar la página de detalle de un SaaS, el servidor llama al service del provider almacenado con el key cifrado."
- "Si es un SaaS con proveedor Stripe, además del MRR actual, se obtienen los últimos 100 cargos exitosos y las suscripciones históricas en paralelo para armar la evolución financiera en la propiedad `history`."
- "El botón 'Reload' en la página del SaaS dispara el mismo endpoint de recálculo manualmente."
- "Si el key ya no es válido al momento del reload o de la consulta del detalle → `mrr: null`, `history: null`, badge 'Key expirada' en la UI."

### Validación
- **Happy Path completo**: Datos + Key válida Stripe → MRR calculado, SaaS visible en ranking con MRR.
- **Gráficas de Stripe Reales**: Al consultar el detalle del SaaS con Restricted Key válida, se carga el histórico de cobros (`charges`) y suscripciones (`subscriptions`) mapeados correctamente al eje temporal.
- **Happy Path sin key**: Solo datos → SaaS publicado con `mrr: null`, badge "MRR bloqueado", y el gráfico cae en simulación de fallback (retrocompatibilidad).
- **Gráficas de MercadoPago Reales**: Al consultar el detalle del SaaS con Access Token de Mercado Pago válido, se carga el histórico de cobros (payments) y preaprobaciones (suscripciones) mapeados al eje temporal de forma análoga a Stripe.
- **Prueba Sandbox MercadoPago**: El uso de la key de desarrollo 'APP_USR_TEST_FACTO' inyecta en el servidor una serie histórica realista de pruebas para validar el gráfico.
- **Key inválida**: Respuesta 401 → error inline en Paso 2, el founder puede publicar igual sin MRR.
- **MRR = 0**: Key válida sin suscripciones activas → SaaS publicado con `$0`.
- **Categoría inválida**: `categorySlug` no existe en BD → `publish.post.ts` devuelve 422.
- **Edge Case — Nuevo provider**: Solo crear service + registrar en factory → funciona sin cambios en API ni UI.
- **Edge Case — Key expirada en reload**: Key válida al publicar, revocada después → `mrr: null` y `history: null` en el detalle.
- **Seguridad**: El API key nunca se expone en respuestas al cliente. Solo se usa server-side. Se almacena cifrado en base64 en la columna `provider_key_encrypted`.

---

## Listar SaaS ✅

Feature que alimenta todas las secciones de la UI con los SaaS reales publicados en Supabase. Reemplaza los datos hardcodeados de `RankingSection`, `RecentlySection` y `BestSection`. El composable global `useSaasList` es la única fuente de datos para estas tres secciones.

### Contrato

**Ubicación arquitectónica:**
- `composables/useSaasList.ts` — composable global singleton; hace un único `$fetch` y expone derivaciones reactivas
- `composables/useStartupSearch.ts` — estado global de la query de búsqueda; expone `filterItems`
- `modules/ranking/server/services/ranking.ts` — service de BD: queries con JOIN y filtros dinámicos
- `modules/ranking/server/api/list.get.ts` — endpoint principal
- `modules/ranking/server/api/latest.get.ts` — alias: 6 más recientes
- `modules/ranking/server/api/top.get.ts` — alias: 6 más vistos
- `modules/ranking/server/api/ranking.get.ts` — alias: ordenado por MRR
- `modules/ranking/types/index.ts` — tipos del dominio
- `modules/ranking/components/RankingRow.vue` — fila del ranking
- `modules/ranking/sections/RankingSection.vue` — sección principal con estados loading/error/vacío

**Supabase — esquema real (ya creado):**

```sql
-- Tablas maestras (normalizadas)
CREATE TABLE categories (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

CREATE TABLE payment_providers (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

CREATE TABLE countries (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  flag text
);

CREATE TABLE founders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  name          text,
  twitter_url   text,
  linkedin_url  text,
  instagram_url text,
  country_slug  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Tabla principal
CREATE TABLE saas_entries (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   text,                                              -- null si incógnito
  logo_url               text,                                              -- null si incógnito
  website_url            text,                                              -- null si incógnito
  founder_name           text,                                              -- null si incógnito
  founder_id             uuid        REFERENCES founders(id) ON DELETE SET NULL,
  founder_email          text,
  is_incognito           boolean     NOT NULL DEFAULT false,
  mrr                    numeric,                                           -- null si key expiró
  currency               text        NOT NULL DEFAULT 'USD',
  category_id            uuid        REFERENCES categories(id) ON DELETE SET NULL,
  provider_id            uuid        REFERENCES payment_providers(id) ON DELETE SET NULL,
  provider_key_encrypted text,
  views                  bigint      NOT NULL DEFAULT 0,
  published_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE saas_countries (
  saas_id    uuid REFERENCES saas_entries(id) ON DELETE CASCADE,
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  PRIMARY KEY (saas_id, country_id)
);

CREATE INDEX idx_saas_mrr       ON saas_entries (mrr DESC NULLS LAST);
CREATE INDEX idx_saas_published ON saas_entries (published_at DESC);
CREATE INDEX idx_saas_views     ON saas_entries (views DESC);
CREATE INDEX idx_saas_category  ON saas_entries (category_id);

-- Tabla de leads
CREATE TABLE beta_leads (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        UNIQUE NOT NULL,
  startup_url text,
  gateway     text,
  motivation  text,
  source      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Seeds
INSERT INTO categories (name, slug) VALUES
  ('Productivity', 'productivity'), ('Design', 'design'), ('Payments', 'payments'),
  ('Infrastructure', 'infrastructure'), ('Video', 'video'), ('Dev Tools', 'dev-tools'),
  ('Marketing', 'marketing'), ('Analytics', 'analytics'), ('AI', 'ai'), ('Other', 'other');

INSERT INTO payment_providers (name, slug) VALUES
  ('Stripe', 'stripe'), ('MercadoPago', 'mercadopago'), ('Whop', 'whop');
```

**Implicaciones del diseÃ±o normalizado:**
- `category` y `provider` de `SaasListItem` se resuelven con JOIN en el service; nunca se almacenan como texto en `saas_entries`.
- Al agregar un SaaS, el endpoint `publish.post.ts` debe recibir `categorySlug` y `providerSlug`, resolver los UUIDs correspondientes y guardar los FK.
- Para filtrar por categorÃ­a en el endpoint, el service hace primero `SELECT id FROM categories WHERE slug = ?` y luego filtra por `category_id`.
- Para aÃ±adir un nuevo proveedor de pagos basta con insertar en `payment_providers`; no requiere cambios en cÃ³digo.

**Interfaces TypeScript:**
```ts
type PaymentProvider = 'stripe' | 'mercadopago' | 'whop'
type SortOption = 'mrr' | 'latest' | 'views'

interface SaasListItem {
  id: string
  name: string | null
  logoUrl: string | null
  websiteUrl: string | null
  founderName: string | null
  isIncognito: boolean
  mrr: number | null
  currency: string
  category: string        // name resuelto por JOIN
  categorySlug: string    // slug resuelto por JOIN
  country?: string        // name resuelto por JOIN (opcional)
  countryFlag?: string    // flag resuelto por JOIN (opcional)
  provider: PaymentProvider
  views: number
  publishedAt: string
}

interface SaasListState {
  items: SaasListItem[]
  loading: boolean
  error: string | null
}

interface ListQueryParams {
  sort?: SortOption
  category?: string   // slug de categorÃ­a
  q?: string
  limit?: number
  offset?: number
}
```

**Endpoints:**
- `GET /api/ranking/list` â€” devuelve `SaasListItem[]`
  - `sort`: `mrr` (default) | `latest` | `views`
  - `category`: slug (ej: `dev-tools`)
  - `q`: bÃºsqueda global sobre `name` e `founder_name` (ilike server-side)
  - `limit` / `offset`: paginaciÃ³n (default: 100/0)
- `GET /api/ranking/latest` â€” 6 mÃ¡s recientes (`sort=latest&limit=6`)
- `GET /api/ranking/top` â€” 6 mÃ¡s vistos (`sort=views&limit=6`)
- `GET /api/ranking/ranking` â€” ranking completo por MRR (`sort=mrr`)

**Derivaciones por secciÃ³n de UI** (computed desde `useSaasList`, sin fetch extra):
- `rankingItems` â€” lista completa ordenada por MRR desc â†’ `RankingSection`
- `recentItems` â€” top 6 por `publishedAt DESC` â†’ `RecentlySection`
- `bestItems` â€” top 6 por MRR desc (sin nulls) â†’ `BestSection`

### Dominio
- "El composable `useSaasList` hace un Ãºnico fetch al montar la app. Las tres secciones son vistas derivadas del mismo array en memoria."
- "Si un SaaS tiene `is_incognito: true`, se muestra con nombre 'â€” AnÃ³nimo â€”', sin logo y sin link."
- "Si `mrr` es `null`, se muestra 'â€”' en lugar de una cifra. El SaaS aparece al fondo del ranking."
- "El filtro por `q` se aplica server-side con `ilike` sobre `name` y `founder_name`. El filtro en memoria de `useStartupSearch` es una capa adicional sin fetch."
- "Las categorÃ­as disponibles en el buscador se derivan dinÃ¡micamente de los items ya cargados en `useSaasList`, no de un fetch separado."
- "La secciÃ³n `RecentlySection` y `BestSection` no tienen paginaciÃ³n; muestran mÃ¡ximo 6 items."
- "Backlink/UTM: Al renderizar el link hacia el sitio de la startup, se debe agregar dinamicamente el parametro ?ref=facto, utm_source=factosaas.com y utm_medium=ranking para que el founder pueda identificar el trafico entrante en sus analiticas."
- "Compartir SaaS: Se debe mostrar un boton 'Compartir' que abre un modal con opciones para compartir el perfil de la startup en X, LinkedIn, Facebook, y copiar enlace (para Instagram). El texto predefinido es 'Ahora [nombre] esta en Facto' junto con la URL de la pagina en Facto."

### ValidaciÃ³n
- âœ… **Happy Path**: SaaS publicados â†’ Ranking muestra ordenados por MRR, Recently los 6 mÃ¡s nuevos, Best los 6 con mayor MRR.
- âœ… **SaaS IncÃ³gnito**: `is_incognito: true` â†’ Aparece con 'â€” AnÃ³nimo â€”', sin logo, sin link.
- âœ… **MRR null**: SaaS con key invÃ¡lida â†’ Aparece al final del ranking con 'â€”'.
- âœ… **Listado vacÃ­o**: Sin SaaS publicados â†’ Cada secciÃ³n muestra estado vacÃ­o.
- âœ… **Filtro por categorÃ­a**: Tab seleccionado â†’ `useStartupSearch` filtra el array en memoria.
- âœ… **BÃºsqueda vacÃ­a**: Borrar texto â†’ Se restaura la lista completa.
- âœ… **Sin resultados**: Query sin coincidencias â†’ RankingSection muestra "No se encontraron resultados".

---

---

## Reclamar Startup (Claim Founder)

Flujo que permite a un usuario verificar su identidad como fundador de un SaaS previamente agregado y enlazar su perfil social al proyecto.

### Contrato
- **Endpoint**: `POST /api/saas/claim`
- **Vista**: Modal `ClaimFounderModal.vue` invocado desde el perfil de SaaS (`SaasProfileView.vue`).

### Dominio
- "El SaaS debe tener `founder_email` registrado."
- "El usuario ingresa su email. Si coincide con `founder_email`, el sistema le permite actualizar sus redes (Twitter, LinkedIn, Instagram), nombre y país."
- "Se crea o actualiza un registro en la tabla `founders` (upsert por `email`)."
- "El SaaS se enlaza a ese fundador guardando el `founder_id` en `saas_entries`."
- "Al visualizar un SaaS, si está enlazado a un fundador (`founder_id`), se cargan sus redes sociales para mostrarlas en la UI."

### Validación
- **Happy Path**: El founder entra al perfil de su SaaS, hace click en reclamar o verificar, ingresa su correo original, ingresa sus redes y se guardan correctamente.
- **Email Inválido**: Si el email no coincide con `founder_email`, el backend devuelve error `403`.

---

## Pasarela de Pago (Whop), Subasta de 20 Cupos y Módulo de Ads

Integración para el manejo de anuncios en cabecera mediante un sistema de subasta continua de 20 cupos limitados (#1 a #20), pasarela de pago Whop, notificaciones automáticas de outbid por email y herramienta de gestión para afiliados y patrocinadores en el panel de administración.

### Contrato
- **Endpoints**:
  - `GET /api/ads/active` (Obtiene anuncios activos ordenados ascendentemente por `position`).
  - `GET /api/ads/slots` (Devuelve el estado de los 20 cupos: posición, disponibilidad, precio actual y precio para superar la puja).
  - `POST /api/ads/checkout` (Genera la URL de pago en Whop con el precio correspondiente al puesto seleccionado).
  - `POST /api/ads/upload` (Sube el logo del anunciante a Supabase Storage bucket `ads_images`).
  - `GET /api/ads/session?email=...` (Verifica que un email tenga pago activo y no usado).
  - `POST /api/ads/setup` (Asigna el anuncio al cupo elegido, desactiva el anuncio anterior si existía, envía correo al dueño superado y marca la membresía como usada).
  - `GET /api/ads/my-ads` (Devuelve los anuncios y estados de permisos ad-free del usuario autenticado o email).
  - `POST /api/ads/ad-free-checkout` (Genera checkout en Whop de $1 USD para eliminar anuncios de por vida).
  - `POST /api/ads/ad-free-verify` (Valida y activa el token de experiencia sin anuncios).
  - `POST /api/admin/ads/assign` (Admin protegido con `x-admin-key` - Asigna directamente un afiliado o sponsor a cualquier cupo 1..20).
  - `POST /api/admin/ads/remove` (Admin protegido con `x-admin-key` - Desactiva/libera el anuncio de un cupo específico).
- **Interfaces**:
```ts
interface AdSlot {
  position: number
  ad: Ad | null
  currentPrice: number
  nextPrice: number
  isAvailable: boolean
}

interface AdSetupPayload {
  email: string
  password: string
  name: string
  description: string
  url: string
  image_url: string
  position?: number
}

interface AdminAssignAdPayload {
  position: number
  name: string
  description?: string
  url: string
  image_url?: string
  price?: number
  is_active?: boolean
}

interface MyAdsResponse {
  authenticated: boolean
  email: string | null
  ads: Ad[]
  canHideAds: boolean
  isAdFree: boolean
  hasPaidAds: boolean
}
```

### Dominio
- **Mecánica de Subasta de 20 Cupos**:
  1. Hay exactamente 20 cupos (#1 a #20) en la marquesina superior (`AdsBandSection.vue`).
  2. El precio base de un cupo libre es de **$1 USD**.
  3. Si un cupo ya está ocupado por otro anunciante, cualquiera puede desbancarlo pagando **$1 USD más** que el precio pagado anteriormente (`nextPrice = currentPrice + 1`).
  4. Al ocupar un puesto tomado, el anuncio anterior pasa a `is_active: false` y el sistema envía un correo transaccional automático (vía Brevo SMTP) al anterior propietario notificándole que fue superado y dándole la opción de volver a pujar.
- **Redirección al Dashboard**:
  - Al completar el pago de un anuncio en Whop o finalizar el setup de datos en el modal, el usuario es redirigido a `/dashboard/ads` para visualizar de inmediato sus puestos, estado y enlace en vivo.
- **Gestión de Ads y Toggle Ad-Free**:
  - **Patrocinadores / Compradores de Ads**: Tienen derecho a un toggle en `/dashboard/ads` para activar o desactivar la visualización de los anuncios en toda su navegación por Facto.
  - **Pase Ad-Free ($1 USD)**: Quienes no hayan comprado anuncios ven una tarjeta en `/dashboard/ads` con la opción de remover anuncios permanentemente por $1 USD vía Whop. Al pagar, se genera un token en `localStorage` y sesión que desbloquea el toggle y oculta los banners.
  - **Soporte Multi-Email**: Si el usuario registró su startup con un email y pagó el anuncio con otro, puede consultar y gestionar los anuncios del segundo email desde la misma vista de `/dashboard/ads`.
- **Marquesina Continua de 20 Cupos (`AdsBandSection.vue`)**:
  - Los 20 puestos se deslizan continuamente en orden estricto (#1 al #20), mostrando tanto los anuncios activos (`AdCard.vue`) como los puestos libres (`AdEmptyCard.vue`).
  - Al hacer click sobre un puesto libre en la marquesina, se abre de inmediato el modal de compra (`AddAdModal.vue`) con ese puesto preseleccionado a $1 USD.
  - Al hacer click sobre un anuncio activo en la marquesina, redirige a la URL del anunciante (`target="_blank"`).
- **Listado y Subasta en "Anúnciate aquí" (`AdAuctionListModal.vue`)**:
  - Al hacer click en "Anúnciate aquí" (`AdCtaCard.vue`), se abre un modal con el listado completo de las 20 startups del primero al último puesto (#1 al #20).
  - Permite explorar quién ocupa cada puesto, cuánto pagó y pulsar **RECLAMAR** para superar la puja anterior u **OCUPAR** para tomar un puesto libre.
- **Modal de Compra Directa (`AddAdModal.vue`)**:
  - Diseño limpio y minimalista con métricas, precio en tipografía grande y botón directo para pagar en Whop sin pasos innecesarios.
- **Herramienta Admin para Afiliados (`/admin/ads`)**:
  - Accesible para administradores autenticados con `x-admin-key`.
  - Permite inyectar empresas afiliadas o patrocinadores directamente en cualquiera de los 20 cupos sin pasar por Whop, estableciendo el precio base simulado y enlace de afiliado.

### Validación
- **Happy Path Subasta**: Un nuevo anunciante hace click en un puesto libre (#3) en la marquesina a $1 USD o pulsa "RECLAMAR" en el modal de "Anúnciate aquí" para superar un puesto ocupado (#1) a $5 USD. Se abre el modal con el precio grande y botón directo a Whop. Realiza el pago, configura sus datos y logo en `AddAdModal.vue`, y el usuario es redirigido a `/dashboard/ads` con su anuncio activo.
- **Toggle Ad-Free**: Un anunciante activa el toggle de ocultar anuncios. Las secciones `AdsBandSection` y `AdsBandBottomSection` desaparecen inmediatamente en todas las páginas.
- **Compra de Pase Ad-Free ($1 USD)**: Usuario sin anuncios hace click en "Quitar anuncios ($1 USD)" en `/dashboard/ads`, paga en Whop, regresa y los anuncios se ocultan permanentemente con persistencia en `localStorage`.
- **Notificación de Outbid**: El dueño del anuncio reemplazado recibe un email con diseño Facto indicando el nombre de su anuncio, el puesto que perdió y el monto necesario para recuperarlo.
- **Bypass Admin Afiliados**: El administrador accede a `/admin/ads`, asigna un afiliado en el Puesto #1; el puesto queda inmediatamente ocupado y visible en la marquesina sin requerir membresía de Whop.

---

## Autenticación Directa desde Footer

Permite a cualquier fundador o patrocinador autenticarse en su cuenta desde el pie de página global ("Plataforma") sin necesidad de navegar a la página de edición de su startup.

### Contrato
- **Endpoints**:
  - `POST /api/auth/send-otp` (acepta `{ email: string, saasId?: string }`).
  - `POST /api/auth/verify-otp` (acepta `{ email: string, code: string }`).
- **Componentes**:
  - `components/LoginModal.vue`
  - `composables/useLoginModal.ts`
  - Botón en `ui/sections/GlobalFooter.vue`

### Dominio
- "Al pulsar '¿Tienes una cuenta? Inicia sesión aquí.' en el footer, si el usuario ya está autenticado es redirigido a `/dashboard`. Si no, se abre el modal de login."
- "El usuario ingresa su correo. El backend verifica si existe en `founders`, `saas_entries` o `ads` y despacha un código OTP de 6 dígitos por email."
- "Al ingresar el código correcto, se genera la sesión en `founder_sessions` y se redirige a `/dashboard`."

---

## Notificación por Email al Registrar Startup

### Contrato
- **Módulo**: `modules/add-saas/server/services/founderEmail.ts`
- **Invocación**: Automática en `modules/add-saas/server/api/publish.post.ts`.

### Dominio
- "Al registrar una startup exitosamente, si se proporcionó `founderEmail`, el servidor despacha un correo de bienvenida transaccional con la plantilla de diseño Facto (`facto-email-design`)."
- "El correo incluye el nombre de la startup, enlace para reclamarla / editarla y botón directo a `/dashboard`."

---

## Carga Resiliente de Actividad GitHub

### Contrato
- `server/api/github/activity.get.ts`
- `modules/visuals/components/BentoGithubHeatmap.vue`

### Dominio
- "Si la API de GitHub devuelve HTTP 202 Accepted (estadísticas en proceso de cálculo), el servidor reintenta hasta 3 veces con intervalos de 1200ms."
- "Si continúa en 202, el endpoint responde con `status: 'computing'`. El componente en el frontend mantiene el spinner de carga y ejecuta un sondeo automático tras 2 segundos (hasta 3 intentos)."
- "En caso de falla o repositorio sin actividad, la interfaz ofrece un botón manual para 'Reintentar' sin forzar la recarga completa del navegador."

---

### Iconos

Este proyecto tiene nuxt icons instalado para su uso.

---

## Feedback / Reportes

Flujo para que los usuarios puedan reportar errores o dar feedback general de la plataforma enviando detalles y una imagen que se envía a Supabase y se lista en el panel de administrador.

### Contrato

**Ubicación arquitectónica:**
- `modules/feedback/types/index.ts` — tipos compartidos
- `modules/feedback/views/FeedbackView.vue` — vista del formulario (`/feedback`)
- `modules/feedback/views/AdminReportsView.vue` — vista del panel admin (`/admin/reportes`)
- `modules/feedback/server/api/submit.post.ts` — endpoint público para crear reporte
- `modules/feedback/server/api/list.get.ts` — endpoint protegido para listar reportes
- `pages/feedback.vue` — página pública
- `pages/admin/reportes.vue` — página protegida admin

**Supabase:**
```sql
CREATE TABLE feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  details text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Además se necesita un bucket de storage llamado `feedback_images`
```

**Interfaces TypeScript:**
```ts
interface FeedbackReport {
  id: string
  details: string
  imageUrl: string | null
  status: 'pending' | 'resolved'
  createdAt: string
}

interface FeedbackSubmission {
  details: string
  imageFile?: File
}
```

### Dominio

- "Cualquier usuario (incluso no logueado) puede entrar a `/feedback` y reportar un error."
- "El campo `details` es obligatorio."
- "El campo `imageFile` (captura) es opcional, pero recomendado."
- "Al hacer submit, el frontend sube la imagen (si existe) al bucket `feedback_images` mediante la API de Nuxt y obtiene una URL pública."
- "El servidor guarda el texto y la `image_url` en la tabla `feedback_reports`."
- "La página `/admin/reportes` muestra un listado (grid o cards) con los reportes más recientes primero."
- "La ruta `/admin/reportes` o sus llamados al API deben estar protegidos por el mecanismo de admin del proyecto (e.g., middleware con `x-admin-key`)."

### Validación

- **Happy Path**: Usuario rellena texto e imagen, presiona Enviar. Recibe feedback visual de éxito y se crea el registro en Supabase.
- **Sin imagen**: Usuario envía solo texto. Se guarda en BD con `image_url: null`.
- **Admin**: Acceso a `/admin/reportes` requiere verificación exitosa. Si no tiene acceso, es redirigido o bloqueado. Muestra la tabla de reportes correctamente.

---

## Bot de Telegram (Hitos, Resumen Diario y Oportunidades)

Sistema automatizado desacoplado mediante arquitectura Outbox y Snapshots para publicar cambios en el ranking, hitos de facturación, récords por país, visitas y oportunidades curadas de inversión/crecimiento sin spam y con idempotencia garantizada.

### Contrato

**Ubicación arquitectónica:**
- `modules/notifier/types/index.ts` — tipos de eventos, snapshots, payloads y estados
- `modules/notifier/const/config.ts` — umbrales, límites de tasa, horario de silencio y configuración centralizada
- `modules/notifier/server/db/schema.sql` — esquema DDL aditivo para tablas `notification_events`, `notification_snapshots` y `notification_locks`
- `modules/notifier/server/db/storage.interface.ts` — interfaz de persistencia
- `modules/notifier/server/db/supabase.storage.ts` — implementación en Supabase con fallback resiliente
- `modules/notifier/server/db/memory.storage.ts` — almacenamiento en memoria para pruebas
- `modules/notifier/server/services/telegram.client.ts` — cliente nativo de Telegram Bot API con rate limit, retry_after, backoff exponencial y soporte dry-run
- `modules/notifier/server/services/visits.provider.ts` — interfaz y proveedor desacoplado de visitas agregadas
- `modules/notifier/server/services/anti-spam.service.ts` — control de horario de silencio (23:00 a 07:00) y tope diario de hitos
- `modules/notifier/server/services/formatters/html.formatter.ts` — escape HTML, formato numérico ($1K, $12.4K, $1.2M), UTM links y división de mensajes largos (<4096 caracteres)
- `modules/notifier/server/services/formatters/message.templates.ts` — plantillas de mensajes en español neutro
- `modules/notifier/server/services/detectors/` — detectores puros:
  - `new-startups.detector.ts` — detección y batching de startups nuevas
  - `country-records.detector.ts` — nuevos récords históricos de facturación y cantidad por país (+5% margen)
  - `ranking-moves.detector.ts` — cambios de orden en Top 10 / Top 3 y adelantamientos
  - `visits-records.detector.ts` — récords de visitas diarias (1 por día)
  - `opportunities.detector.ts` — scoring determinista y cooldown de 14 días
  - `digest.detector.ts` — generador del resumen diario con fallback honesto ("día tranquilo")
- `modules/notifier/server/services/outbox.service.ts` — procesador de cola con lock distribuido y despacho ordenado por prioridad
- `modules/notifier/server/services/snapshot.service.ts` — captura de estado de la plataforma y baseline
- `modules/notifier/server/services/notifier.orchestrator.ts` — orquestador central de los flujos de ejecución
- `modules/notifier/server/api/notifier/run.post.ts` — endpoint para ciclo de hitos
- `modules/notifier/server/api/notifier/digest.post.ts` — endpoint para resumen diario
- `modules/notifier/server/api/notifier/status.get.ts` — endpoint de estado y diagnóstico

**Variables de Entorno:**
```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=...
TELEGRAM_ADMIN_CHAT_ID=...
NOTIFIER_ENABLED=false
NOTIFIER_DRY_RUN=true
NOTIFIER_TIMEZONE=America/Bogota
DIGEST_HOUR=18
NOTIFIER_MAX_DAILY_MILESTONES=8
```

### Dominio

- **Idempotencia Estricta**: Cada evento tiene una `dedupe_key` única. Dos ciclos seguidos nunca duplican mensajes.
- **Primera Ejecución / Línea Base**: Si no existe snapshot previo, se inicializa la línea base y **no** se emiten eventos históricos.
- **Detectores Puros**: Son funciones deterministas sin llamadas a Telegram ni efectos secundarios externos.
- **Scoring de Oportunidades Verificable**: Prohibido inventar cifras o proyecciones. El score se basa únicamente en: crecimiento real de MRR (+40 pts para >50%), hitos absolutos de MRR, facturación verificada por pasarela (+15 pts), novedad de lanzamiento (+15 pts) y tracción. Cooldown de 14 días salvo salto significativo de MRR (>= +30%).
- **Anti-Spam y Horario de Silencio**: Máximo 8 mensajes de hitos al día; horario de silencio entre 23:00 y 07:00 en `NOTIFIER_TIMEZONE` (los hitos se postergan o agrupan en el resumen diario).
- **Seguridad en Telegram**: Modo `parse_mode=HTML` con escape estricto de `&`, `<`, `>`. Límite de 4096 caracteres con división por bloques enteros. Rate limit de ~1 msg/s. Manejo de 429 con `retry_after`, 5xx con backoff exponencial y 400/403 marcados como fallas definitivas con alerta inmediata al admin.

### Validación

- **Happy Path Hitos**: Nuevas startups agregadas -> Detectadas y agrupadas en la cola con dedupe key -> Despachadas al canal.
- **Happy Path Resumen Diario**: Ejecución a la hora configurada -> Genera resumen con startups nuevas, delta de facturación global, top países, visitas y oportunidades curadas con disclaimer financiero.
- **Día Tranquilo**: Sin cambios en métricas -> Resumen honesto indicando día tranquilo.
- **Línea Base Segura**: Primera ejecución -> Guarda snapshot sin generar eventos.
- **Idempotencia**: Dos ejecuciones sucesivas -> La segunda encuentra 0 eventos nuevos.
- **Dry-Run**: `NOTIFIER_DRY_RUN=true` -> Simula todo el ciclo en consola sin realizar peticiones a Telegram.
- **Fallas de Red / 429**: Telegram responde 429 -> El cliente espera `retry_after` y reintenta exitosamente.
- **Fallas Fatales / 403**: Token o permisos inválidos -> El evento se marca como fallido y se envía alerta al chat admin sin reintentos infinitos.