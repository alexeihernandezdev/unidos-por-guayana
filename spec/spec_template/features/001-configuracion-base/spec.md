# 001 · Configuración base

> Estado: **Hecho ✅** · Depende de: `000 · Andamiaje inicial` · Roadmap: `constitution/roadmap.md`

## Qué hace

Deja el proyecto listo para construir features de dominio: instala y configura las
librerías ya **elegidas** en `constitution/tech-stack.md` y levanta la estructura de
carpetas de Clean + Screaming Architecture. No implementa ningún dominio todavía
(auth, ayudas, aportes… llegan en features posteriores); solo prepara el terreno.

Cubre tres frentes:

1. **Persistencia** — Prisma + PostgreSQL, con el cliente de Prisma como singleton en
   `src/lib`. Para desarrollo local, PostgreSQL corre en un contenedor de **Docker**
   (`docker-compose.yml`); en producción la base vive en Supabase.
2. **Testing** — Vitest configurado con el alias `@/…`, entorno para componentes React
   y un test de humo que corre en verde.
3. **Librerías de aplicación/UI** — TanStack Query (con su provider), Shadcn (salida a
   `src/shared`), React Hook Form, Zustand y Luxon instaladas y verificadas con un uso
   mínimo.

Y la **estructura objetivo** de carpetas: `src/modules/`, `src/shared/`, `src/lib/` y
`prisma/`.

## Por qué

`constitution/tech-stack.md` lista estas tecnologías como "elegidas pero pendientes de
instalar/configurar". Sin ellas, cada feature de dominio tendría que arrastrar su propia
configuración. Además el límite duro "no añadir dependencias sin avisar" hace de esta
feature el punto único y explícito donde se incorporan las dependencias acordadas.

## Alcance

**Incluye**

- Instalar y configurar: `prisma` + `@prisma/client`, `vitest` (+ entorno de test de
  React), `@tanstack/react-query`, `shadcn` (CLI) + sus dependencias base, `react-hook-form`,
  `zustand`, `luxon` (+ `@types/luxon`).
- `docker-compose.yml` con un servicio de **PostgreSQL** para desarrollo local: imagen
  fijada, credenciales por variables de entorno, puerto publicado y volumen para persistir
  los datos.
- `prisma/schema.prisma` con `datasource` (PostgreSQL) y `generator`, **sin modelos de
  dominio** (los definen las features 002+).
- Cliente Prisma singleton en `src/lib` (evita múltiples instancias en dev con HMR).
- `vitest.config.ts` con resolución del alias `@/…` y entorno `jsdom` para componentes.
- Provider de TanStack Query envolviendo la app (client component) montado en el layout.
- Shadcn inicializado (`components.json`) apuntando sus componentes a `src/shared` y a
  los tokens de Tailwind v4 ya existentes en `globals.css`.
- Carpetas base: `src/modules/`, `src/shared/`, `src/lib/`, `prisma/`.
- `.env.example` con las variables necesarias (p. ej. `DATABASE_URL`). **No** subir `.env`.
- Scripts en `package.json`: `test` (y `test:watch`), y los de Prisma que hagan falta
  (`db:generate`, `db:migrate`).

**No incluye**

- Modelos/entidades de dominio ni migraciones con tablas (llegan con el catálogo y las
  ayudas: features 004+).
- Autenticación (feature 002).
- Componentes de UI de negocio o pantallas (solo los componentes base de Shadcn como
  verificación).
- Pipeline de CI/despliegue.

## Criterios de aceptación

- [ ] `npm install` deja las dependencias listadas instaladas; `package.json` las refleja.
- [ ] `npm run build` compila sin errores.
- [ ] `npm run lint` pasa sin errores (respeta los límites de capas ya definidos en
      `eslint.config.mjs`).
- [ ] `npm run test` ejecuta Vitest y al menos un test de humo pasa; el alias `@/…`
      resuelve dentro de los tests.
- [ ] `docker compose up -d` levanta el contenedor de PostgreSQL y queda accesible en el
      puerto configurado; `docker compose down` lo detiene sin perder los datos del volumen.
- [ ] `DATABASE_URL` de desarrollo apunta al PostgreSQL del contenedor y Prisma conecta.
- [ ] `npx prisma generate` corre sin errores con el `schema.prisma` inicial.
- [ ] Existen las carpetas `src/modules/`, `src/shared/`, `src/lib/` y `prisma/`.
- [ ] El cliente de Prisma vive en `src/lib` como singleton reutilizable.
- [ ] La app arranca (`npm run dev`) con el `QueryClientProvider` activo y sin errores en
      consola.
- [ ] `shadcn` está inicializado (`components.json`) y un componente base (p. ej. `Button`)
      se puede añadir en `src/shared` y renderizar.
- [ ] `.env.example` documenta `DATABASE_URL`; `.env` **no** está versionado.
- [ ] Ningún archivo nuevo viola las convenciones de naming ni la dirección de dependencias
      (domain/application permanecen puras).

## Notas y riesgos

- **Tailwind v4 + Shadcn:** Shadcn debe inicializarse en su versión compatible con Tailwind
  v4 (usa `@import "tailwindcss"` y `@theme inline`, no `tailwind.config.js`). Verificar que
  no reintroduzca un `tailwind.config` clásico.
- **React 19 + React Compiler:** el provider de TanStack Query es un client component; montar
  correctamente en el App Router de Next 16 (ver `node_modules/next/dist/docs/`).
- **Vitest + alias:** resolver `@/…` en los tests (vía `vite-tsconfig-paths` o `resolve.alias`).
- **Migraciones:** requieren una base Postgres accesible (Supabase). Esta feature no crea
  tablas de dominio; la primera migración real llega con la feature del catálogo de recursos.
