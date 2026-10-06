# Implementation Plan: Jev (TypeSafe System One) Moderation & Categorization in Facto

Este documento define la hoja de ruta completa para integrar el modelo **Jev (TypeSafe)** en el pipeline de moderación, categorización y control de spam para el registro de startups en Facto.

---

## 1. Dependencias y Configuración de Entorno
- [ ] **1.1. Instalación de dependencias**
  - Instalar paquete oficial `@typesafe-ai/sdk` en `package.json`.
- [ ] **1.2. Variables de entorno**
  - Añadir variable `TYPESAFE_API_KEY` a `.env.example` y `.env`.
  - Configurar `runtimeConfig.typesafeApiKey` en `nuxt.config.ts` (restringido al contexto del servidor Nitro).

---

## 2. Tipos de Datos y Esquema de Base de Datos
- [ ] **2.1. Tipos de TypeScript (`modules/add-saas/types/moderation.ts`)**
  - Definir interfaces de entrada y salida:
    - `ModerationInput`: `{ name: string; websiteUrl: string; metaDescription?: string | null }`
    - `ModerationRawScores`: `{ isSpamProb: number; isSoftwareProb: number; categoryChoice: string; categoryConfidence: number; audienceChoice: string }`
    - `ModerationResult`: `{ verdict: 'auto_publish' | 'pending_review' | 'rejected'; reasons: string[]; suggestedCategorySlug?: string; targetAudience?: string; rawScores: ModerationRawScores; evaluatedAt: string }`
- [ ] **2.2. Esquema de Base de Datos (Supabase `saas_entries`)**
  - Agregar campos a `saas_entries`:
    - `moderation_data` (`jsonb`, nullable) - almacena el objeto completo de auditoría.
    - `ai_flags` (`text[]`, nullable) - lista de etiquetas de riesgo o validación rápida.

---

## 3. Servicio de Moderación con Jev (`modules/add-saas/server/services/moderation.service.ts`)
- [ ] **3.1. Cláusulas de Guarda y Seguridad (Guard Clauses)**
  - `Guard 1 (Missing API Key)`: Si `TYPESAFE_API_KEY` no está configurada, retornar `pending_review` sin lanzar excepciones.
  - `Guard 2 (Input Sanitization & Token Capping)`:
    - `name` truncado a máximo 80 caracteres.
    - `websiteUrl` normalizado con protocolo `https://` y truncado a 120 caracteres.
    - `metaDescription` sanitizado y truncado a máximo 300 caracteres.
  - `Guard 3 (Empty State)`: Si no hay metadata ni URL accesible, retornar `pending_review`.
  - `Guard 4 (Timeout Guard)`: Configurar timeout estricto de red de 2500 ms con fallback a `pending_review`.
- [ ] **3.2. Formulación de Estado y Preguntas Concurrentes en Paralelo**
  - Enviar una única llamada `client.systemOne` con:
    - `is_spam`: `noul("Does \`meta\` or \`url\` describe spam, casino, crypto-scam, adult, or parked domain?")`
    - `is_software`: `noul("Is \`name\` a software product, SaaS, developer tool, API, or web application?")`
    - `category`: `choice("Which category best fits \`meta\`?", { ai: "...", dev_tools: "...", analytics: "...", marketing: "...", fintech: "...", productivity: "...", other: "..." })`
    - `target_audience`: `choice("Who is the primary customer of \`name\`?", { b2b: "...", b2c: "...", developers: "...", mixed: "..." })`
- [ ] **3.3. Motor de Decisión por Umbrales Probabilísticos**
  - **Rechazo directo (`rejected`)**:
    - Si $P(\text{spam}) \ge 0.85$ o $P(\text{software}) \le 0.15$.
  - **Auto-publicación (`auto_publish`)**:
    - Si $P(\text{software}) \ge 0.80$, $P(\text{spam}) \le 0.10$ y $\text{categoryConfidence} \ge 0.70$.
  - **Revisión manual (`pending_review`)**:
    - Cualquier puntuación intermedia o con baja confianza en categoría.

---

## 4. Integración en el Pipeline de Publicación (`modules/add-saas/server/api/publish.post.ts`)
- [ ] **4.1. Conexión con Scraper y Servicio**
  - Extraer metadata con `fetchWebsiteMetaDescription(websiteUrl)`.
  - Invocar `evaluateSaaSSubmission(...)`.
- [ ] **4.2. Asignación de Estado y Categorización Automática**
  - Si el founder no especificó categoría o la seleccionada es genérica, asignar `suggestedCategorySlug`.
  - Si `verdict === 'auto_publish'` y el startup cuenta con proveedor de pago verificado, establecer `status = 'published'`.
  - Si `verdict === 'rejected'`, establecer `status = 'rejected'` y omitir feeds públicos.
  - Guardar `moderation_data` en Supabase `saas_entries`.
- [ ] **4.3. Control de Notificaciones**
  - Si `status === 'published'`: Disparar `NotifierOrchestrator` reactivo para Telegram y email de bienvenida.
  - Si `status === 'pending_review'`: Enviar email de revisión al administrador incluyendo las razones y scores de Jev.
  - Si `status === 'rejected'`: No disparar alertas externas.

---

## 5. Visualización en Panel de Administración (`modules/admin`)
- [ ] **5.1. Actualización de API de Pendientes (`modules/admin/server/api/admin/pending.get.ts`)**
  - Incluir `moderation_data` y `ai_flags` en la consulta `select`.
- [ ] **5.2. Componente de Revisión (`modules/admin/components/PendingCard.vue`)**
  - Renderizar badges visuales de auditoría:
    - Nivel de riesgo de spam (% y color).
    - Relevancia SaaS (% y badge).
    - Categoría y audiencia sugeridas por IA.
    - Lista de razones (`reasons`) para facilitar aprobación o rechazo en 1 clic.

---

## 6. Pruebas Automatizadas (`modules/add-saas/tests/moderation.test.ts`)
- [ ] **6.1. Tests Unitarios del Servicio**
  - Test 1: Startup SaaS legítima -> `auto_publish`.
  - Test 2: Dominio de casino / crypto scam -> `rejected`.
  - Test 3: Entrada ambigua sin suficiente información -> `pending_review`.
  - Test 4: Manejo de error o timeout de API -> `pending_review` (degradación elegante).
- [ ] **6.2. Test de Integración con `publish.post.ts`**
  - Verificar guardado en base de datos y flujo correcto de notificaciones según el veredicto.
