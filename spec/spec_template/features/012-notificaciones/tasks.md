# 012 · Notificaciones — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, server components)
      y repasar los módulos `usuarios` (002), `ayudas` (005) y `aportes` (006).
- [ ] Levantar la base: `docker compose up -d`. Requiere `Usuario` (002), `Ayuda`/`MetaRecurso` (005) y
      `Aporte` (006).

## 1. Modelo de datos y migración

- [ ] Añadir a `schema.prisma`: enum `TipoNotificacion` y modelo `Notificacion` (`usuarioId` con
      `onDelete: Cascade`, `tipo`, `mensaje`, `referenciaTipo`, `referenciaId`,
      `leida Boolean @default(false)`, `claveDedupe`, `createdAt`, índice `@@index([usuarioId, leida])`,
      único `@@unique([usuarioId, claveDedupe])`, `@@map("notificaciones")`).
- [ ] Añadir relación inversa `notificaciones` en `Usuario`.
- [ ] `pnpm db:migrate` — migración `add_notificaciones` aplicada sin errores.

## 2. Dominio (`src/modules/notificaciones/domain`)

- [ ] Enum `TipoNotificacion` (const-object + unión, mismos valores que Prisma).
- [ ] Entidad `Notificacion` y tipo `NuevaNotificacion`.
- [ ] **Puerto `NotificadorPort`** con `emitir(evento)` y la unión `EventoNotificacion`
      (`NuevaAyudaEvento`, `MetaCumplidaEvento`).
- [ ] Reglas puras: `componerMensaje(evento)` por `tipo`, `claveDedupe(tipo, referenciaTipo, referenciaId)`,
      `contarNoLeidas(notificaciones)`.
- [ ] Contrato `NotificacionRepository` (`crearMuchas`, `listarPorUsuario`, `contarNoLeidas`,
      `marcarLeida`, `marcarTodasLeidas`, `existePorClave`).

## 3. Aplicación (`src/modules/notificaciones/application`)

- [ ] `emitirNotificacion(deps, evento)` (implementación del `NotificadorPort`): resuelve destinatarios
      por `tipo`, compone `mensaje`/`claveDedupe`, **deduplica** y persiste con `crearMuchas`.
- [ ] `NUEVA_AYUDA`: destinatarios = colaboradores `VERIFICADO` (vía `UsuarioRepository` de 002);
      no emite si la Ayuda no tiene metas.
- [ ] `META_CUMPLIDA`: destinatarios = `ADMIN` dueño + colaboradores que aportaron a la meta
      (vía `AporteRepository` de 006).
- [ ] `listarNotificaciones`, `contarNoLeidas`, `marcarLeida` (solo dueño), `marcarTodasLeidas`.
- [ ] Errores de aplicación (`NotificacionNoEncontradaError`, `NoAutorizadoError`).
- [ ] Mantener la capa pura (solo `domain` + contratos de repos externos).

## 4. Infraestructura

- [ ] `PrismaNotificacionRepository` sobre `@/lib/prisma`:
      - `crearMuchas` con `createMany({ skipDuplicates: true })`.
      - `contarNoLeidas` con `count` filtrado por `leida = false`.
      - `listarPorUsuario` ordenado por `createdAt desc`, filtro opcional `leida`.
      - `marcarLeida` / `marcarTodasLeidas` con `updateMany` filtrando por `usuarioId`.
- [ ] Fábrica de composición que expone `emitirNotificacion` como `NotificadorPort`.

## 5. Integración con 005 y 006

- [ ] 005 `crearAyuda`: aceptar `NotificadorPort` (opcional) e invocar `emitir({ tipo: NUEVA_AYUDA, ayuda })`
      tras persistir, si la Ayuda tiene metas. Mantener 005 puro (solo conoce el contrato).
- [ ] 006 (marcar `RECIBIDO`): evaluar cruce del 100% de la meta (antes vs después) e invocar
      `emitir({ tipo: META_CUMPLIDA, ayuda, recurso })` cuando cruce por primera vez.
- [ ] Wiring: inyectar el `NotificadorPort` compuesto en las composiciones de 005/006 sin romper los
      límites de capas.

## 6. Presentación

### Campana
- [ ] `CampanaNotificaciones` en la cabecera autenticada: badge de no leídas (`contarNoLeidas`) +
      popover con últimas N; icono `Bell` (lucide, `strokeWidth={1.5}`); `transform-origin` del trigger,
      `ease-out`, `prefers-reduced-motion`.

### Bandeja
- [ ] Ruta `/notificaciones`: server component que lista los avisos del usuario (todas / no leídas) con
      `tipo`, `mensaje`, fecha (`Luxon`, `es-VE`, `DD/MM/AAAA`), estado y enlace a la `referencia`.
- [ ] Server actions `marcarLeidaAction` y `marcarTodasLeidasAction`: sesión requerida (002), `zod`,
      `revalidatePath` (bandeja + contador de la campana).
- [ ] Confirmar que `proxy.ts` cubre `/notificaciones` (área autenticada).

### Componentes
- [ ] `CampanaNotificaciones`, `NotificacionItem`, `NotificacionesLista`, `TipoNotificacionBadge`,
      `MarcarTodasLeidasBoton` en `notificaciones/ui`.

## 7. Composición (wiring)

- [ ] Exponer la composición (repo + casos de uso + `NotificadorPort`) sin romper los límites de capas
      (patrón de `@/shared/auth`). Los casos de uso de emisión reciben los repos de 002/005/006.

## 8. Tests (Vitest)

- [ ] `componerMensaje` por `tipo` (texto correcto, sin em-dash/en-dash).
- [ ] `claveDedupe` estable y única por `(tipo, referencia)`.
- [ ] `emitirNotificacion`: destinatarios correctos por tipo; **deduplica**; `NUEVA_AYUDA` no emite sin
      metas.
- [ ] Cruce del 100% de meta: emite al cruzar; no emite en aportes posteriores.
- [ ] `contarNoLeidas` (función pura) con distintos conjuntos.
- [ ] `marcarLeida`: solo dueño; ajeno → `NoAutorizadoError`.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 9. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: crear Ayuda con metas (`ADMIN`) y ver `NUEVA_AYUDA` en la campana/bandeja de un
      `COLABORADOR` verificado; aportar y marcar `RECIBIDO` hasta cumplir una meta y ver `META_CUMPLIDA`
      (una sola vez) para admin y colaboradores de la meta; marcar leídas y comprobar el contador;
      intentar marcar una notificación ajena (rechazado).

## 10. Cierre

- [ ] Revisar que `notificaciones/domain` y `notificaciones/application` siguen puras (sin
      framework/Prisma), y que 005/006 solo dependen del `NotificadorPort`.
- [ ] Generar/actualizar `DOC/features/012-notificaciones.md` para reflejar lo entregado.
- [ ] Mover `012 · Notificaciones` a **Hecho ✅** en `constitution/roadmap.md`.
