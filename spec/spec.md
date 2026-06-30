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

## Pasarela de Pago (Whop) y Módulo de Ads

Integración para el manejo de membresías de anunciantes usando la pasarela de Whop, registro automático de usuarios y creación de cuentas.

### Contrato
- **Endpoints**:
  - `POST /api/webhooks/whop` (Recibe `membership.activated` y guarda el `whop_user_id` y `email`).
  - `GET /api/ads/session?email=...` (Verifica que un email tenga pago activo y no usado).
  - `POST /api/ads/setup` (Crea la cuenta en Supabase Auth, inserta el anuncio y marca la membresía como usada).
  - `POST /api/admin/ads/create` (Administrador - Bypass automático con `x-admin-key`).
- **Interfaces**:
```ts
interface WhopMembership {
  id: string
  whop_user_id: string
  whop_membership_id: string
  email: string
  status: 'active' | 'inactive'
  used: boolean
  created_at: string
}

interface AdSetupPayload {
  email: string
  password: string
  name: string
  description: string
  url: string
  image_url: string
}
```

### Dominio
- "La pasarela de pago para la publicación de anuncios es **Whop**."
- "Flujo principal de Ads:"
  1. El usuario hace clic en 'Quiero llegar a 10k' → redirige a la URL estática del checkout de Whop.
  2. El usuario paga en Whop. El webhook `membership.activated` de Whop notifica a Facto (`/api/webhooks/whop`).
  3. Facto guarda en la tabla `whop_memberships` el `whop_user_id`, `email`, y `membership_id` con `used: false`.
  4. Whop redirige al usuario de vuelta a Facto (`/ads/setup`).
  5. En `/ads/setup`, el usuario ingresa el email con el que pagó.
  6. El sistema verifica si ese email tiene una membresía activa y `used: false`.
  7. Si es válido, el usuario puede introducir una contraseña y los datos de su anuncio.
  8. El sistema crea una cuenta en Supabase Auth (Service Role), crea el anuncio y marca la membresía como usada.
- "Bypass de Admin:"
  - "El middleware `adminAuth.ts` verifica el `x-admin-key`. Al pasar la validación, `/api/admin/ads/create` se salta la verificación de pago y el anuncio se publica automáticamente (`is_active: true`)."
- **Webhooks**: "El evento `membership.deactivated` actualiza la tabla a `status: inactive` y desactiva el anuncio vinculado en la tabla `ads`."

### Validación
- **Happy Path Webhook**: Usuario paga, se recibe webhook, `whop_memberships` registra el pago. El usuario va a `/ads/setup`, escribe su correo y el sistema lo valida. Llena el formulario, envía y se crea su cuenta y su Ad.
- **Error - Email Inválido**: En `/ads/setup`, el usuario ingresa un email que no existe en `whop_memberships` o que ya tiene `used: true`. El sistema lanza 404/403.
- **Happy Path Admin**: Un admin hace el POST a `/api/admin/ads/create` con el header `x-admin-key` correcto. El Ad se inserta directamente.
- **Error - Admin Inválido**: Una petición a `/api/admin/ads/create` con un `x-admin-key` incorrecto es bloqueada por el middleware con 401 Unauthorized.

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
- **Sin texto**: El frontend bloquea el formulario si falta el detalle (es requerido).
- **Admin**: Acceso a `/admin/reportes` requiere verificación exitosa. Si no tiene acceso, es redirigido o bloqueado. Muestra la tabla de reportes correctamente.