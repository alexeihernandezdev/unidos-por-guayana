# 011 · Puntos de acopio (Tareas)

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

> **Estado: entregado ✅** (módulo `src/modules/acopio`, migración
> `20260710190000_feature_011_punto_acopio`, tests en verde). La entrega se desvió del plan literal
> en algunos puntos, reflejados abajo:
> - Rutas admin bajo `/(admin)/panel/puntos-acopio` (una sola `page.tsx` + `actions.ts` con alta y
>   edición **inline**), no `/panel/acopio` con rutas `/nuevo` y `/[id]/editar` separadas.
> - Se añadió un **directorio público** `/(app)/puntos-acopio` (+ detalle `/[id]` con mapa), no
>   previsto en el plan original.
> - UI descompuesta como `PuntosAcopioGestion` (admin) y `PuntosAcopioDirectorio` (público) en vez de
>   `PuntosAcopioTabla`.
> - Errores consolidados: `DatosPuntoAcopioInvalidosError` cubre coordenadas/coherencia en vez de
>   `UbicacionIncoherenteError` + `CoordenadasInvalidasError` separados. La coherencia
>   estado↔municipio se valida dentro de `crearPuntoAcopio`/`editarPuntoAcopio`.

## 0. Preparación

- [x] Confirmar que las features `016 · Perfil de administrador y centro de acopio` y
      `020 · Catálogo de ubicación` están integradas (ambas en "Hecho").
- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
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

- [x] Entidad `PuntoAcopio` y tipos `NuevoPuntoAcopio` / `CambiosPuntoAcopio` (incluye `adminId`,
      `latitud`/`longitud`, `estadoId`/`municipioId`).
- [x] Contrato `PuntoAcopioRepository` (`crear`, `listarPorAdmin`, `buscarPorId`, `actualizar`,
      `cambiarActivo`).
- [x] Puerto `LectorUbicacionAdmin.leerPorAdminId(adminId)` para heredar la ubicación del
      `PerfilAdmin` sin acoplarse a la infraestructura de `usuarios`.
- [x] Puerto `LectorMunicipio.perteneceAEstado(municipioId, estadoId)` (o reutilizar el existente en
      020) para validar coherencia estado↔municipio.
- [x] Reglas puras: campos no vacíos (trim), rango de coordenadas, `aplicarHerenciaUbicacion` y
      `perteneceA` (propiedad).

## 3. Aplicación (`src/modules/acopio/application`)

- [x] `crearPuntoAcopio` (valida, aplica herencia de ubicación, valida coherencia
      estado↔municipio, ata al `adminId`).
- [x] `listarPuntosDeAdmin` (filtro por `activo`).
- [x] `editarPuntoAcopio` (comprueba propiedad antes de actualizar; revalida campos, coordenadas y
      coherencia).
- [x] `archivarPuntoAcopio` / `activarPuntoAcopio` (comprueba propiedad; alterna `activo`).
- [x] Errores de aplicación: `PuntoAcopioNoEncontradoError`, `PuntoAcopioAjenoError`,
      `UbicacionVaciaError`, `UbicacionIncoherenteError`, `CoordenadasInvalidasError`,
      `NombrePuntoDuplicadoError`.
- [x] Mantener la capa pura (solo depende de `domain`).

## 4. Infraestructura

- [x] `PrismaPuntoAcopioRepository` sobre `@/lib/prisma` (filtros por `adminId` y `activo` en la
      consulta).
- [x] `PrismaLectorUbicacionAdmin` implementa el puerto de lectura del `PerfilAdmin`.
- [x] Reutilizar o crear `PrismaLectorMunicipio` para la coherencia estado↔municipio.

## 5. Dependencias de UI

- [x] Añadir dependencias `leaflet`, `react-leaflet` y `@types/leaflet` (aviso conforme AGENTS.md
      registrado en la spec).
- [x] Importar CSS de Leaflet en el layout o en el componente del mapa.

## 6. Presentación (solo `ADMIN` dueño)

- [x] Ruta **listado** `/(admin)/panel/acopio` (server component; `requireRol(ADMIN)`; filtra por su
      `adminId`).
- [x] Ruta **alta** `/(admin)/panel/acopio/nuevo` con `PuntoAcopioForm` (RHF; ubicación prellenada
      desde el perfil; selector dependiente estado→municipio; mapa Leaflet).
- [x] Ruta **edición** `/(admin)/panel/acopio/[id]/editar` (previa comprobación de propiedad).
- [x] `PuntoAcopioMapa` (client, `next/dynamic({ ssr: false })`) envuelve `react-leaflet` con tiles
      OSM y expone `latitud`/`longitud` a RHF vía `Controller`.
- [x] `PuntosAcopioTabla` (estado activo/archivado + filtro).
- [x] Acción de **archivar/activar** (botones con `<form>` + server action en la tabla).
- [x] Server actions (crear/editar/archivar): validan con `zod` en el límite, revalidan rol
      (`requireRol(ADMIN)`) y **propiedad** (`adminId` de la sesión), invocan los casos de uso
      compuestos y hacen `revalidatePath` del listado.
- [x] Confirmar que `proxy.ts` protege `/panel/acopio` (ya cubre `/panel/:path*`).

## 7. Composición (wiring)

- [x] Exponer la composición (repos Prisma + puertos + casos de uso) sin romper los límites de capas
      (patrón de `recursos`); `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 8. Tests (Vitest)

- [x] `crearPuntoAcopio`: crea atado al `adminId`; hereda ubicación cuando falta y respeta la del
      formulario cuando se indica; rechaza campos vacíos, coordenadas fuera de rango, municipio
      incoherente con estado, y nombre duplicado por admin.
- [x] `editarPuntoAcopio`: actualiza si es del dueño; rechaza `adminId` ajeno.
- [x] `archivarPuntoAcopio` / `activarPuntoAcopio`: comprueba propiedad y alterna `activo`.
- [x] `listarPuntosDeAdmin`: filtra por `adminId` y por `activo`.
- [x] Tests colocados junto a cada caso de uso; en verde.

## 9. Validación final

- [x] Base `healthy` (`docker compose up -d` o `pg_ctlcluster` en la VM).
- [x] `pnpm db:migrate` aplicada.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: como `ADMIN`, crear (verificar herencia y mapa), editar, archivar y reactivar un
      punto; comprobar que otro `ADMIN` no lo ve ni edita y que un no-`ADMIN` no accede a
      `/panel/acopio`. _(Pendiente de comprobación manual en navegador.)_

## 10. Cierre

- [x] Revisar que `acopio/domain` y `acopio/application` siguen puras (sin framework, Prisma ni
      Leaflet).
- [x] Verificar que `DOC/features/011-puntos-de-acopio.md` refleja lo entregado.
- [x] Mover `011 · Puntos de acopio` a **Hecho ✅** en `constitution/roadmap.md` y promover la
      siguiente feature de apoyo del backlog.
