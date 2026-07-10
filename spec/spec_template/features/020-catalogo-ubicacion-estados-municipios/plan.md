# 020 · Catálogo de ubicación (estado y municipio) — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, pureza de
> capas, convenciones y límites duros). Esta feature **enmienda 016 y 017** y crea el módulo nuevo
> `src/modules/ubicacion`.

## Enfoque general

Construir de **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación),
creando primero el catálogo y su siembra, y luego reconectando `usuarios` (016/017) a ese catálogo.
Orden: **catálogo Prisma + seed → módulo `ubicacion` (dominio/aplicación/infra) → enmienda modelo
`Usuario`/`PerfilAdmin` + migración → enmienda casos de uso de `usuarios` → UI (selector dependiente)
→ guard → tests**.

> ⚠️ Antes de tocar server actions, server components o proxy (antes middleware) de Next 16, leer la
> guía en `node_modules/next/dist/docs/` (AGENTS.md). Esta versión trae cambios importantes.

## 1. Catálogo en Prisma y siembra

- En `prisma/schema.prisma`, añadir:
  - `model Estado { id, codigo @unique, nombre, municipios Municipio[] }`.
  - `model Municipio { id, codigo @unique, nombre, estadoId, estado Estado @relation(...),
    @@index([estadoId]) }`. Mapear a tablas `estados` / `municipios`.
- Archivo de datos `prisma/data/venezuela-ubicacion.ts` (derivado de
  `spec/.../020-.../data/estados-municipios.md`): array de estados con `{ codigo, nombre, municipios:
  [{ codigo, nombre }] }`. **Reconciliar el listado con una fuente oficial (INE)** antes de fijarlo
  (ver nota en el `.md`).
- Ampliar `prisma/seed.ts`: sembrar el catálogo de forma **idempotente** (upsert por `codigo` del
  estado; para cada municipio upsert por `codigo`, enlazando al estado). Ejecutarlo **antes** de los
  usuarios de prueba (por si más adelante se les asigna ubicación). Mantener el estilo actual (logs
  `✔`, idempotente).

## 2. Módulo `src/modules/ubicacion` — dominio y aplicación puras

- `domain/`:
  - Entidades `Estado { id, codigo, nombre }` y `Municipio { id, codigo, nombre, estadoId }`.
  - Puerto `CatalogoUbicacionRepository` (interfaz): `buscarEstado(id)`, `buscarMunicipio(id)`,
    `listarEstados()`, `listarMunicipiosDeEstado(estadoId)`.
  - `validarUbicacion({ estadoId, municipioId }, catalogo): ResultadoValidacion` — puro: existencia de
    estado y municipio y **pertenencia** (`municipio.estadoId === estadoId`); mensajes en español de
    la spec. Recibe el catálogo por el puerto (no importa Prisma).
- `application/`:
  - `listarEstados(repo)` y `listarMunicipiosDeEstado(repo, estadoId)` (lecturas para poblar los
    selects).
- Sin imports de framework ni Prisma (ESLint lo impide).

## 3. Infraestructura del catálogo

- `infrastructure/PrismaCatalogoUbicacionRepository.ts` — implementa el puerto con el cliente Prisma
  singleton (`src/lib/prisma.ts`).
- Fachada `@/shared/ubicacion` (barril `index.ts`) que exporta entidades, puerto, casos de uso y el
  repositorio, para que `usuarios` y la UI lo consuman sin romper las reglas de import.

## 4. Enmienda al modelo `Usuario` y `PerfilAdmin` + migración

- `model Usuario` (017): **quitar** `estado String?` y `parroquia String?`; **añadir**
  `estadoId String?`, `municipioId String?` y las relaciones opcionales a `Estado`/`Municipio`
  (con `@@index`).
- `model PerfilAdmin` (016): el mismo cambio (los campos `estado`/`parroquia` eran `String` no
  nullable; pasan a `estadoId`/`municipioId`). Decidir nullabilidad: en `PerfilAdmin` pueden ser
  nullable en base y obligatorios en el flujo, para no bloquear la migración de filas existentes.
- `pnpm db:migrate`: una migración que **crea** `estados`/`municipios`, **añade** las FKs a `usuarios`
  y `perfiles_admin`, y **elimina** las columnas de texto libre `estado`/`parroquia`. Los datos
  previos de texto libre se descartan (ver decisión en spec). Sembrar el catálogo (`pnpm db:seed`)
  después de migrar.

## 5. Enmienda de la capa de aplicación en `usuarios`

- `registrarUsuario` (017) y `actualizarDatosContacto` (017): sustituir la validación de ubicación de
  texto libre por `validarUbicacion({ estadoId, municipioId }, catalogo)` usando el
  `CatalogoUbicacionRepository`. Persistir `estadoId`/`municipioId`.
- `gestionarPerfilAdmin` (016): idem para el `PerfilAdmin`.
- Ampliar `PrismaUsuarioRepository` y el repositorio de `PerfilAdmin` para leer/escribir
  `estadoId`/`municipioId`.
- Mantener las capas `domain`/`application` de `usuarios` puras; inyectar el catálogo por el puerto.

## 6. Presentación — selector de ubicación dependiente

- Componente reutilizable `SelectorUbicacion.tsx` (client, en `src/modules/ubicacion/ui` o
  `src/shared/ui` si es transversal): dos `Select` de Shadcn integrados con React Hook Form
  (`estadoId`, `municipioId`); al cambiar el estado, resetea y filtra los municipios.
  - **Datos:** cargar los estados en el server component y pasarlos al cliente; los municipios, o bien
    todos precargados (≈335 es poco) o por estado bajo demanda. Elegir la opción más simple que no
    haga texto libre. Sin llamadas a APIs nuevas si se precarga.
- Sustituir los inputs de texto `estado`/`parroquia` por `SelectorUbicacion` en:
  - `DatosContactoFields` (017) — registro/completar/mi-perfil de colaborador/solicitante.
  - `RegistroForm` / bloque admin y `PerfilAdminForm` (016) — registro público y `/panel/perfil`.
- Actualizar todos los textos "parroquia" → "municipio" en labels y mensajes.

## 7. Guard de perfil incompleto (enmienda 017)

- Ajustar el guard (`src/shared/auth`) para exigir `estadoId` **y** `municipioId` (en vez de los
  strings `estado`/`parroquia`) antes de dejar operar a `COLABORADOR` / `SOLICITANTE`.
- Revisar `proxy.ts` para no romper el flujo `/completar-perfil` ↔ `/mi-perfil`.

## 8. Tests (Vitest)

- Dominio: `validarUbicacion` con un **fake** de catálogo en memoria: municipio inexistente, estado
  inexistente, municipio de otro estado (rechaza), par válido (acepta). Mensajes en español.
- Aplicación: `listarEstados` / `listarMunicipiosDeEstado` con el fake; `registrarUsuario`,
  `actualizarDatosContacto` y `gestionarPerfilAdmin` validan coherencia estado↔municipio y persisten
  las FKs (con dobles de repositorio).
- Tests colocados (`*.test.ts`) junto a cada archivo; sin base real.

## Decisiones

- **Catálogo como módulo propio (`ubicacion`)** en vez de meterlo en `usuarios`: es un dato
  transversal que también consumirán 011 (puntos de acopio) y potencialmente filtros de 008/009.
- **`codigo` como clave natural** para la siembra idempotente y para corregir nombres sin romper FKs.
- **Descartar datos de texto libre** en vez de mapearlos: no hay forma fiable; el guard de 017 fuerza
  la re-selección, coherente con la política de "no inventar datos".
- **Validación por puerto:** el dominio valida coherencia recibiendo el catálogo por interfaz, sin
  acoplarse a Prisma (regla de dependencias de la constitución).

## Validación final

1. Base arriba (según entorno; en Cursor Cloud, `sudo pg_ctlcluster 16 main start`).
2. `pnpm db:migrate` (crea catálogo + FKs, elimina columnas viejas).
3. `pnpm db:seed` — 24 estados y ~335 municipios cargados; re-ejecutar y comprobar que no duplica.
4. `pnpm test` (dominio y casos de uso en verde).
5. `pnpm lint` / `pnpm build` sin errores.
6. `pnpm dev` — registrar colaborador/solicitante eligiendo estado y municipio (comprobar el filtrado
   dependiente y el rechazo de combinaciones inválidas por servidor); registrar/editar un admin con
   el mismo selector; con una cuenta previa sin ubicación, confirmar la redirección a
   `/completar-perfil`.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `020` a **Hecho ✅**.
- Actualizar la **prosa de la constitución**: `mission.md` (admin: "parroquia" → "municipio") y
  `tech-stack.md` (`PerfilAdmin`/`Usuario`: ubicación por catálogo seleccionable estado→municipio, ya
  no texto libre; nuevas entidades `Estado`/`Municipio`).
- Actualizar los `DOC/` de las features **016** y **017** (parroquia→municipio; ubicación
  seleccionable) y verificar que `DOC/features/020-...md` refleja lo entregado.
