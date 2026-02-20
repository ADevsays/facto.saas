# Factos

Proyecto Nuxt.js 3 con Vue.js 3 y arquitectura feature-based modular.

## Estructura del Proyecto

Este proyecto sigue una arquitectura modular basada en features, organizada de la siguiente manera:

### Carpetas Principales

```
factos/
├── components/
│   └── UI/              # Componentes UI reutilizables globalmente
├── composables/         # Composables globales compartidos
├── const/               # Constantes compartidas
├── modules/             # Módulos feature-based
│   └── <feature>/
│       ├── components/  # Componentes específicos del feature
│       ├── composables/ # Lógica reutilizable del feature
│       ├── server/      # Funciones server-side
│       ├── views/       # Vistas del feature
│       ├── sections/    # Secciones de páginas
│       └── store/       # Estado Pinia (opcional)
├── pages/               # File-based routing de Nuxt
├── utils/               # Funciones helper puras
└── assets/
    └── css/             # Estilos globales
```

### Convenciones de Naming

- **Componentes Vue**: PascalCase (ej: `BackButton.vue`)
- **Composables**: camelCase con prefijo `use` (ej: `useAuth.ts`)
- **Utils**: camelCase (ej: `formatDate.ts`)
- **Archivos TypeScript**: camelCase (ej: `authErrors.ts`)

## Scripts Disponibles

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Generar sitio estático
npm run generate
```

## Tecnologías

- **Nuxt.js 3**: Framework Vue.js
- **Vue.js 3**: Framework JavaScript progresivo
- **TypeScript**: Tipado estático
- **TailwindCSS**: Framework de CSS
- **Composition API**: API de composición de Vue

## Próximos Pasos

1. Crear módulos feature-based en la carpeta `modules/`
2. Agregar componentes UI globales en `components/UI/`
3. Implementar páginas en `pages/` para el routing
4. Desarrollar composables compartidos en `composables/`

## Arquitectura

Este proyecto sigue el skill **nuxt-architecture**, que define convenciones para:
- Organización por features independientes
- Auto-import de componentes y composables
- File-based routing
- TypeScript y Composition API
