# 007 · Solicitudes de ayuda

> Estado: **Hecho ✅** · Depende de: `002 · Autenticación y roles`, `004 · Catálogo de recursos` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce la **Solicitud de ayuda**: la petición formal que un `SOLICITANTE` registra para pedir
apoyo a un **sector** concreto, indicando **qué necesita**, con qué **urgencia** y una **descripción**
del contexto. Es la voz del terreno dentro de la plataforma: alimenta la decisión del `ADMIN` sobre
**qué Ayuda crear** y con qué composición.

- **Creación (`SOLICITANTE`)** — el solicitante crea una petición indicando `sector`, `urgencia`,
  `descripcion` y una lista de **recursos necesarios** (recurso del catálogo + `cantidadEstimada`
  opcional). La petición nace en estado `ABIERTA`.
- **Listado y detalle** — el solicitante ve **sus** solicitudes; el `ADMIN` ve **todas** con filtros
  (por sector, urgencia y estado). Es una vista de lectura para tomar decisiones.
- **Gestión del estado por el `ADMIN`** — el `ADMIN` puede pasar una solicitud a `ATENDIDA` (cuando la
  vincula a un envío) o `CERRADA` (cuando ya no aplica: duplicada, resuelta por otra vía, sin
  información suficiente). El solicitante puede **cancelar** su propia solicitud mientras esté
  `ABIERTA`.
- **Sin motor de matching automático** — no se asigna una solicitud a una Ayuda por sí sola. La
  relación es **informativa**: el `ADMIN` decide, mirando las solicitudes abiertas, qué Ayuda crear o
  cómo ajustar una en `RECOLECTANDO`. La vinculación explícita solicitud ↔ Ayuda es opcional en esta
  feature (ver "Decisiones").

## Por qué

`mission.md` define al **Solicitante** como uno de los tres actores centrales y a la solicitud como
el mecanismo que "alimenta la decisión del administrador sobre qué enviar". Sin este módulo, el
`ADMIN` decide qué envíos crear a ciegas o por canales externos, perdiendo trazabilidad y prioridad
real. Es requisito de 008 (panel del admin, que las lista y prioriza).

## Decisiones tomadas

- **Solo `SOLICITANTE` crea; `ADMIN` gestiona.** Un `COLABORADOR` no crea solicitudes (aporta a las
  Ayudas que resultan de ellas). El `ADMIN` no crea solicitudes en nombre de otros; si necesita
  registrar una necesidad detectada, la traduce directamente a Ayuda (005).
- **Ciclo de vida acotado: `ABIERTA → ATENDIDA` | `ABIERTA → CERRADA`.** No hay más transiciones.
  `ATENDIDA` y `CERRADA` son estados terminales. Reabrir requiere crear una solicitud nueva
  (auditabilidad).
- **Solicitante puede cancelar (`ABIERTA → CERRADA`) su propia solicitud.** Se registra que fue
  cancelada por el dueño (campo `cerradaPor` = `SOLICITANTE` | `ADMIN`) para diferenciarla de una
  cerrada por el `ADMIN`.
- **`urgencia` como enum de tres niveles:** `BAJA` | `MEDIA` | `ALTA`. Suficiente para priorizar sin
  paralizar al solicitante con una escala numérica.
- **`sector` como texto libre (con normalización trim).** No hay catálogo de sectores en el MVP; una
  taxonomía real llegaría cuando se conozcan mejor los patrones de uso. Documentar el riesgo.
- **`recursosNecesarios` referencia al catálogo (004), con `cantidadEstimada` OPCIONAL.** El
  solicitante puede no saber cuánto necesita ("necesitamos medicinas"), y forzarlo a estimar
  degrada la calidad del dato. Cuando la aporte, se guarda.
- **Vinculación con Ayuda diferida (opcional).** Añadir un campo `ayudaId?` a la solicitud es
  tentador para "cerrar el círculo", pero introduce ciclos y confusión (una Ayuda cubre varias
  solicitudes; una solicitud puede inspirar varias Ayudas). En esta feature la relación es visual/
  editorial: el `ADMIN` marca `ATENDIDA` cuando decide que ya está siendo atendida por alguna Ayuda,
  sin FK obligatoria. Si más adelante se necesita el vínculo formal, entra como caso de uso propio.
- **Sin ubicación geográfica más allá del `sector`.** No hay lat/lng ni mapas en el MVP: uno de los
  principios es simplicidad de uso y conexión limitada.
- **Módulo `src/modules/solicitudes/`** con las cuatro capas (Clean + Screaming).

## Alcance

**Incluye**

- Modelo Prisma:
  - `enum UrgenciaSolicitud { BAJA MEDIA ALTA }`.
  - `enum EstadoSolicitud { ABIERTA ATENDIDA CERRADA }`.
  - `enum CerradaPor { SOLICITANTE ADMIN }` (nullable en la Solicitud).
  - `model Solicitud`: `id`, `sector`, `urgencia`, `descripcion`, `estado` (`@default(ABIERTA)`),
    `cerradaPor?`, relación a `Usuario` (solicitante), relación `recursos` a
    `RecursoSolicitud[]`, timestamps.
  - `model RecursoSolicitud`: relación a `Solicitud` (cascade) y a `Recurso`,
    `cantidadEstimada Decimal?`, `@@unique([solicitudId, recursoId])`, timestamps.
  - Relación inversa `solicitudes` en `Usuario` y `recursoSolicitudes` en `Recurso`.
  - **Migración** correspondiente.
- Dominio: entidades `Solicitud` y `RecursoSolicitud`, enums, contrato `SolicitudRepository`,
  reglas puras: máquina de estados (transiciones válidas), validaciones (`sector`/`descripcion`
  no vacíos, urgencia válida, `cantidadEstimada` si viene debe ser `> 0`, sin recurso repetido).
- Casos de uso:
  - `crearSolicitud(deps, input, solicitanteId)`: valida cabecera y recursos (activos, no repetidos),
    crea en `ABIERTA`.
  - `listarMisSolicitudes(deps, solicitanteId)`.
  - `listarSolicitudes(deps, filtro?)` (para `ADMIN`; filtros por `sector`, `urgencia`, `estado`).
  - `obtenerSolicitud(deps, id)`.
  - `editarSolicitud(deps, id, cambios, actor)`: solo el dueño y solo si `ABIERTA`.
  - `cancelarSolicitud(deps, id, solicitanteId)`: dueño, solo si `ABIERTA` → `CERRADA` con
    `cerradaPor = SOLICITANTE`.
  - `marcarAtendida(deps, id)` / `cerrarSolicitud(deps, id)` (solo `ADMIN`).
- Infraestructura: `PrismaSolicitudRepository` (con sus `recursos`); reutiliza `RecursoRepository`
  (004) para validar recursos activos. `Decimal → number` en el límite.
- Presentación:
  - **Solicitante** (bajo `/(app)/…`): `/(app)/solicitudes` (mis solicitudes), `/(app)/solicitudes/nueva`
    con `SolicitudForm` (sector, urgencia, descripción, lista dinámica de recursos), `/(app)/solicitudes/[id]`
    con detalle + acción **cancelar** si `ABIERTA`.
  - **Admin** (bajo `/(admin)/panel/solicitudes`): listado con filtros; detalle con acciones
    **marcar atendida** y **cerrar**.
  - Server actions con `zod`, `requireRol` correspondiente y `revalidatePath`.
- Tests (Vitest): máquina de estados; validaciones de creación (recurso archivado, repetido,
  `cantidadEstimada ≤ 0`, campos vacíos); edición y cancelación solo por dueño y solo si `ABIERTA`;
  acciones admin.

**No incluye**

- **Vinculación formal solicitud ↔ Ayuda** con FK obligatoria (ver "Decisiones").
- **Motor de matching / priorización automática** por urgencia y capacidad (queda como criterio de
  ordenación en 008, pero sin algoritmo).
- **Adjuntos** (fotos, documentos) en la solicitud — se puede añadir cuando llegue 010/012.
- **Verificación** del solicitante (feature 013). Aquí basta con estar autenticado y con rol
  `SOLICITANTE`.
- **Notificaciones** al solicitante al cambiar estado (012).
- **Sectores como catálogo** o taxonomía de zonas.
- **Reapertura** de solicitudes.

## Criterios de aceptación

- [x] Un `SOLICITANTE` autenticado puede **crear** una solicitud con `sector`, `urgencia`,
      `descripcion` y ≥ 1 recurso del catálogo (activo). Nace en `ABIERTA`.
- [x] El sistema **rechaza**: recurso archivado, recurso repetido, `cantidadEstimada ≤ 0` si viene,
      campos vacíos, urgencia inválida. Validado en servidor.
- [x] El **dueño** puede **editar** su solicitud (cabecera y recursos) mientras esté `ABIERTA`; tras
      `ATENDIDA` o `CERRADA` queda bloqueada.
- [x] El **dueño** puede **cancelar** su solicitud (`ABIERTA → CERRADA` con
      `cerradaPor = SOLICITANTE`).
- [x] El `ADMIN` puede **marcar atendida** o **cerrar** una solicitud `ABIERTA`
      (`cerradaPor = ADMIN` al cerrar). Los estados `ATENDIDA` y `CERRADA` son terminales.
- [x] El `ADMIN` ve un **listado** con filtros por `sector`, `urgencia` y `estado`.
- [x] Un `COLABORADOR` **no** puede crear solicitudes ni gestionar el estado.
- [x] La **migración** crea `solicitudes`, `recursos_solicitud` y los enums sin errores.
- [x] `pnpm test` cubre: transiciones válidas/inválidas, validaciones de creación, edición y
      cancelación por dueño y bloqueo fuera de `ABIERTA` — en verde.
- [x] `pnpm lint` / `pnpm build` sin errores; `solicitudes/domain` y `solicitudes/application`
      **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Dependencias:** no debería hacer falta ninguna nueva. Si se plantea un editor rich-text para
  `descripcion`, **avisar** (por ahora textarea plano). Zod/RHF/Prisma/Auth.js/Luxon ya están.
- **Next 16:** server actions y server components cambian — consultar
  `node_modules/next/dist/docs/` antes de codificar (AGENTS.md). Reutilizar `requireRol` de 002 y
  ampliar el matcher de `proxy.ts` si hace falta para `/(app)/solicitudes/*`.
- **`sector` texto libre:** hay riesgo de duplicados semánticos ("Petare" vs "petare " vs "Petare
  Norte"). Aplicar `trim`; considerar `nombreNormalizado` (lowercase) solo si aparece problema real.
  Documentar como deuda.
- **Riesgo de spam / solicitudes falsas:** el MVP asume buena fe y `requireRol(SOLICITANTE)`. La
  **verificación** (013) es lo que sube la confianza; hasta entonces el `ADMIN` filtra a mano.
- **Vinculación con Ayuda:** si se decide más adelante añadir `ayudaId?`, hacerlo como caso de uso
  explícito y opcional; no meter FK obligatoria.
- **Cardinalidad recursos:** una solicitud tendrá típicamente 1-5 recursos; sin paginación en el
  listado de recursos internos, pero sí paginación en el listado admin de solicitudes cuando el
  volumen lo requiera (dejar el contrato del repo abierto).
