# 020 · Catálogo de estados y municipios — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta
> `plan.md`. Enmienda 016 y 017.

## 0. Preparación

- [ ] Leer guía Next.js 16 en `node_modules/next/dist/docs/` (server actions / RSC) para los
      selects y la carga de municipios.
- [ ] Confirmar que no hacen falta dependencias nuevas; el dataset vive en el repo. Si se
      necesitara un paquete, **avisar** antes de instalar.
- [ ] Levantar la base (`docker compose up -d` o Postgres local según entorno).

## 1. Modelo y migración

- [ ] Añadir `model Estado` y `model Municipio` en `prisma/schema.prisma` (unique, índices, map).
- [ ] Añadir `estadoId` / `municipioId` (FK, nullable al inicio) a `Usuario` y `PerfilAdmin`.
- [ ] `pnpm db:migrate` — migración que crea tablas y columnas FK.
- [ ] Planificar el drop de `estado` / `parroquia` string tras el backfill (misma PR).

## 2. Dataset y seed

- [ ] Crear `prisma/data/venezuela-estados-municipios.ts` (o JSON) copiando
      `catalogo-venezuela.md` (24 entidades, 335 municipios; verificar conteos por estado).
- [ ] Incluir alias de backfill si aplica (`Vargas` → La Guaira).
- [ ] Implementar `seedUbicaciones()` idempotente en `prisma/seed.ts` y llamarla desde el seed.
- [ ] Backfill: mapear strings existentes a FKs cuando haya match; dejar `null` si no.
- [ ] Migración o paso final: eliminar columnas string `estado` / `parroquia`.

## 3. Módulo `src/modules/ubicaciones`

- [ ] `domain`: entidades, contrato `UbicacionRepository`, `validarUbicacionCatalogo`.
- [ ] `application`: `listarEstados`, `listarMunicipiosPorEstado`.
- [ ] `infrastructure`: `PrismaUbicacionRepository`.
- [ ] `ui`: `EstadoMunicipioFields` (cascada estado → municipio).
- [ ] Capas `domain` / `application` puras (ESLint OK).

## 4. Enmienda a usuarios (016 / 017)

- [ ] Adaptar `validarUbicacion` / datos de contacto a `estadoId` + `municipioId`.
- [ ] Enmendar `registrarUsuario`, `actualizarDatosContacto` y perfil admin.
- [ ] Actualizar guard de perfil incompleto.
- [ ] Sustituir inputs de texto por `EstadoMunicipioFields` en registro, `/completar-perfil`,
      `/mi-perfil`, registro admin y `/panel/perfil`.
- [ ] Bandeja SUPERADMIN y vistas: mostrar nombres del catálogo (join).

## 5. Tests (Vitest)

- [ ] Dominio: validación de pertenencia y mensajes en español.
- [ ] Application: listados; registro/actualización rechazan municipio de otro estado.
- [ ] Actualizar tests existentes de 017 que usaban strings `estado`/`parroquia`.

## 6. Validación final

- [ ] `pnpm db:migrate` + `pnpm db:seed` (catálogo completo, sin duplicados al re-sembrar).
- [ ] `pnpm test` en verde.
- [ ] `pnpm exec eslint src` / `pnpm build` sin errores.
- [ ] Probar en UI la cascada y el rechazo de municipio inválido.

## 7. Cierre

- [ ] Actualizar `DOC/features/020-catalogo-estados-municipios.md` si cambió el alcance.
- [ ] Actualizar `DOC/` de 016 y 017 (parroquia texto libre → municipio seleccionable).
- [ ] Mover 020 a **Hecho ✅** en `constitution/roadmap.md`.
- [ ] Actualizar `.agents/feature-queue/queue.json` y regenerar `NEXT_PROMPT.md`.
