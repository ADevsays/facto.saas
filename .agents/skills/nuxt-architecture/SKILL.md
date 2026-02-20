---
name: nuxt-architecture
description: Entiende arquitecturas Nuxt.js 3 feature-based modulares y genera nuevos componentes, módulos y utilidades respetando las convenciones. Usar cuando se necesite crear nuevos features/módulos, agregar componentes, implementar composables, añadir páginas con routing, crear utilidades, o entender dónde ubicar archivos según su tipo en proyectos Nuxt.js 3
---

# Nuxt Architecture Skill

Esta skill ayuda a generar código para proyectos Nuxt.js 3 con arquitectura feature-based modular, respetando las convenciones y estructura del proyecto.

## Arquitectura General

Proyectos Nuxt.js 3 con enfoque **feature-based modular**:
- Módulos independientes organizados por funcionalidad
- Convenciones de Nuxt.js 3 (auto-import, file-based routing)
- TypeScript y Composition API

## Estructura de Directorios

### Módulos (`modules/<feature>/`)

Cada feature tiene su propia carpeta con estructura completa:

```
modules/<feature-name>/
├── components/      # Componentes específicos del feature
├── composables/     # Lógica reutilizable del feature
├── server/          # Funciones server-side
├── views/           # Vistas/páginas del feature
├── sections/        # Secciones de páginas (opcional)
├── store/           # Estado Pinia (opcional)
└── test/            # Tests del feature (opcional)
```

**Ejemplo:** `modules/articles/`, `modules/badges/`, `modules/bank/`

### Componentes Globales (`components/`)

```
components/
└── UI/             # Componentes reutilizables globalmente
    ├── BackButton.vue
    ├── Coin.vue
    ├── Header.vue
    └── ...
```

- **Naming:** PascalCase descriptivo
- **Auto-imported** en toda la app por Nuxt

### Composables

**Globales** (`composables/`):
- Lógica compartida entre features
- Ejemplo: `useFetch.ts`

**Por módulo** (`modules/<feature>/composables/`):
- Lógica específica del feature
- Ejemplo: `useCheckCoins.ts`

**Convenciones:**
- Naming: `use<Functionality>.ts` (camelCase)
- Export: `export function use<Name>()`

### Utils (`utils/`)

Funciones helper puras sin estado:
- Naming: camelCase descriptivo
- Export: default o named exports
- Ejemplos: `insertYTVideo.ts`, `getThumbnailYT.ts`, `turnidAvatar.ts`

### Constantes (`const/`)

Valores constantes compartidos:
- Naming: camelCase para archivos
- Exportan objetos con naming semántico
- Ejemplos: `coins.ts` (prices, types), `navigation.ts`, `authErrors.ts`

### Pages (`pages/`)

File-based routing de Nuxt:
- Dynamic routes: `[param].vue`
- Nested folders para rutas anidadas
- Naming: kebab-case o camelCase
- Ejemplos: `noticias/[newName].vue`, `certificados/[id].vue`

## Patrones de Código

### Componentes Vue

```vue
<script setup lang="ts">
const props = defineProps<{
    title: string;
    description: string;
}>();

// Composables
const { data } = useSomeComposable();
</script>

<template>
    <div class="...">
        {{ props.title }}
    </div>
</template>
```

**Características:**
- `<script setup lang="ts">` con TypeScript
- Props con `defineProps<{ ... }>()`
- TailwindCSS para estilos
- Composables en setup

### Composables

```typescript
export function useFeatureName() {
    const state = ref();
    
    const doSomething = async () => {
        // lógica
    };
    
    return {
        state,
        doSomething
    };
}
```

**Características:**
- Export named function
- Retorna objeto con estado y métodos
- Usa Composition API

### Server Functions

```typescript
export default async function actionName(
    url: string,
    params: any,
    fetchWithAuth: Function
) {
    const response = await fetchWithAuth(`${url}/api/endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    
    return response;
}
```

**Características:**
- Async functions
- Reciben: url, params, fetchWithAuth
- Retornan data o result

## Árbol de Decisión

¿Qué estoy creando?

**Componente Vue:**
- ¿Específico de un feature? → `modules/<feature>/components/<Name>.vue`
- ¿Reutilizable globalmente? → `components/UI/<Name>.vue`

**Lógica reutilizable (composable):**
- ¿Específico de un feature? → `modules/<feature>/composables/use<Name>.ts`
- ¿Global? → `composables/use<Name>.ts`

**Función helper pura:** → `utils/<functionName>.ts`

**Valores constantes:** → `const/<category>.ts`

**Página/Ruta:** → `pages/<route-path>.vue`

**Función server-side:** → `modules/<feature>/server/<action>.ts`

**Nuevo feature completo:** → `modules/<feature-name>/` (crear estructura completa)

## Ejemplos

Para ejemplos concretos de código, consulta [references/examples.md](references/examples.md)

## Mejores Prácticas

1. **Organización por feature:** Mantén todo lo relacionado a un feature junto
2. **Componentes específicos vs globales:** Solo UI reutilizable va en `components/UI/`
3. **Composables específicos:** Si solo se usa en un feature, va en el módulo
4. **Naming consistente:** PascalCase componentes, camelCase archivos TS
5. **TypeScript:** Usa tipos para props y datos
6. **Server functions:** Siempre usan autenticación cuando necesario
