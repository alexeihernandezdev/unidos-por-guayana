# 020 · Catálogo de ubicación (estado y municipio) — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. Esta feature **enmienda 016 y 017** y crea el módulo
> `src/modules/ubicacion`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, server
      components, **proxy**) para el selector dependiente y el guard.
- [ ] Confirmar que no hacen falta dependencias nuevas (Prisma, React Hook Form y los `Select` de
      Shadcn ya vienen de features previas). Si se necesitara algo, **avisar** antes de instalar.
- [ ] Levantar la base (según entorno) y dejarla lista para migrar.
- [ ] **Reconciliar el listado** de `data/estados-municipios.md` contra una fuente oficial (INE /
      Gaceta Oficial): 24 estados y ~335 municipios; resolver el caso marcado de Trujillo (20 vs 21).

## 1. Catálogo en Prisma y siembra

- [ ] Añadir `model Estado` (`id`, `codigo @unique`, `nombre`, `municipios`) y `model Municipio`
      (`id`, `codigo @unique`, `nombre`, `estadoId` + relación, `@@index([estadoId])`); `@@map`.
- [ ] Crear `prisma/data/venezuela-ubicacion.ts` con el listado reconciliado (estados con sus
      municipios, cada uno con `codigo` y `nombre`).
- [ ] Ampliar `prisma/seed.ts`: sembrar el catálogo **idempotente** (upsert por `codigo`), antes de
      los usuarios de prueba; logs en el estilo actual.

## 2. Módulo `src/modules/ubicacion` — dominio y aplicación

- [ ] `domain`: entidades `Estado`/`Municipio`, puerto `CatalogoUbicacionRepository`.
- [ ] `domain`: `validarUbicacion({ estadoId, municipioId }, catalogo)` puro — existencia + pertenencia
      estado↔municipio; mensajes en español de la spec.
- [ ] `application`: `listarEstados(repo)` y `listarMunicipiosDeEstado(repo, estadoId)`.
- [ ] Capas puras (sin Prisma ni framework) — lo verifica ESLint.

## 3. Infraestructura del catálogo

- [ ] `PrismaCatalogoUbicacionRepository` implementa el puerto con el cliente Prisma singleton.
- [ ] Fachada `@/shared/ubicacion` (barril) que exporta entidades, puerto, casos de uso y repositorio.

## 4. Modelo `Usuario`/`PerfilAdmin` y migración

- [ ] `model Usuario` (017): quitar `estado String?` / `parroquia String?`; añadir `estadoId String?`,
      `municipioId String?` + relaciones e índices.
- [ ] `model PerfilAdmin` (016): quitar `estado`/`parroquia`; añadir `estadoId`/`municipioId` + relación.
- [ ] `pnpm db:migrate`: migración que crea `estados`/`municipios`, añade FKs a `usuarios` y
      `perfiles_admin` y **elimina** las columnas de texto libre.
- [ ] `pnpm db:seed` tras migrar: catálogo cargado.

## 5. Aplicación en `usuarios` (enmienda 016/017)

- [ ] `registrarUsuario` y `actualizarDatosContacto`: validar `estadoId`/`municipioId` con
      `validarUbicacion` (vía catálogo) y persistir las FKs; quitar la validación de texto libre.
- [ ] `gestionarPerfilAdmin` (016): idem para `PerfilAdmin`.
- [ ] `PrismaUsuarioRepository` y repositorio de `PerfilAdmin`: leer/escribir `estadoId`/`municipioId`.
- [ ] Capas `domain`/`application` de `usuarios` puras; catálogo inyectado por el puerto.

## 6. Presentación — selector dependiente

- [ ] Componente `SelectorUbicacion` (dos `Select` estado→municipio filtrado, integrado con React
      Hook Form; reset de municipio al cambiar estado).
- [ ] Sustituir inputs de texto por `SelectorUbicacion` en `DatosContactoFields` (017:
      registro/completar/mi-perfil).
- [ ] Sustituir en el registro público de admin (`RegistroForm`) y en `PerfilAdminForm` /
      `/panel/perfil` (016).
- [ ] Reemplazar todos los textos "parroquia" → "municipio" en labels y mensajes.

## 7. Guard de perfil incompleto (enmienda 017)

- [ ] Guard (`src/shared/auth`): exigir `estadoId` **y** `municipioId` para `COLABORADOR` /
      `SOLICITANTE`; redirigir a `/completar-perfil`.
- [ ] Revisar `proxy.ts` para no romper `/completar-perfil` ↔ `/mi-perfil`.

## 8. Tests (Vitest)

- [ ] Dominio: `validarUbicacion` con fake de catálogo (municipio inexistente, estado inexistente,
      municipio de otro estado, par válido).
- [ ] Aplicación: `listarEstados` / `listarMunicipiosDeEstado`; `registrarUsuario` /
      `actualizarDatosContacto` / `gestionarPerfilAdmin` validan coherencia y persisten FKs.
- [ ] Tests colocados junto a cada archivo; en verde.

## 9. Validación final

- [ ] Base arriba, `pnpm db:migrate` aplicada, `pnpm db:seed` (24 estados / ~335 municipios).
- [ ] Re-ejecutar `pnpm db:seed` y confirmar que **no duplica** (idempotente).
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: registrar colaborador/solicitante y admin con el selector dependiente; comprobar
      filtrado municipio↔estado y rechazo por servidor de combinaciones inválidas; verificar
      redirección a `/completar-perfil` con una cuenta previa sin ubicación.

## 10. Cierre

- [ ] `ubicacion/domain` y `ubicacion/application` puras (sin Prisma/framework) — ESLint OK.
- [ ] Actualizar `constitution/mission.md` (admin: "parroquia" → "municipio") y
      `constitution/tech-stack.md` (ubicación por catálogo seleccionable; entidades `Estado`/
      `Municipio`; `Usuario`/`PerfilAdmin` con `estadoId`/`municipioId`).
- [ ] Actualizar `DOC/features/016-...md` y `DOC/features/017-...md` (parroquia→municipio; ubicación
      seleccionable) y verificar `DOC/features/020-...md`.
- [ ] Mover `020 · Catálogo de ubicación` a **Hecho ✅** en `constitution/roadmap.md`.
