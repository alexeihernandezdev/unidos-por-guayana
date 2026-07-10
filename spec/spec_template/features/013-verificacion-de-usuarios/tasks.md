# 013 · Verificación de usuarios: Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar el módulo `usuarios` (002) y las features 015 y 017.
- [ ] Confirmar con 015 si el enum `EstadoVerificacion` y el campo `estadoVerificacion` ya existen en
      `Usuario`; decidir si esta feature los **reutiliza** o los introduce.
- [ ] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [ ] Asegurar en `schema.prisma`: `enum EstadoVerificacion { PENDIENTE VERIFICADO RECHAZADO }` y
      `estadoVerificacion @default(PENDIENTE)` en `Usuario` (reutilizar si 015 ya lo creó).
- [ ] Añadir a `Usuario` los campos de traza: `verificadoPorId?`, relación `verificadoPor`/
      `verificaciones` (`@relation("VerificacionesUsuario")`), `verificadoEn?`, `motivoRechazo?`.
- [ ] Añadir índice `@@index([rol, estadoVerificacion])`.
- [ ] `pnpm db:migrate`: migración `add_verificacion_usuarios` aplicada sin errores ni pérdida de
      datos.

## 2. Dominio (`src/modules/usuarios/domain`)

- [ ] Enum `EstadoVerificacion` (const-object + unión) reutilizado o creado.
- [ ] Ampliar la entidad `Usuario` con `estadoVerificacion`, `verificadoPorId?`, `verificadoEn?`,
      `motivoRechazo?`.
- [ ] Máquina de estados: `puedeVerificar`, `puedeRechazar`, `esVerificado`.
- [ ] Regla `esRolVerificablePorAdmin(rol)` (solo `COLABORADOR` y `SOLICITANTE`).
- [ ] Ampliar el contrato `UsuarioRepository` (`listarPorRolYEstado`, `buscarPorId` con verificación,
      `cambiarEstadoVerificacion`).

## 3. Aplicación (`src/modules/usuarios/application`)

- [ ] `listarPendientesDeVerificacion` (filtros por rol y estado; por defecto `PENDIENTE`).
- [ ] `obtenerCuentaAVerificar` (detalle con cédula, teléfono y documento).
- [ ] `verificarUsuario` (valida rol y transición; traza `verificadoPor`/`verificadoEn`).
- [ ] `rechazarUsuario` (valida rol y transición; `motivoRechazo` opcional).
- [ ] Errores de aplicación (`UsuarioNoEncontradoError`, `RolNoVerificableError`,
      `TransicionVerificacionInvalidaError`, `NoAutorizadoError`).
- [ ] Mantener la capa pura (solo depende de `domain`).

## 4. Infraestructura

- [ ] Ampliar `PrismaUsuarioRepository` sobre `@/lib/prisma` (`listarPorRolYEstado`, `buscarPorId` con
      campos de verificación, `cambiarEstadoVerificacion` en una escritura).

## 5. Presentación

### Bandeja del admin
- [ ] `/(admin)/panel/verificaciones`: bandeja con filtros por rol y estado (`requireRol(ADMIN)`).
- [ ] `/(admin)/panel/verificaciones/[id]`: detalle con datos de contacto y documento + acciones
      **verificar** / **rechazar** (con `motivo` opcional).
- [ ] Server actions `verificar/rechazar`: `requireRol(ADMIN)` (+ `requireAdminVerificado` de 015
      cuando exista), zod, `revalidatePath`.
- [ ] Confirmar que `proxy.ts` cubre `/(admin)/panel/verificaciones/*`.

### Distintivo
- [ ] `VerificadoBadge` reutilizable junto al autor de aportes de transporte (006) y de solicitudes
      (007).

### Componentes
- [ ] `VerificacionesTabla`, `EstadoVerificacionBadge`, `VerificacionAcciones`, `VerificadoBadge` en
      `usuarios/ui`. Fechas con Luxon (`es-VE`, `DD/MM/AAAA`).

## 6. Composición (wiring)

- [ ] Exponer la composición (repo Prisma ampliado + casos de uso) sin romper los límites de capas
      (patrón de `@/shared/auth`).

## 7. Tests (Vitest)

- [ ] Máquina de estados: transiciones válidas e inválidas; `esVerificado`.
- [ ] `esRolVerificablePorAdmin`: `true` para `COLABORADOR`/`SOLICITANTE`, `false` para
      `ADMIN`/`SUPERADMIN`.
- [ ] `verificarUsuario`: verifica; rechaza rol no verificable y transición inválida; deja traza.
- [ ] `rechazarUsuario`: rechaza con `motivo`; bloquea rol no verificable y transición inválida.
- [ ] Estado inicial `PENDIENTE` al registrar `COLABORADOR`/`SOLICITANTE`.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN` verificar/rechazar y ver el distintivo; como `COLABORADOR`/
      `SOLICITANTE` comprobar que se nace en `PENDIENTE`, que el flujo básico sigue y que no se accede
      a la bandeja.

## 9. Cierre

- [ ] Revisar que `usuarios/domain` y `usuarios/application` siguen puras (sin framework/Prisma/
      Auth.js).
- [ ] Generar/actualizar `DOC/features/013-verificacion-de-usuarios.md` para reflejar lo entregado.
- [ ] Mover `013 · Verificación de usuarios` a **Hecho ✅** en `constitution/roadmap.md`.
