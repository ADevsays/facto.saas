# spec.md — Documento de Verdad

Este archivo es la única fuente de verdad del proyecto. El agente lo lee antes de implementar cualquier feature y lo actualiza al completarlo.

Cada feature sigue la estructura: **Contrato → Dominio → Validación**.

---

# Qué es Facto

Facto es una plataforma que permite a los fundadores de SaaS publicar sus productos en un ranking global. El ranking se ordena por MRR (Monthly Recurring Revenue) y permite a los usuarios filtrar por categoría, nombre, fundador, etc.

Su forma de monetización es mediante anuncios pagados en la banda superior, con un límite de solo 20 espacios disponibles.

Además de su función principal maneja tools orbitantes útiles para los usuarios.

## Diseño Global (Layout)

El diseño de Facto es minimalista, oscuro y premium. 

### Banda de Anuncios (Ads Banner)
- **Persistencia**: La banda de anuncios (`AdsBandSection.vue`) es un elemento global ubicado en el layout `default.vue`.
- **Visibilidad**: Debe estar visible por defecto en todas las rutas del sitio, **excepto en `/info`**.
- **Comportamiento**: Se mantiene en la parte superior (`sticky top-0`) actuando como el detalle superior constante de la navegación.
- **Implicación en Páginas**: Todas las páginas (excepto `/info`) deben estructurarse asumiendo la presencia de este banner (ej: rellenos superiores adecuados para que el contenido no quede oculto bajo el banner sticky).

---

## Buscador de Startups

Buscador global que permite filtrar el ranking de startups por cualquier criterio (nombre, categoría, fundador, etc.).

### Contrato
- **Sincronización**: Composable global `composables/useStartupSearch.ts`.
- **Interface `StartupSearchState`**:
  - `query`: `string` (texto de búsqueda).
- **Componente**: `modules/input-mrr/components/MrrInput.vue` (refactorizado como barra de búsqueda).

### Dominio
- "El buscador debe filtrar las startups del ranking en tiempo real."
- "La búsqueda debe ser insensible a mayúsculas/minúsculas (case-insensitive)."
- "Se debe buscar coincidencia en los campos: `name`, `category`, `founder` y `mrr`."
- "Si la `query` está vacía, se muestra la lista completa."
- "Si no hay coincidencias, se debe mostrar un estado vacío en el ranking."

### Validación
- **Happy Path**: Buscar "Stripe" -> Solo se muestra el registro de Stripe.
- **Happy Path**: Buscar "Design" -> Se muestran todas las startups de esa categoría.
- **Búsqueda Vacía**: Borrar el texto -> Se restauran los 10 registros originales.
- **Edge Case**: Búsqueda con caracteres especiales o espacios extra -> El sistema debe hacer `trim()` y manejar strings seguros.
- **Edge Case**: Sin resultados -> El ranking muestra "No se encontraron resultados".

---

## Agregar un SaaS

Flujo de dos pasos que permite a un founder publicar su SaaS en el ranking. **El orden del flujo es: primero los datos del SaaS, después (opcionalmente) el API key.** La arquitectura del provider es **provider-agnostic**: el mismo flujo soporta Stripe, MercadoPago y futuros. El MRR se calcula servidor a servidor y se recalcula en cada visita a la página del SaaS.

> **Diseño**: Todos los componentes visuales deben aplicar la skill `facto-design`.

### Contrato

**Ubicación arquitectónica:**
- `modules/add-saas/types/index.ts` — tipos compartidos del módulo
- `modules/add-saas/views/AddSaasView.vue` — página principal (`/agregar`)
- `modules/add-saas/sections/StepInfoSection.vue` — Paso 1: formulario de datos del SaaS
- `modules/add-saas/sections/StepKeySection.vue` — Paso 2: conexión opcional del API key
- `modules/add-saas/components/ProviderSelector.vue` — selector visual de provider (Stripe / MercadoPago)
- `modules/add-saas/components/CategorySelect.vue` — dropdown de categorías (cargadas desde `useSaasList`)
- `modules/add-saas/components/MrrStatusBadge.vue` — badge de estado MRR (conectado / bloqueado / cero)
- `modules/add-saas/server/services/provider.interface.ts` — interfaz base de provider
- `modules/add-saas/server/services/stripe.service.ts` — implementación Stripe
- `modules/add-saas/server/services/mercadopago.service.ts` — implementación MercadoPago
- `modules/add-saas/server/services/provider.factory.ts` — factory que resuelve el service por provider
- `modules/add-saas/server/api/validate.post.ts` — validación del key (provider-agnostic)
- `modules/add-saas/server/api/publish.post.ts` — publicación del SaaS
- `modules/add-saas/server/api/[id]/mrr.get.ts` — MRR on-demand (llama al service del provider correcto)

**Flujo UX:**
1. El founder hace click en "Agrega tu MRR" en la home → navega a `/add`.
2. **Paso 1 — Datos del SaaS** (`StepInfoSection`): Formulario con los campos:
   - `name` (string, obligatorio)
   - `logoUrl` (string, URL de imagen, opcional)
   - `founderName` (string, opcional)
   - `websiteUrl` (string, URL, opcional)
   - `startupType` (string libre, ej: "B2B SaaS", "PLG", "Marketplace", opcional)
   - `categorySlug` (uuid vía `CategorySelect`, obligatorio)
3. **Paso 2 — API Key** (`StepKeySection`): El founder elige un provider y pega su key.
   - Si conecta key válida → MRR calculado y visible en el ranking.
   - Si **salta este paso** (CTA "Publicar sin MRR") → SaaS publicado con `mrr: null`, badge "MRR bloqueado" en la UI.

**Interfaces TypeScript:**
```ts
type PaymentProvider = 'stripe' | 'mercadopago'

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

**Endpoints** _(archivos en `modules/add-saas/server/api/`)_:
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
- Permiso requerido en Restricted Key: `subscriptions → Read`
- `GET https://api.stripe.com/v1/subscriptions?status=active&limit=100`
- Header: `Authorization: Bearer <providerKey>`
- Cálculo MRR por suscripción: `items.data[].price.unit_amount × quantity × (interval === 'year' ? 1/12 : interval === 'week' ? 4.33 : 1) / 100`

**MercadoPago** (`provider: 'mercadopago'`):
- Credencial: Access Token (modo producción, solo lectura de suscripciones)
- `GET https://api.mercadopago.com/preapproval/search?status=authorized&limit=100`
- Header: `Authorization: Bearer <providerKey>`
- Cálculo MRR: `results[].auto_recurring.transaction_amount` (ya viene en mensual)
- Moneda: `results[].auto_recurring.currency_id` (ej: `ARS`, `BRL`, `MXN`, `CLP`)

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

**Recálculo de MRR:**
- "Al visitar la página de detalle de un SaaS, el servidor llama al service del provider almacenado con el key cifrado."
- "El botón 'Reload' en la página del SaaS dispara el mismo endpoint manualmente."
- "Si el key ya no es válido al momento del reload → `mrr: null`, badge 'Key expirada' en la UI."

### Validación
- **Happy Path completo**: Datos + Key válida Stripe → MRR calculado, SaaS visible en ranking con MRR.
- **Happy Path sin key**: Solo datos → SaaS publicado con `mrr: null`, badge "MRR bloqueado".
- **Key MercadoPago**: Access Token válido, 8 preapprovals → MRR sumado en moneda local.
- **Key inválida**: Respuesta 401 → error inline en Paso 2, el founder puede publicar igual sin MRR.
- **MRR = 0**: Key válida sin suscripciones activas → SaaS publicado con `$0`.
- **Categoría inválida**: `categorySlug` no existe en BD → `publish.post.ts` devuelve 422.
- **Edge Case — Nuevo provider**: Solo crear service + registrar en factory → funciona sin cambios en API ni UI.
- **Edge Case — Key expirada en reload**: Key válida al publicar, revocada después → `mrr: null` en el detalle.
- **Seguridad**: El API key nunca se expone en respuestas al cliente. Solo se usa server-side. Se almacena cifrado.

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

-- Tabla principal
CREATE TABLE saas_entries (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   text,                                              -- null si incógnito
  logo_url               text,                                              -- null si incógnito
  website_url            text,                                              -- null si incógnito
  founder_name           text,                                              -- null si incógnito
  is_incognito           boolean     NOT NULL DEFAULT false,
  mrr                    numeric,                                           -- null si key expiró
  currency               text        NOT NULL DEFAULT 'USD',
  category_id            uuid        REFERENCES categories(id) ON DELETE SET NULL,
  provider_id            uuid        REFERENCES payment_providers(id) ON DELETE SET NULL,
  provider_key_encrypted text,
  views                  bigint      NOT NULL DEFAULT 0,
  published_at           timestamptz NOT NULL DEFAULT now()
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
  ('Stripe', 'stripe'), ('MercadoPago', 'mercadopago');
```

**Implicaciones del diseño normalizado:**
- `category` y `provider` de `SaasListItem` se resuelven con JOIN en el service; nunca se almacenan como texto en `saas_entries`.
- Al agregar un SaaS, el endpoint `publish.post.ts` debe recibir `categorySlug` y `providerSlug`, resolver los UUIDs correspondientes y guardar los FK.
- Para filtrar por categoría en el endpoint, el service hace primero `SELECT id FROM categories WHERE slug = ?` y luego filtra por `category_id`.
- Para añadir un nuevo proveedor de pagos basta con insertar en `payment_providers`; no requiere cambios en código.

**Interfaces TypeScript:**
```ts
type PaymentProvider = 'stripe' | 'mercadopago'
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
  category?: string   // slug de categoría
  q?: string
  limit?: number
  offset?: number
}
```

**Endpoints:**
- `GET /api/ranking/list` — devuelve `SaasListItem[]`
  - `sort`: `mrr` (default) | `latest` | `views`
  - `category`: slug (ej: `dev-tools`)
  - `q`: búsqueda global sobre `name` e `founder_name` (ilike server-side)
  - `limit` / `offset`: paginación (default: 100/0)
- `GET /api/ranking/latest` — 6 más recientes (`sort=latest&limit=6`)
- `GET /api/ranking/top` — 6 más vistos (`sort=views&limit=6`)
- `GET /api/ranking/ranking` — ranking completo por MRR (`sort=mrr`)

**Derivaciones por sección de UI** (computed desde `useSaasList`, sin fetch extra):
- `rankingItems` — lista completa ordenada por MRR desc → `RankingSection`
- `recentItems` — top 6 por `publishedAt DESC` → `RecentlySection`
- `bestItems` — top 6 por MRR desc (sin nulls) → `BestSection`

### Dominio
- "El composable `useSaasList` hace un único fetch al montar la app. Las tres secciones son vistas derivadas del mismo array en memoria."
- "Si un SaaS tiene `is_incognito: true`, se muestra con nombre '— Anónimo —', sin logo y sin link."
- "Si `mrr` es `null`, se muestra '—' en lugar de una cifra. El SaaS aparece al fondo del ranking."
- "El filtro por `q` se aplica server-side con `ilike` sobre `name` y `founder_name`. El filtro en memoria de `useStartupSearch` es una capa adicional sin fetch."
- "Las categorías disponibles en el buscador se derivan dinámicamente de los items ya cargados en `useSaasList`, no de un fetch separado."
- "La sección `RecentlySection` y `BestSection` no tienen paginación; muestran máximo 6 items."

### Validación
- ✅ **Happy Path**: SaaS publicados → Ranking muestra ordenados por MRR, Recently los 6 más nuevos, Best los 6 con mayor MRR.
- ✅ **SaaS Incógnito**: `is_incognito: true` → Aparece con '— Anónimo —', sin logo, sin link.
- ✅ **MRR null**: SaaS con key inválida → Aparece al final del ranking con '—'.
- ✅ **Listado vacío**: Sin SaaS publicados → Cada sección muestra estado vacío.
- ✅ **Filtro por categoría**: Tab seleccionado → `useStartupSearch` filtra el array en memoria.
- ✅ **Búsqueda vacía**: Borrar texto → Se restaura la lista completa.
- ✅ **Sin resultados**: Query sin coincidencias → RankingSection muestra "No se encontraron resultados".

---

## Pasarela de Pago (Polar.sh)

Integración para el manejo de suscripciones que habilitan la publicación de anuncios.

### Contrato
- **Tipos**: `modules/payments/types/polar.ts`
- **Interfaces**:
  - `PolarSubscription`: `{ id: string, status: 'active' | 'canceled', customer_id: string }`
  - `WebhookPayload`: `{ type: string, data: PolarSubscription }`
- **Endpoint**: `POST /api/webhooks/polar`

### Dominio
- "Un usuario autenticado puede iniciar el checkout de suscripción vía Polar.sh."
- "Si el webhook recibe `subscription.created` o `subscription.updated` con status `active`, habilitar la creación de anuncios (`can_post_ads: true`)."
- "Si la suscripción se cancela o expira, deshabilitar la creación de nuevos anuncios."
- **Idempotencia**: "Cada `webhook_id` debe registrarse en la base de datos. Si el ID ya existe, ignorar el evento para evitar duplicados."

### Validación
- **Happy Path**: Pago exitoso -> Webhook procesado -> Usuario puede añadir anuncios.
- **Idempotencia**: Recibir el mismo webhook 3 veces -> Solo se procesa la primera vez, el resto devuelve 200 OK sin cambios.
- **Edge Case**: Suscripción cancelada durante el periodo de facturación -> Mantener acceso hasta el final del ciclo (determinado por `current_period_end`).
- **Error**: Webhook con firma inválida -> Devolver 401 Unauthorized sin procesar.
