# 011 · Puntos de acopio (Plan)

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, pureza de
> capas, convenciones y límites duros).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), replicando el
patrón ya probado en el módulo `recursos` (feature 004), pero en el **módulo nuevo
`src/modules/acopio`**. Orden:
**schema + migración (✅ hecho) → dominio/aplicación (+tests) → repositorio Prisma → UI de gestión
solo-`ADMIN` dueño con mapa Leaflet → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002; la
> relación `adminId` y la herencia de ubicación provienen de la feature 016. La ubicación por catálogo
> viene de la feature 020.

## 1. Modelo de datos y migración ✅

- Ampliado `model PuntoAcopio` en `prisma/schema.prisma` con: `nombre`, `referencia`,
  `latitud`/`longitud` `Decimal(9,6)`, `horarios`, `telefono`, `telefonoEsWhatsApp Boolean @default(true)`,
  `correo?`, `estadoId`/`municipioId` FK al catálogo (020), `activo Boolean @default(true)`,
  `@@unique([adminId, nombre])`, índices por `adminId`/`estadoId`/`municipioId`.
- Añadidas inversas en `Estado.puntosAcopio` y `Municipio.puntosAcopio`.
- Migración `20260710190000_feature_011_punto_acopio` aplicada (`prisma migrate deploy`).
- Cliente regenerado (`prisma generate`).

## 2. Capa de dominio (`src/modules/acopio/domain`), pura

- Tipo/entidad `PuntoAcopio` y tipos `NuevoPuntoAcopio` / `CambiosPuntoAcopio` (incluye `adminId`,
  `latitud`/`longitud`, `estadoId`/`municipioId`).
- Contrato `PuntoAcopioRepository`: `crear`, `listarPorAdmin(adminId, filtro?)`, `buscarPorId`,
  `actualizar`, `cambiarActivo`.
- Contrato/puerto `LectorUbicacionAdmin.leerPorAdminId(adminId): { estadoId, municipioId } | null`
  para heredar la ubicación del `PerfilAdmin` sin acoplarse a la infraestructura de `usuarios`.
- Contrato/puerto `LectorMunicipio.perteneceAEstado(municipioId, estadoId): boolean` para validar
  coherencia (o reutilizar el que ya existe en el módulo de ubicación).
- Reglas puras:
  - `nombre`/`referencia`/`horarios`/`telefono` no vacíos (trim).
  - `latitud ∈ [-90, 90]`, `longitud ∈ [-180, 180]`.
  - `aplicarHerenciaUbicacion(entrada, ubicacionAdmin)`: si `estadoId`/`municipioId` vienen vacíos,
    tomar los del admin; validar que el resultado no quede vacío.
  - `perteneceA(punto, adminId)`: comprobación de propiedad.
- Sin imports de framework, Prisma ni Leaflet (ESLint lo impide).

## 3. Capa de aplicación (`src/modules/acopio/application`), pura

- `crearPuntoAcopio(deps, adminId, input)`: valida campos, aplica herencia de ubicación desde el
  `PerfilAdmin` (puerto `LectorUbicacionAdmin`), valida coherencia estado↔municipio, valida
  unicidad `(adminId, nombre)` (el repo puede fiarlo a la BD y capturar el error, o pre-comprobarlo),
  y crea el punto atado al `adminId`.
- `listarPuntosDeAdmin(deps, adminId, filtro?)`: los del dueño; filtro por `activo` (activos,
  archivados o todos).
- `editarPuntoAcopio(deps, adminId, id, cambios)`: **comprueba propiedad** (`perteneceA`) antes de
  actualizar; revalida campos, coordenadas y coherencia estado↔municipio.
- `archivarPuntoAcopio` / `activarPuntoAcopio(deps, adminId, id)`: comprueba propiedad y alterna
  `activo`.
- Errores de aplicación: `PuntoAcopioNoEncontradoError`, `PuntoAcopioAjenoError`,
  `UbicacionVaciaError`, `UbicacionIncoherenteError`, `CoordenadasInvalidasError`,
  `NombrePuntoDuplicadoError`.
- Depende solo de `domain`. Es el sitio de los tests unitarios (con repos en memoria).

## 4. Infraestructura (`src/modules/acopio/infrastructure`)

- `PrismaPuntoAcopioRepository` implementa `PuntoAcopioRepository` sobre `@/lib/prisma`. Mapea la fila
  de Prisma a la entidad de dominio. Los filtros por `adminId` y `activo` se resuelven en la consulta.
- `PrismaLectorUbicacionAdmin` implementa el puerto leyendo el `PerfilAdmin` del ADMIN dueño
  (reutilizando `usuarios`/infraestructura sin acoplar el dominio de `acopio`).
- Si el módulo `ubicacion` (020) expone ya un lector de municipio/estado, se reutiliza; si no, se
  crea `PrismaLectorMunicipio` local.

## 5. Presentación (`src/modules/acopio/ui` + `src/app`), solo `ADMIN` dueño

- Rutas bajo el área de administración (protegidas):
  - `/(admin)/panel/acopio`: **listado** de los puntos del `ADMIN` (server component;
    `requireRol(ADMIN)`; consulta filtrada por su `adminId`).
  - `/(admin)/panel/acopio/nuevo`: **alta** (con `estadoId`/`municipioId` prellenados desde su
    perfil).
  - `/(admin)/panel/acopio/[id]/editar`: **edición** (previa comprobación de propiedad).
- Componentes en `src/modules/acopio/ui` (PascalCase):
  - `PuntoAcopioForm` (client, RHF): campos `nombre`, `referencia`, `horarios`, `telefono`,
    `telefonoEsWhatsApp`, `correo?`, selector dependiente estado→municipio (reutiliza patrón 020) y
    **mapa Leaflet** para marcar/editar coordenadas.
  - `PuntoAcopioMapa` (client, `next/dynamic({ ssr: false })`): envuelve `react-leaflet` con tiles
    OSM; expone `latitud`/`longitud` a RHF vía `Controller`. Aislar la dependencia de Leaflet aquí.
  - `PuntosAcopioTabla` (listado con estado activo/archivado y filtro).
  - `PuntoAcopioAccionesArchivar`.
- **Server actions** para crear/editar/archivar que:
  - validan con `zod` en el límite (incluye rango de coordenadas y strings no vacíos),
  - vuelven a comprobar rol (`requireRol(ADMIN)`) **y propiedad** (`adminId` de la sesión), defensa en
    profundidad,
  - invocan los casos de uso compuestos (repos Prisma inyectados) y hacen `revalidatePath` del
    listado.
- Ampliar el `matcher` de `proxy.ts` (feature 002) si hace falta para cubrir `/panel/acopio` (ya
  cubre `/panel/:path*`).

## 6. Composición (wiring)

- Igual que en `recursos`/`usuarios`: la composición (repos Prisma + puerto de perfil + casos de uso)
  se expone desde una fachada que la presentación importa sin romper los límites de capas (ESLint).
  Inyectar tanto el `PuntoAcopioRepository` como el puerto de lectura del `PerfilAdmin` (y, si aplica,
  el de municipio/estado). `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- `crearPuntoAcopio`: crea atado al `adminId`; **hereda** `estadoId`/`municipioId` del perfil cuando
  faltan y **respeta** los del formulario cuando se indican; rechaza campos vacíos, coordenadas fuera
  de rango, municipio que no pertenece al estado, y nombre duplicado por admin.
- `editarPuntoAcopio`: actualiza cuando es del dueño; **rechaza** `adminId` ajeno.
- `archivarPuntoAcopio`/`activarPuntoAcopio`: comprueba propiedad y alterna `activo`.
- `listarPuntosDeAdmin`: filtra por `adminId` y por `activo` (activos/archivados/todos).
- Con dobles en memoria (repo de puntos, puerto de perfil, puerto de municipio), colocados junto a
  cada caso de uso (`*.test.ts`).

## Decisiones

- **Módulo nuevo `acopio`:** el CRUD de `PuntoAcopio` es su propio dominio; consume `adminId` y
  ubicación de `usuarios`/`PerfilAdmin` (016) por contrato, sin acoplarse a su infraestructura.
- **Propiedad además de rol:** todo filtra por `adminId` en servidor (lectura y escritura); el rol
  `ADMIN` no basta para tocar puntos ajenos.
- **Archivar (soft) en vez de borrar.**
- **Herencia de ubicación con valor efectivo:** se copia al crear (con opción de sobrescribir); el
  punto no cambia si el perfil se edita después.
- **Mapa aislado en la UI:** Leaflet vive solo en `acopio/ui`; el dominio y la aplicación no lo
  conocen.
- **Sin acoplamiento con Aporte ni Recurso:** un punto es solo ubicación.
- **Dominio/aplicación agnósticos de Prisma y Leaflet:** los adaptadores viven en su capa; la lógica
  es pura y testeable, como en `recursos`.

## Validación final

1. `docker compose up -d` (base local en `:5435`; en la VM Cursor Cloud, `sudo pg_ctlcluster 16 main
   start` con `:5432`).
2. `pnpm db:migrate` (migración aplicada) — ya hecho.
3. `pnpm test` (casos de uso en verde).
4. `pnpm lint` / `pnpm build` sin errores.
5. `pnpm dev`: como `ADMIN`, crear un punto (comprobar herencia de ubicación y mapa), editarlo,
   archivar y reactivar; comprobar que otro `ADMIN` no ve ni edita ese punto y que un no-`ADMIN` no
   accede a `/panel/acopio`.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `011 · Puntos de acopio` a **Hecho ✅** y promover la
  siguiente feature de apoyo del backlog.
- Verificar que `DOC/features/011-puntos-de-acopio.md` refleja lo entregado.
