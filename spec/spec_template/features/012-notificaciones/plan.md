# 012 · Notificaciones — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), reutilizando el
patrón de `usuarios` (002), `ayudas` (005) y `aportes` (006). La pieza clave es el **puerto**
`NotificadorPort`: se define en el dominio de este módulo y lo invocan las features de origen (005/006)
sin acoplarse a la persistencia. Orden:
**modelo `Notificacion` + migración → dominio (entidad + puerto + reglas de mensaje/dedupe) →
aplicación (`emitirNotificacion` + lecturas/marcado, +tests) → repositorio Prisma + composición del
puerto → integración con 005 y 006 → UI campana + bandeja → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La sesión y protección reutilizan la feature 002.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`:
  - `enum TipoNotificacion { NUEVA_AYUDA META_CUMPLIDA }`.
  - `model Notificacion { id, usuarioId, usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade),
    tipo TipoNotificacion, mensaje String, referenciaTipo String, referenciaId String,
    leida Boolean @default(false), claveDedupe String, createdAt DateTime @default(now()),
    @@index([usuarioId, leida]), @@unique([usuarioId, claveDedupe]), @@map("notificaciones") }`.
  - Relación inversa `notificaciones` en `Usuario`.
- `pnpm db:migrate` (base de Docker arriba) → migración `add_notificaciones`.

> La `referencia` se modela como par `(referenciaTipo, referenciaId)` en vez de una FK rígida a `Ayuda`,
> para poder apuntar en el futuro a otras entidades (solicitud, envío) sin migrar la tabla.

## 2. Capa de dominio (`src/modules/notificaciones/domain`) — pura

- `TipoNotificacion` (const-object + unión, mismos valores que Prisma).
- Entidad `Notificacion` y tipo `NuevaNotificacion`.
- **Puerto `NotificadorPort`** (contrato que 005/006 importan):
  `emitir(evento: EventoNotificacion): Promise<void>`, donde `EventoNotificacion` es una unión por
  `tipo` (`NuevaAyudaEvento`, `MetaCumplidaEvento`) con los datos necesarios para resolver
  destinatarios y componer el mensaje.
- Reglas puras:
  - `componerMensaje(evento)` → texto por `tipo` (sin em-dash/en-dash; datos de sector, recurso).
  - `claveDedupe(tipo, referenciaTipo, referenciaId)` → string estable para el `@@unique`.
  - `contarNoLeidas(notificaciones)` helper puro.
- Contrato `NotificacionRepository`: `crearMuchas(nuevas)`, `listarPorUsuario(usuarioId, filtro?)`,
  `contarNoLeidas(usuarioId)`, `marcarLeida(id, usuarioId)`, `marcarTodasLeidas(usuarioId)`,
  `existePorClave(usuarioId, claveDedupe)`.

## 3. Capa de aplicación (`src/modules/notificaciones/application`) — pura

- `emitirNotificacion(deps, evento)` — implementación del `NotificadorPort`:
  - **Resuelve destinatarios** según el `tipo`:
    - `NUEVA_AYUDA`: `UsuarioRepository` (002) → colaboradores `VERIFICADO`.
    - `META_CUMPLIDA`: `ADMIN` dueño de la Ayuda (de 005) + `AporteRepository` (006) → colaboradores
      que aportaron a esa `(ayuda, recurso)`.
  - Compone `mensaje` y `claveDedupe` (dominio).
  - **Deduplica**: crea solo para los destinatarios que aún no tienen esa `claveDedupe`
    (`crearMuchas` con `skipDuplicates`).
- Lecturas/marcado:
  - `listarNotificaciones(deps, usuarioId, filtro?)` (todas / no leídas).
  - `contarNoLeidas(deps, usuarioId)`.
  - `marcarLeida(deps, id, usuarioId)`: solo si la notificación es del usuario (si no,
    `NoAutorizadoError`).
  - `marcarTodasLeidas(deps, usuarioId)`.
- Errores de aplicación: `NotificacionNoEncontradaError`, `NoAutorizadoError`.
- Depende solo de `domain` (+ contratos `UsuarioRepository`/`AyudaRepository`/`AporteRepository`).
  Tests aquí.

## 4. Infraestructura (`src/modules/notificaciones/infrastructure`)

- `PrismaNotificacionRepository` sobre `@/lib/prisma`:
  - `crearMuchas` con `createMany({ data, skipDuplicates: true })` (idempotencia por `@@unique`).
  - `contarNoLeidas` con `count({ where: { usuarioId, leida: false } })`.
  - `listarPorUsuario` ordenado por `createdAt desc`, con filtro opcional `leida`.
  - `marcarLeida` / `marcarTodasLeidas` con `updateMany` filtrando por `usuarioId` (idempotente y
    seguro: nadie marca lo ajeno).
- **Composición del puerto**: exponer una fábrica que construye `emitirNotificacion` con sus
  dependencias (repos de 002/005/006) y lo entrega como `NotificadorPort`, para inyectarlo en 005/006.

## 5. Integración con las features de origen (005 y 006)

> Sin duplicar lógica ni acoplar el dominio de esas features a la infraestructura de notificaciones.
> Ambas reciben un `NotificadorPort` por composición y lo invocan tras confirmar la operación.

- **005 `crearAyuda`**: tras persistir la Ayuda con sus metas, si tiene al menos una meta, invocar
  `notificador.emitir({ tipo: NUEVA_AYUDA, ayuda })`. El caso de uso pasa a aceptar el puerto como
  dependencia opcional (no-op si no se inyecta, para no romper tests existentes).
- **006 (marcar `RECIBIDO`)**: al confirmar el aporte, comparar el progreso de la meta **antes vs
  después**; si cruza `>= 100%` por primera vez, invocar
  `notificador.emitir({ tipo: META_CUMPLIDA, ayuda, recurso })`. La idempotencia por `claveDedupe`
  cubre reintentos.
- El wiring conecta el `NotificadorPort` (compuesto en este módulo) con la composición de 005/006. Las
  capas `domain`/`application` de 005/006 siguen dependiendo solo del **contrato**.

## 6. Presentación (`src/modules/notificaciones/ui` + `src/app`)

### 6.1 Campana (cabecera autenticada)

- `CampanaNotificaciones` (server component que lee `contarNoLeidas` + últimas N) con badge del
  contador; icono `Bell` de lucide (`strokeWidth={1.5}`). Popover con `transform-origin` del trigger
  (no `center`), animación `ease-out`, respetando `prefers-reduced-motion`.
- Enlace "Ver todas" a `/notificaciones`.

### 6.2 Bandeja `/notificaciones`

- Server component que lista las notificaciones del usuario (todas / no leídas), con `tipo`, `mensaje`,
  fecha (`Luxon`, `es-VE`, `DD/MM/AAAA`), estado leída/no leída y enlace a la `referencia`.
- Acciones: **marcar leída** (por fila) y **marcar todas como leídas**.
- Server actions con `zod`, sesión requerida (002) y `revalidatePath("/notificaciones")` (+ revalidar
  el layout para el contador de la campana).

### 6.3 Componentes

- `CampanaNotificaciones`, `NotificacionItem`, `NotificacionesLista`, `TipoNotificacionBadge`,
  `MarcarTodasLeidasBoton`.

## 7. Composición (wiring)

- Exponer la composición (repo + casos de uso + `NotificadorPort`) siguiendo el patrón de
  `@/shared/auth`. `app`/`ui` no importan `infrastructure`/`lib` directamente. Los casos de uso de
  emisión reciben los repos de 002/005/006 por inyección; no duplicar contratos.

## 8. Tests (Vitest)

- `componerMensaje` por `tipo` (texto correcto, sin em-dash/en-dash).
- `claveDedupe` estable y única por `(tipo, referencia)`.
- `emitirNotificacion`: resuelve destinatarios correctos por tipo; **deduplica** (no crea si ya existe
  la clave para ese usuario); `NUEVA_AYUDA` no emite si la Ayuda no tiene metas.
- Cruce del 100% de meta: emite en el aporte que cruza; **no** emite en aportes posteriores.
- `contarNoLeidas` (función pura) con distintos conjuntos.
- `marcarLeida`: solo el dueño; ajeno → `NoAutorizadoError`.
- Con dobles en memoria (repos de notificaciones, usuarios, ayudas y aportes), junto a cada caso de uso.

## Decisiones

- **Puerto en el dominio, implementación inyectada:** 005/006 quedan puras y desacopladas.
- **Solo in-app, sin canales externos:** simplicidad y conexión limitada (misión).
- **Idempotencia por `@@unique([usuarioId, claveDedupe])` + `skipDuplicates`:** un hecho, un aviso.
- **`referencia` como par `(tipo, id)`:** extensible a otras entidades sin migrar.
- **Sin tiempo real ni preferencias:** se refresca al navegar; evolución futura por el mismo puerto.

## Validación final

1. `docker compose up -d` y `pnpm db:migrate` (migración `add_notificaciones` aplicada).
2. `pnpm test` (emisión, dedupe, cruce de meta, marcado en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN`, crear una Ayuda con metas; iniciar como `COLABORADOR` verificado y ver la
   notificación `NUEVA_AYUDA` en la campana y la bandeja. Como `COLABORADOR`, aportar hasta cumplir una
   meta; como `ADMIN`, marcar el aporte `RECIBIDO` y comprobar que se genera `META_CUMPLIDA` para el
   admin y los colaboradores de esa meta, una sola vez. Marcar una como leída y "todas como leídas";
   comprobar que el contador baja. Intentar marcar una notificación ajena (rechazado).

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `012 · Notificaciones` a **Hecho ✅**.
- Generar/actualizar `DOC/features/012-notificaciones.md` para que refleje lo entregado.
