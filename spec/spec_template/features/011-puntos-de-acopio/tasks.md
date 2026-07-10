# 011 · Puntos de acopio (Tareas)

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Confirmar que la feature `016 · Perfil de administrador y centro de acopio` está integrada
      (relación `adminId` y herencia de ubicación disponibles). Sin ella, esta feature no puede heredar
      ni atar el punto a un `ADMIN`.
- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar el patrón del módulo `recursos` (feature 004).
- [ ] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [ ] Añadir a `schema.prisma`: modelo `PuntoAcopio` (`nombre`, `direccion`, `horarios`, `estado`,
      `parroquia`, `adminId` FK a `Usuario` ADMIN, `activo` por defecto `true`, timestamps,
      `@@map("puntos_acopio")`).
- [ ] Relación N a N con `Recurso` (qué recibe) mediante tabla puente.
- [ ] Consumir la relación `Usuario (ADMIN) 1 a N PuntoAcopio` (lado `adminId`) declarada en 016 y la
      referencia opcional `Aporte → PuntoAcopio` ya existente (006).
- [ ] `pnpm db:migrate`: migración `add_puntos_acopio` aplicada sin errores.

## 2. Dominio (`src/modules/acopio/domain`)

- [ ] Entidad `PuntoAcopio` y tipos `NuevoPuntoAcopio` / `CambiosPuntoAcopio` (incluye `recursoId[]` y
      `adminId`).
- [ ] Contrato `PuntoAcopioRepository` (`crear`, `listarPorAdmin`, `listarActivosPorAdmin`,
      `buscarPorId`, `actualizar`, `cambiarActivo`).
- [ ] Contrato/puerto para leer `estado`/`parroquia` del `PerfilAdmin` (sin acoplarse a la
      infraestructura de `usuarios`).
- [ ] Reglas puras: campos no vacíos (trim), `aplicarHerenciaUbicacion` y `perteneceA` (propiedad).

## 3. Aplicación (`src/modules/acopio/application`)

- [ ] `crearPuntoAcopio` (valida, aplica herencia de ubicación, valida recursos activos, ata al
      `adminId`).
- [ ] `listarPuntosDeAdmin` (filtro solo-activos) y `listarPuntosActivosParaAporte`.
- [ ] `editarPuntoAcopio` (comprueba propiedad antes de actualizar; revalida campos y recursos).
- [ ] `archivarPuntoAcopio` / `activarPuntoAcopio` (comprueba propiedad; alterna `activo`).
- [ ] Errores de aplicación (`PuntoAcopioNoEncontradoError`, `PuntoAcopioAjenoError`,
      `RecursoNoDisponibleError`, `UbicacionVaciaError`).
- [ ] Mantener la capa pura (solo depende de `domain`).

## 4. Infraestructura

- [ ] `PrismaPuntoAcopioRepository` sobre `@/lib/prisma` (mapeo del punto y de la tabla puente de
      recursos; filtros por `adminId` y `activo` en la consulta).
- [ ] Adaptador de lectura del `PerfilAdmin` (estado/parroquia) reutilizando `usuarios` vía el puerto
      de `acopio/domain`.

## 5. Presentación (solo `ADMIN` dueño)

- [ ] Ruta **listado** `/(admin)/panel/acopio` (server component; `requireRol(ADMIN)`; filtra por su
      `adminId`).
- [ ] Ruta **alta** `/(admin)/panel/acopio/nuevo` con `PuntoAcopioForm` (RHF; `estado`/`parroquia`
      prellenados desde el perfil; selección de recursos que recibe).
- [ ] Ruta **edición** `/(admin)/panel/acopio/[id]/editar` (previa comprobación de propiedad).
- [ ] `PuntosAcopioTabla` (estado activo/archivado + filtro) en `acopio/ui`.
- [ ] Acción de **archivar/activar** (botones con `<form>` + server action en la tabla).
- [ ] Server actions (crear/editar/archivar): validan con `zod`, revalidan rol (`requireRol(ADMIN)`) y
      **propiedad** (`adminId` de la sesión), invocan los casos de uso compuestos y hacen
      `revalidatePath` del listado.
- [ ] Confirmar que `proxy.ts` protege `/panel/acopio` (ya cubre `/panel/:path*`).

## 6. Integración con el Aporte (feature 006)

- [ ] Exponer `listarPuntosActivosParaAporte` para poblar el campo opcional `PuntoAcopio` de entrega en
      el formulario de aporte, sin alterar su ciclo de vida.

## 7. Composición (wiring)

- [ ] Exponer la composición (repos Prisma + puerto de perfil + casos de uso) sin romper los límites de
      capas (patrón de `recursos`); `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 8. Tests (Vitest)

- [ ] `crearPuntoAcopio`: crea atado al `adminId`; hereda ubicación cuando falta y respeta la del
      formulario cuando se indica; rechaza campos vacíos y recursos inexistentes/archivados.
- [ ] `editarPuntoAcopio`: actualiza si es del dueño; rechaza `adminId` ajeno.
- [ ] `archivarPuntoAcopio` / `activarPuntoAcopio`: comprueba propiedad y alterna `activo`.
- [ ] `listarPuntosDeAdmin` / `listarPuntosActivosParaAporte`: filtran por `adminId` y solo-activos.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 9. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, crear (verificar herencia), editar, archivar y reactivar un punto;
      comprobar que otro `ADMIN` no lo ve ni edita, que un no-`ADMIN` no accede a `/panel/acopio`, y que
      el punto activo aparece como opción de entrega al aportar (feature 006). _(Pendiente de
      comprobación manual en navegador.)_

## 10. Cierre

- [ ] Revisar que `acopio/domain` y `acopio/application` siguen puras (sin framework/Prisma).
- [ ] Verificar que `DOC/features/011-puntos-de-acopio.md` refleja lo entregado.
- [ ] Mover `011 · Puntos de acopio` a **Hecho ✅** en `constitution/roadmap.md` y promover la
      siguiente feature de apoyo del backlog.
