# 🤖 Facto Telegram Bot — Guía de Configuración y Operación

El bot de Telegram de Facto publica automáticamente en un canal público los hitos del ecosistema (nuevas startups, récords por país, movimientos de ranking, visitas) y un resumen diario curado con oportunidades deterministas.

---

## 1. Crear el Bot con @BotFather

1. En Telegram, abre una conversación con [@BotFather](https://t.me/BotFather).
2. Envía el comando `/newbot`.
3. Sigue las instrucciones e ingresa un nombre (ej. `Facto Bot`) y un username (ej. `FactoSaasBot`).
4. BotFather te responderá con el **Token de la API** (ej. `7123456789:AAH...`).
5. Copia este valor a tu `.env` como `TELEGRAM_BOT_TOKEN`.

---

## 2. Agregar el Bot al Canal como Administrador

1. Abre tu canal de Telegram (ej. `@factosaas` o canal privado).
2. Ve a los **Ajustes del Canal** -> **Administradores** -> **Añadir Administrador**.
3. Busca el username de tu bot (ej. `@FactoSaasBot`).
4. Asígnale el permiso obligatorio: **"Publicar mensajes" (Post messages)**.
5. Guarda los cambios.

---

## 3. Obtener el ID del Canal y del Chat de Administrador

### ID del Canal (`TELEGRAM_CHANNEL_ID`)
- **Canales públicos con alias:** Puedes usar directamente el alias con `@` (ej. `@factosaas`).
- **Canales privados:**
  1. Reenvía cualquier mensaje de tu canal al bot [@userinfobot](https://t.me/userinfobot) o [@JsonDumpBot](https://t.me/JsonDumpBot).
  2. Obtendrás un ID numérico negativo que empieza por `-100` (ej. `-1002345678901`).
  3. Asígnalo en `.env` como `TELEGRAM_CHANNEL_ID`.

### ID del Administrador (`TELEGRAM_ADMIN_CHAT_ID`)
- Abre una conversación privada con [@userinfobot](https://t.me/userinfobot) desde tu cuenta personal de Telegram.
- Copia tu `Id` numérico y asígnalo en `.env` como `TELEGRAM_ADMIN_CHAT_ID`.

---

## 4. Variables de Entorno (`.env`)

```env
# Configuración del Bot de Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=@factosaas
TELEGRAM_ADMIN_CHAT_ID=123456789

# Control de Operación
NOTIFIER_ENABLED=false
NOTIFIER_DRY_RUN=true
NOTIFIER_TIMEZONE=America/Bogota
DIGEST_HOUR=18
NOTIFIER_MAX_DAILY_MILESTONES=8
```

---

## 5. Activar y Desactivar Envíos Reales

| Modo | Configuración en `.env` | Comportamiento |
| :--- | :--- | :--- |
| **Simulación (Dry-Run)** *(Por defecto)* | `NOTIFIER_DRY_RUN=true`<br>`NOTIFIER_ENABLED=false` | Calcula estados, detecta hitos y simula envíos en logs sin realizar llamadas a Telegram. |
| **Producción (Envíos Reales)** | `NOTIFIER_DRY_RUN=false`<br>`NOTIFIER_ENABLED=true` | Envía mensajes reales al canal y alertas críticas al chat admin. |
| **Apagado de Emergencia (Kill Switch)** | `NOTIFIER_ENABLED=false`<br>`NOTIFIER_DRY_RUN=true` | Detiene inmediatamente cualquier intento de publicación externa. |

---

## 6. Comandos CLI Disponibles

```bash
# 1. Simulación completa (dry-run sin envíos reales)
pnpm run notifier:dry-run

# 2. Inicializar / restablecer línea base (captura estado actual sin enviar mensajes históricos)
pnpm run notifier:baseline

# 3. Ejecutar ciclo de detección de hitos y despacho de cola
pnpm run notifier:run

# 4. Generar y enviar el Resumen Diario (Daily Digest)
pnpm run notifier:digest

# 5. Enviar mensaje de prueba de conectividad al chat admin
pnpm run notifier:test-message

# 6. Ejecutar suite de pruebas unitarias y de integración
pnpm test
```

---

## 7. Automatización con Cron Jobs / Webhooks

Puedes invocar los endpoints de servidor protegidos mediante HTTP:

- **Ciclo de Hitos (cada 5 a 15 minutos):**
  `POST /api/notifier/run` (Header: `x-admin-key: <ADMIN_SECRET_KEY>`)
- **Resumen Diario (todos los días a las 18:00):**
  `POST /api/notifier/digest` (Header: `x-admin-key: <ADMIN_SECRET_KEY>`)
- **Monitoreo de Estado de la Cola y Salud:**
  `GET /api/notifier/status` (Header: `x-admin-key: <ADMIN_SECRET_KEY>`)
