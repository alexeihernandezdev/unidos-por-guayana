# 001 · Configuración base — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (arquitectura,
> convenciones y límites duros).

## Enfoque general

Configuración incremental y verificable: instalar cada bloque, dejarlo funcionando con una
comprobación mínima, y correr `build` / `lint` / `test` antes de pasar al siguiente. El orden
respeta dependencias: **estructura de carpetas → Vitest → Docker (PostgreSQL) → Prisma →
TanStack Query → Shadcn → React Hook Form / Zustand / Luxon**.

> ⚠️ Antes de tocar APIs de Next.js 16 (layout, providers, client components) leer la guía en
> `node_modules/next/dist/docs/` (ver `AGENTS.md`). Esta versión trae cambios importantes.

## 1. Estructura de carpetas

Crear la estructura objetivo descrita en `tech-stack.md`:

```
src/
├── modules/      ← un dominio por carpeta (se llenan en features 002+)
├── shared/       ← código transversal (UI común, utils, tipos) — destino de Shadcn
└── lib/          ← infraestructura global (cliente Prisma, config)
prisma/           ← schema.prisma y migraciones
```

- Como Git no versiona carpetas vacías, sembrar cada una con un `.gitkeep` o un `index.ts`
  de barril vacío hasta que tenga contenido real.
- Verificar que ESLint (`check-file/folder-naming-convention`) no se queje: las carpetas de
  módulo van en kebab-case cuando existan.

## 2. Vitest

- Dependencias (dev): `vitest`, `@vitest/coverage-v8` (opcional), `jsdom`,
  `@testing-library/react`, `@testing-library/jest-dom`, `vite-tsconfig-paths`.
- `vitest.config.ts`: `environment: "jsdom"`, `globals: true`, plugin `tsconfigPaths()` para
  resolver `@/…`, y `setupFiles` para `@testing-library/jest-dom`.
- Scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- **Convención:** tests colocados junto al archivo (`foo.ts` + `foo.test.ts`).
- **Verificación:** un test de humo (p. ej. `src/shared/lib/example.test.ts`) que importe con
  alias `@/…` y pase.

## 3. Docker — PostgreSQL local

- Crear `docker-compose.yml` en la raíz con un servicio `db`:
  - Imagen `postgres` con **tag fijado** (p. ej. `postgres:16`), no `latest`.
  - Variables `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` leídas del entorno (con
    valores por defecto para dev), documentadas en `.env.example`.
  - Puerto `5435:5432` publicado (5435 en el host para no chocar con otro Postgres en 5432).
  - Volumen nombrado (p. ej. `pgdata`) para persistir los datos entre reinicios.
  - `healthcheck` con `pg_isready` para saber cuándo la base acepta conexiones.

  ```yaml
  services:
    db:
      image: postgres:16
      restart: unless-stopped
      environment:
        POSTGRES_USER: ${POSTGRES_USER:-guayana}
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-guayana}
        POSTGRES_DB: ${POSTGRES_DB:-unidos_por_guayana}
      ports:
        - "5435:5432"
      volumes:
        - pgdata:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-guayana}"]
        interval: 5s
        timeout: 5s
        retries: 5
  volumes:
    pgdata:
  ```

- **Verificación:** `docker compose up -d` levanta la base; `docker compose ps` la muestra
  `healthy`; `docker compose down` la detiene sin borrar el volumen.

## 4. Prisma + PostgreSQL

- Dependencias: `@prisma/client` (runtime) + `prisma` (dev).
- `prisma init` genera `prisma/schema.prisma` y añade `DATABASE_URL` a `.env`.
- `schema.prisma` inicial: solo `generator client` y `datasource db { provider = "postgresql" }`.
  **Sin modelos** todavía.
- Cliente singleton en `src/lib/prisma.ts` con el patrón de `globalThis` para no crear
  múltiples clientes con el HMR de Next en dev:

  ```ts
  import { PrismaClient } from "@prisma/client";
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```

- `.env.example`: documentar `DATABASE_URL` y las credenciales del contenedor
  (`POSTGRES_USER`/`PASSWORD`/`DB`). En dev, `DATABASE_URL` apunta al Postgres de Docker
  (p. ej. `postgresql://guayana:guayana@localhost:5435/unidos_por_guayana?schema=public`);
  en producción, a Supabase. **No** versionar `.env`.
- Scripts: `"db:generate": "prisma generate"`, `"db:migrate": "prisma migrate dev"`.
- **Verificación:** `npx prisma generate` corre sin error. La primera migración real se pospone
  a la feature del catálogo (no hay modelos que migrar aún).

## 5. TanStack Query

- Dependencia: `@tanstack/react-query` (+ `@tanstack/react-query-devtools` opcional en dev).
- Crear el provider como **client component** (`"use client"`), con una única instancia de
  `QueryClient` por render de app. Ubicación: `src/app/providers.tsx` (glue de presentación)
  o `src/shared/ui/Providers.tsx` si se prefiere transversal — decidir y dejar consistente.
- Montarlo en `src/app/layout.tsx` envolviendo `children`.
- **Verificación:** la app arranca en `dev` sin errores; devtools (si se añaden) visibles.

## 6. Shadcn

- Inicializar con la CLI en su versión compatible con **Tailwind v4** (`npx shadcn@latest init`).
- Configurar `components.json` para:
  - Estilo/tema apoyado en los tokens ya presentes en `src/app/globals.css` (`@theme inline`).
  - Alias de componentes/utilidades hacia `src/shared` (p. ej. componentes en `src/shared/ui`,
    util `cn` en `src/shared/lib/utils.ts`), coherente con el alias `@/…`.
- Confirmar que **no** reintroduce `tailwind.config.js` (Tailwind v4 es CSS-first).
- **Verificación:** `npx shadcn@latest add button` genera el componente en `src/shared` y se
  puede importar/renderizar; ESLint acepta el naming (PascalCase para `*.tsx`).

## 7. React Hook Form, Zustand, Luxon

- `react-hook-form`, `zustand`, `luxon` + `@types/luxon`.
- No requieren wiring global; se usan por feature. Verificación mínima: importarlas en el test
  de humo o en un uso trivial para confirmar que resuelven y tipan.
- **Zustand/RHF** son paquetes de framework: prohibidos en `domain`/`application` por ESLint;
  su uso vive en `ui`/`infrastructure`.

## Decisiones

- **Sin modelos de dominio en esta feature:** mantiene el alcance en "configuración" y evita
  migraciones que luego habría que rehacer al modelar de verdad.
- **Shadcn a `src/shared`:** encaja con "componentes UI comunes" de la constitución en lugar del
  `src/components/ui` por defecto.
- **Provider de Query en presentación:** respeta la dirección de dependencias (la presentación
  puede depender de librerías de UI/estado; el dominio no).

## Validación final

Correr, en este orden, y dejar todo en verde:

1. `docker compose up -d` — la base queda `healthy`.
2. `pnpm lint`
3. `pnpm build`
4. `pnpm test`
5. `npx prisma generate`
6. `pnpm dev` — verificar arranque sin errores en consola (conecta a la base de Docker).

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `001 · Configuración base` a **Hecho ✅** y
  promover la siguiente (`002 · Autenticación y roles`) a **Siguiente 🔜**.
- Revisar que `DOC/features/001-configuracion-base.md` siga fiel a lo entregado (convención de
  documentación por feature; ver `README.md`).
- Reflejar en `tech-stack.md` que las librerías pasan de "pendientes" a "instaladas" si se
  desea mantener esa lista al día.
