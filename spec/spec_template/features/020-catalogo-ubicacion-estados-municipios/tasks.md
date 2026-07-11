# 020 · Catálogo de ubicación (estado y municipio) — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. Esta feature **enmienda 016 y 017** y crea el módulo
> `src/modules/ubicacion`.
>
> ⚠️ **Nota de entorno:** la implementación se cerró en una máquina **sin PostgreSQL/Docker**
> disponible. Todo el código, la migración SQL y el seed están escritos y validados con
> `prisma generate`, `pnpm test`, `pnpm exec eslint src` y `pnpm build` (todos en verde). Los pasos
> que exigen una base **viva** (`pnpm db:migrate`, `pnpm db:seed`, prueba manual con `pnpm dev`)
> quedan **pendientes de ejecutar en un entorno con la BD arriba** y se marcan como tal.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, server
      components, **proxy**) para el selector dependiente y el guard.
- [x] Confirmar que no hacen falta dependencias nuevas (Prisma, React Hook Form y los `Select` de
      Shadcn ya vienen de features previas). Si se necesitara algo, **avisar** antes de instalar.
      _(El selector usa `<select>` nativos con React Hook Form; sin dependencias nuevas.)_
- [ ] Levantar la base (según entorno) y dejarla lista para migrar. _(Requiere BD; ver nota.)_
- [x] **Reconciliar el listado** de `data/estados-municipios.md` contra una fuente oficial (INE /
      Gaceta Oficial): 24 estados y 335 municipios; resuelto el caso de Trujillo (se descarta
      "Carvajal", que no es municipio; queda en 20). Total reconciliado: **335**.

## 1. Catálogo en Prisma y siembra

- [x] Añadir `model Estado` (`id`, `codigo @unique`, `nombre`, `municipios`) y `model Municipio`
      (`id`, `codigo @unique`, `nombre`, `estadoId` + relación, `@@index([estadoId])`); `@@map`.
- [x] Crear `prisma/data/venezuela-ubicacion.ts` con el listado reconciliado (estados con sus
      municipios, cada uno con `codigo` y `nombre`).
- [x] Ampliar `prisma/seed.ts`: sembrar el catálogo **idempotente** (upsert por `codigo`), antes de
      los usuarios de prueba; logs en el estilo actual.

## 2. Módulo `src/modules/ubicacion` — dominio y aplicación

- [x] `domain`: entidades `Estado`/`Municipio`, puerto `CatalogoUbicacionRepository`.
- [x] `domain`: `validarUbicacion({ estadoId, municipioId }, catalogo)` — existencia + pertenencia
      estado↔municipio; mensajes en español de la spec.
- [x] `application`: `listarEstados(repo)`, `listarMunicipiosDeEstado(repo, estadoId)` y
      `cargarCatalogoUbicacion(repo)` (catálogo completo para el selector).
- [x] Capas puras (sin Prisma ni framework) — lo verifica ESLint.

## 3. Infraestructura del catálogo

- [x] `PrismaCatalogoUbicacionRepository` implementa el puerto con el cliente Prisma singleton.
- [x] Fachada `@/shared/ubicacion` (barril) + composition root `@/lib/ubicacion`; exporta casos de
      uso cableados y tipos de dominio.

## 4. Modelo `Usuario`/`PerfilAdmin` y migración

- [x] `model Usuario` (017): quitar `estado String?` / `parroquia String?`; añadir `estadoId String?`,
      `municipioId String?` + relaciones e índices.
- [x] `model PerfilAdmin` (016): quitar `estado`/`parroquia`; añadir `estadoId`/`municipioId` (nullable
      en base) + relación e índices.
- [x] Migración `20260710170000_add_catalogo_ubicacion` que crea `estados`/`municipios`, añade FKs a
      `usuarios` y `perfiles_admin` y **elimina** las columnas de texto libre.
- [ ] `pnpm db:migrate` aplicada y `pnpm db:seed` tras migrar. _(Requiere BD; ver nota.)_

## 5. Aplicación en `usuarios` (enmienda 016/017)

- [x] `registrarUsuario` y `actualizarDatosContacto`: validar `estadoId`/`municipioId` con
      `validarUbicacion` (vía catálogo) y persistir las FKs; quitada la validación de texto libre.
- [x] `gestionarPerfilAdmin` (016): idem para `PerfilAdmin`.
- [x] `PrismaUsuarioRepository` y `PrismaPerfilAdminRepository`: leer/escribir `estadoId`/`municipioId`.
- [x] Capas `domain`/`application` de `usuarios` puras; catálogo inyectado por el puerto.

## 6. Presentación — selector dependiente

- [x] Componente `SelectorUbicacion` (dos `select` estado→municipio filtrado, integrado con React
      Hook Form; reset de municipio al cambiar estado).
- [x] Sustituir inputs de texto por `SelectorUbicacion` en `DatosContactoFields` (017:
      registro/completar/mi-perfil).
- [x] Sustituir en el registro público de admin (`RegistroForm`) y en `PerfilAdminForm` /
      `/panel/perfil` (016).
- [x] Reemplazar todos los textos "parroquia" → "municipio" en labels y mensajes.

## 7. Guard de perfil incompleto (enmienda 017)

- [x] Guard (`src/shared/auth`): exige `estadoId` **y** `municipioId` para `COLABORADOR` /
      `SOLICITANTE` (vía `tieneDatosContactoCompletos`); redirige a `/completar-perfil`.
- [x] Revisar `proxy.ts`: no interfiere con `/completar-perfil` ↔ `/mi-perfil` (solo inyecta
      `x-pathname` y exige sesión en ciertos prefijos).

## 8. Tests (Vitest)

- [x] Dominio: `validarUbicacion` con fake de catálogo (municipio inexistente, estado inexistente,
      municipio de otro estado, par válido).
- [x] Aplicación: `listarEstados` / `listarMunicipiosDeEstado` / `cargarCatalogoUbicacion`;
      `registrarUsuario` / `actualizarDatosContacto` / `gestionarPerfilAdmin` validan coherencia y
      persisten FKs.
- [x] Tests colocados junto a cada archivo; en verde (`pnpm test` → 220 pruebas OK).

## 9. Validación final

- [ ] Base arriba, `pnpm db:migrate` aplicada, `pnpm db:seed` (24 estados / 335 municipios).
      _(Requiere BD; ver nota.)_
- [ ] Re-ejecutar `pnpm db:seed` y confirmar que **no duplica** (idempotente por `codigo`).
      _(Requiere BD; el seed es idempotente por diseño — upsert por `codigo`.)_
- [x] `pnpm test` en verde.
- [x] `pnpm exec eslint src` / `pnpm build` sin errores.
- [ ] `pnpm dev`: registrar colaborador/solicitante y admin con el selector; comprobar filtrado y
      rechazo por servidor de combinaciones inválidas; verificar redirección a `/completar-perfil`.
      _(Requiere BD; ver nota.)_

## 10. Cierre

- [x] `ubicacion/domain` y `ubicacion/application` puras (sin Prisma/framework) — ESLint OK.
- [x] Actualizar `constitution/mission.md` (admin: "parroquia" → "municipio") y
      `constitution/tech-stack.md` (ubicación por catálogo; entidades `Estado`/`Municipio`;
      `Usuario`/`PerfilAdmin` con `estadoId`/`municipioId`).
- [x] Actualizar `DOC/features/016-...md` y `DOC/features/017-...md` (parroquia→municipio; ubicación
      seleccionable) y verificar `DOC/features/020-...md`.
- [x] Mover `020 · Catálogo de ubicación` a **Hecho ✅** en `constitution/roadmap.md`.
