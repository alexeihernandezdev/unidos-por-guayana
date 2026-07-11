# 011 · Puntos de acopio (Tareas)

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [x] Confirmar que las features `016 · Perfil de administrador y centro de acopio` y
      `020 · Catálogo de ubicación` están integradas (ambas en "Hecho").
- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components, `next/dynamic`) y repasar el patrón del módulo `recursos` (feature 004).
- [x] Levantar la base local con `docker compose up -d` (Windows) o `sudo pg_ctlcluster 16 main
      start` (VM Cursor Cloud).

## 1. Modelo de datos y migración ✅

- [x] Ampliar `model PuntoAcopio` en `schema.prisma` con `nombre`, `referencia`,
      `latitud`/`longitud` `Decimal(9,6)`, `horarios`, `telefono`,
      `telefonoEsWhatsApp Boolean @default(true)`, `correo?`, `estadoId`/`municipioId` FK al catálogo,
      `activo Boolean @default(true)`, `@@unique([adminId, nombre])` e índices.
- [x] Añadir inversas `puntosAcopio` en `Estado` y `Municipio`.
- [x] `pnpm prisma migrate deploy`: migración `20260710190000_feature_011_punto_acopio` aplicada sin
      errores.
- [x] `pnpm prisma generate`: cliente regenerado.

## 2. Dominio (`src/modules/acopio/domain`)

- [ ] Entidad `PuntoAcopio` y tipos `NuevoPuntoAcopio` / `CambiosPuntoAcopio` (incluye `adminId`,
      `latitud`/`longitud`, `estadoId`/`municipioId`).
- [ ] Contrato `PuntoAcopioRepository` (`crear`, `listarPorAdmin`, `buscarPorId`, `actualizar`,
      `cambiarActivo`).
- [ ] Puerto `LectorUbicacionAdmin.leerPorAdminId(adminId)` para heredar la ubicación del
      `PerfilAdmin` sin acoplarse a la infraestructura de `usuarios`.
- [ ] Puerto `LectorMunicipio.perteneceAEstado(municipioId, estadoId)` (o reutilizar el existente en
      020) para validar coherencia estado↔municipio.
- [ ] Reglas puras: campos no vacíos (trim), rango de coordenadas, `aplicarHerenciaUbicacion` y
      `perteneceA` (propiedad).

## 3. Aplicación (`src/modules/acopio/application`)

- [ ] `crearPuntoAcopio` (valida, aplica herencia de ubicación, valida coherencia
      estado↔municipio, ata al `adminId`).
- [ ] `listarPuntosDeAdmin` (filtro por `activo`).
- [ ] `editarPuntoAcopio` (comprueba propiedad antes de actualizar; revalida campos, coordenadas y
      coherencia).
- [ ] `archivarPuntoAcopio` / `activarPuntoAcopio` (comprueba propiedad; alterna `activo`).
- [ ] Errores de aplicación: `PuntoAcopioNoEncontradoError`, `PuntoAcopioAjenoError`,
      `UbicacionVaciaError`, `UbicacionIncoherenteError`, `CoordenadasInvalidasError`,
      `NombrePuntoDuplicadoError`.
- [ ] Mantener la capa pura (solo depende de `domain`).

## 4. Infraestructura

- [ ] `PrismaPuntoAcopioRepository` sobre `@/lib/prisma` (filtros por `adminId` y `activo` en la
      consulta).
- [ ] `PrismaLectorUbicacionAdmin` implementa el puerto de lectura del `PerfilAdmin`.
- [ ] Reutilizar o crear `PrismaLectorMunicipio` para la coherencia estado↔municipio.

## 5. Dependencias de UI

- [ ] Añadir dependencias `leaflet`, `react-leaflet` y `@types/leaflet` (aviso conforme AGENTS.md
      registrado en la spec).
- [ ] Importar CSS de Leaflet en el layout o en el componente del mapa.

## 6. Presentación (solo `ADMIN` dueño)

- [ ] Ruta **listado** `/(admin)/panel/acopio` (server component; `requireRol(ADMIN)`; filtra por su
      `adminId`).
- [ ] Ruta **alta** `/(admin)/panel/acopio/nuevo` con `PuntoAcopioForm` (RHF; ubicación prellenada
      desde el perfil; selector dependiente estado→municipio; mapa Leaflet).
- [ ] Ruta **edición** `/(admin)/panel/acopio/[id]/editar` (previa comprobación de propiedad).
- [ ] `PuntoAcopioMapa` (client, `next/dynamic({ ssr: false })`) envuelve `react-leaflet` con tiles
      OSM y expone `latitud`/`longitud` a RHF vía `Controller`.
- [ ] `PuntosAcopioTabla` (estado activo/archivado + filtro).
- [ ] Acción de **archivar/activar** (botones con `<form>` + server action en la tabla).
- [ ] Server actions (crear/editar/archivar): validan con `zod` en el límite, revalidan rol
      (`requireRol(ADMIN)`) y **propiedad** (`adminId` de la sesión), invocan los casos de uso
      compuestos y hacen `revalidatePath` del listado.
- [ ] Confirmar que `proxy.ts` protege `/panel/acopio` (ya cubre `/panel/:path*`).

## 7. Composición (wiring)

- [ ] Exponer la composición (repos Prisma + puertos + casos de uso) sin romper los límites de capas
      (patrón de `recursos`); `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 8. Tests (Vitest)

- [ ] `crearPuntoAcopio`: crea atado al `adminId`; hereda ubicación cuando falta y respeta la del
      formulario cuando se indica; rechaza campos vacíos, coordenadas fuera de rango, municipio
      incoherente con estado, y nombre duplicado por admin.
- [ ] `editarPuntoAcopio`: actualiza si es del dueño; rechaza `adminId` ajeno.
- [ ] `archivarPuntoAcopio` / `activarPuntoAcopio`: comprueba propiedad y alterna `activo`.
- [ ] `listarPuntosDeAdmin`: filtra por `adminId` y por `activo`.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 9. Validación final

- [ ] Base `healthy` (`docker compose up -d` o `pg_ctlcluster` en la VM).
- [x] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, crear (verificar herencia y mapa), editar, archivar y reactivar un
      punto; comprobar que otro `ADMIN` no lo ve ni edita y que un no-`ADMIN` no accede a
      `/panel/acopio`. _(Pendiente de comprobación manual en navegador.)_

## 10. Cierre

- [ ] Revisar que `acopio/domain` y `acopio/application` siguen puras (sin framework, Prisma ni
      Leaflet).
- [ ] Verificar que `DOC/features/011-puntos-de-acopio.md` refleja lo entregado.
- [ ] Mover `011 · Puntos de acopio` a **Hecho ✅** en `constitution/roadmap.md` y promover la
      siguiente feature de apoyo del backlog.
