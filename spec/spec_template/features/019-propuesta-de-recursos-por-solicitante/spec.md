# 019 · Propuesta de recursos por el solicitante

> Estado: **Siguiente 🔜** · Depende de: `004 · Catálogo de recursos`, `007 · Solicitudes de ayuda` · Enmienda: `004 · Catálogo de recursos` · Roadmap: `constitution/roadmap.md`

## Qué hace

Abre el **catálogo de recursos** a la contribución del `SOLICITANTE`. Hasta ahora solo el `ADMIN`
podía dar de alta un `Recurso` (feature 004). Esta feature permite que un `SOLICITANTE`, cuando el
recurso que necesita no existe todavía, lo **proponga** al catálogo; la propuesta nace en estado
`PROPUESTO` y queda a la espera de que el `ADMIN` la revise. El `ADMIN` conserva su capacidad de
crear recursos ya `APROBADO` y suma una **bandeja de revisión** para aprobar (`APROBADO`) o
rechazar (`RECHAZADO`) lo propuesto.

- **`Recurso` gana un estado de aprobación** — nuevo campo `estadoAprobacion` ∈
  `APROBADO` | `PROPUESTO` | `RECHAZADO` y una referencia `propuestoPor` al usuario que lo propuso
  (nula cuando lo crea el `ADMIN`).
- **El `ADMIN` sigue creando `APROBADO`** — el alta desde `/panel/recursos` (feature 004) no cambia
  de flujo: los recursos que crea el `ADMIN` nacen `APROBADO` y son usables de inmediato.
- **El `SOLICITANTE` propone (`PROPUESTO`)** — desde su flujo de solicitud (feature 007), cuando lo
  que necesita no está en el catálogo, propone un recurso nuevo (`nombre`, `unidad`, `categoria`,
  `descripcion` opcional). Nace en `PROPUESTO` con `propuestoPor` = su usuario. No queda disponible
  para metas ni aportes hasta que el `ADMIN` lo apruebe.
- **Bandeja de revisión del `ADMIN`** — una vista lista los recursos `PROPUESTO` (quién los propuso y
  cuándo) y permite **aprobar** (pasa a `APROBADO`) o **rechazar** (pasa a `RECHAZADO`, con la
  propuesta conservada para auditoría). El `ADMIN` puede ajustar los datos antes de aprobar.
- **Invariante de selección** — solo los recursos `APROBADO` (y `activo`) son seleccionables en
  `MetaRecurso` (metas de una Ayuda, feature 005) y en `Aporte` (feature 006). Un recurso
  `PROPUESTO` o `RECHAZADO` no aparece en esos selectores.

## Por qué

`mission.md` define al `SOLICITANTE` como "quien requiere o hace una petición de ayuda específica
para algún sector" y añade que "también puede proponer recursos al catálogo". `tech-stack.md` ya
recoge la regla en el modelo de datos: un `Recurso` tiene `estadoAprobacion` y "solo los `APROBADO`
son seleccionables en metas y aportes". Sin esta feature, el catálogo es una lista cerrada que solo
el `ADMIN` alimenta: si el solicitante necesita algo que no está previsto (una medicina concreta, un
insumo específico), no tiene forma de expresarlo en el vocabulario del sistema y la petición pierde
precisión. Abrir la propuesta, con revisión del `ADMIN`, mantiene la **consistencia del catálogo**
(nada entra a metas/aportes sin aprobación) a la vez que recoge la señal del terreno.

## Decisiones tomadas

- **Un solo campo de estado (`estadoAprobacion`), separado de `activo`.** Son ejes distintos:
  `estadoAprobacion` (`APROBADO` | `PROPUESTO` | `RECHAZADO`) es el ciclo de revisión; `activo`
  (feature 004) es el archivado de un recurso ya aprobado. Un recurso solo es seleccionable si es
  `APROBADO` **y** `activo`. No se mezclan en un único enum para no perder el histórico de archivado.
- **El `ADMIN` crea `APROBADO`; el `SOLICITANTE` crea `PROPUESTO`.** El estado inicial lo fija el
  caso de uso según el rol del actor, no el cliente. El `SOLICITANTE` nunca puede crear `APROBADO`
  directamente (protegido en servidor).
- **`propuestoPor` referencia al `Usuario` que propuso, nullable.** Los recursos creados por el
  `ADMIN` y los del backfill quedan con `propuestoPor = null`. Da trazabilidad de quién pidió qué.
- **Backfill: los recursos existentes se consideran `APROBADO`.** Al introducir el campo, todo el
  catálogo previo (creado por el `ADMIN` en 004) migra a `estadoAprobacion = APROBADO` para no romper
  metas ni aportes ya definidos. El default de la columna es `APROBADO` para que el flujo del `ADMIN`
  no cambie. Ver "Notas y riesgos".
- **Ciclo de vida acotado: `PROPUESTO → APROBADO` | `PROPUESTO → RECHAZADO`.** No hay más
  transiciones. `APROBADO` y `RECHAZADO` son terminales desde la óptica de la revisión; un recurso
  `RECHAZADO` no se reactiva (si vuelve a hacer falta, se propone de nuevo). Un recurso `APROBADO`
  sigue su ciclo normal de archivar/activar de la feature 004.
- **La unicidad de `nombre` (004) aplica a toda propuesta.** Una propuesta con un `nombre` que ya
  existe (insensible a mayúsculas/espacios) se rechaza en el momento de proponer, evitando duplicados
  en el catálogo. Así el solicitante ve de inmediato que "Agua" ya existe.
- **El `ADMIN` puede editar la propuesta antes de aprobarla.** Los datos del solicitante pueden venir
  imperfectos (unidad ambigua, categoría dudosa); el `ADMIN` normaliza antes de aprobar, reutilizando
  el `editarRecurso` de 004.
- **Origen de la propuesta desde la solicitud (007), sin FK obligatoria.** La propuesta se dispara
  desde el flujo de crear/editar una solicitud, pero no se guarda un vínculo formal recurso ↔
  solicitud: el recurso propuesto pasa a ser parte del catálogo global. La conexión con 007 es de
  flujo de usuario (dónde se ofrece proponer), no de modelo. Ver "Notas y riesgos".
- **Se enmienda el módulo `src/modules/recursos/`**, no se crea uno nuevo. La propuesta es una
  variante del alta de recurso; vive en el mismo dominio.

## Alcance

**Incluye**

- **Enmienda del modelo `Recurso` en Prisma:**
  - `enum EstadoAprobacionRecurso { APROBADO PROPUESTO RECHAZADO }`.
  - `Recurso.estadoAprobacion EstadoAprobacionRecurso @default(APROBADO)`.
  - `Recurso.propuestoPor` (relación opcional a `Usuario`) + `propuestoPorId String?`.
  - Relación inversa `recursosPropuestos` en `Usuario`.
  - **Migración** que añade enum, columnas y relación, con **backfill** de los recursos existentes a
    `estadoAprobacion = APROBADO` (default de columna) y `propuestoPorId = null`.
- **Dominio (`recursos/domain`):**
  - Enum `EstadoAprobacionRecurso` (const-object + unión, mismos valores que Prisma).
  - Ampliar la entidad `Recurso` con `estadoAprobacion` y `propuestoPorId`.
  - Ampliar `NuevoRecurso` para admitir `estadoAprobacion` y `propuestoPorId` según el origen.
  - Regla pura `esSeleccionable(recurso)` = `estadoAprobacion === APROBADO && activo`.
  - Máquina de revisión pura: `PROPUESTO → APROBADO` | `PROPUESTO → RECHAZADO` (transiciones válidas).
  - Ampliar `FiltroRecursos` con `estadoAprobacion` para poder listar `PROPUESTO` (bandeja) y
    `soloSeleccionables` para metas/aportes.
- **Aplicación (`recursos/application`):**
  - `proponerRecurso(deps, input, solicitanteId)`: normaliza, valida (unicidad de nombre, unidad no
    vacía, categoría válida), crea en `PROPUESTO` con `propuestoPor = solicitanteId`.
  - `aprobarPropuesta(deps, id)` / `rechazarPropuesta(deps, id)` (solo `ADMIN`): valida transición
    desde `PROPUESTO`; error si el recurso no está `PROPUESTO`.
  - `listarPropuestas(deps)` (solo `ADMIN`): recursos `PROPUESTO` para la bandeja.
  - Ajustar `crearRecurso` (004) para fijar `estadoAprobacion = APROBADO` y `propuestoPor = null`.
  - Ajustar `listarRecursos` para que el filtro `soloSeleccionables` (usado por 005/006) devuelva solo
    `APROBADO` + `activo`.
  - Errores de aplicación (`PropuestaNoEncontradaError`, `TransicionAprobacionInvalidaError`).
- **Infraestructura:** ampliar `PrismaRecursoRepository` para mapear los campos nuevos, filtrar por
  `estadoAprobacion` y por `soloSeleccionables`, y persistir `propuestoPorId`.
- **Presentación:**
  - **Solicitante** (flujo 007): en `SolicitudForm`, cuando el recurso buscado no existe, opción
    **"Proponer nuevo recurso"** que abre el alta de propuesta (`nombre`, `unidad`, `categoria`,
    `descripcion` opcional). Server action con `zod`, `requireRol(SOLICITANTE)` y `revalidatePath`.
  - **Admin** (bajo `/(admin)/panel/recursos`): **bandeja de propuestas** (nueva sub-vista o pestaña)
    que lista los `PROPUESTO` con `propuestoPor` y fecha, con acciones **aprobar** / **rechazar** y
    la posibilidad de **editar** antes de aprobar (reusa el form de 004). Server actions con `zod`,
    `requireRol(ADMIN)` y `revalidatePath`.
  - Los selectores de recurso de 005 (`MetaRecurso`) y 006 (`Aporte`) consumen solo
    `soloSeleccionables`.
- **Enmienda visible de la feature 004:** el listado del catálogo distingue el `estadoAprobacion`
  (etiqueta `PROPUESTO` / `RECHAZADO` / `APROBADO`) junto al estado `activo/archivado`.
- **Tests (Vitest):** estado inicial por origen (admin `APROBADO`, solicitante `PROPUESTO`);
  transiciones válidas/inválidas de revisión; `esSeleccionable`; que `listarRecursos(soloSeleccionables)`
  excluye `PROPUESTO`/`RECHAZADO`/archivados; rechazo de propuesta con nombre duplicado.

**No incluye**

- **Vínculo formal recurso ↔ solicitud** (FK). La propuesta se ofrece desde el flujo de 007 pero el
  recurso es global (ver "Decisiones").
- **Reactivar un recurso `RECHAZADO`.** Si vuelve a hacer falta, se propone de nuevo.
- **Notificar al solicitante** cuando su propuesta se aprueba o rechaza (eso es 012).
- **Propuesta por el `COLABORADOR`.** Solo el `SOLICITANTE` (y el alta directa del `ADMIN`).
- **Edición de la propuesta por el propio solicitante** tras enviarla: una vez propuesta, la gestiona
  el `ADMIN`. El solicitante puede volver a proponer si se equivocó (sujeto a la unicidad de nombre).
- **Cuotas o límites** de cuántos recursos puede proponer un solicitante (se asume buena fe; ver
  riesgo de spam).

## Criterios de aceptación

- [ ] Un `SOLICITANTE` autenticado puede **proponer** un recurso nuevo (`nombre`, `unidad`,
      `categoria`, `descripcion` opcional); se guarda con `estadoAprobacion = PROPUESTO` y
      `propuestoPor` = su usuario.
- [ ] Un recurso `PROPUESTO` **no aparece** en los selectores de recurso de metas (`MetaRecurso`) ni
      de aportes (`Aporte`); tampoco uno `RECHAZADO` ni uno archivado.
- [ ] El `ADMIN` sigue pudiendo **crear** recursos que nacen `APROBADO` (feature 004) y usables de
      inmediato; `propuestoPor` queda nulo.
- [ ] El `ADMIN` ve una **bandeja** con los recursos `PROPUESTO` (nombre, unidad, categoría, quién lo
      propuso y fecha en formato `DD/MM/AAAA`).
- [ ] El `ADMIN` puede **aprobar** una propuesta (`PROPUESTO → APROBADO`): pasa a ser seleccionable en
      metas y aportes.
- [ ] El `ADMIN` puede **rechazar** una propuesta (`PROPUESTO → RECHAZADO`): no se selecciona y se
      conserva para auditoría.
- [ ] El sistema **rechaza** aprobar/rechazar un recurso que no esté `PROPUESTO` (error claro).
- [ ] El sistema **rechaza** proponer un recurso con `nombre` ya existente (insensible a mayúsculas y
      espacios), con mensaje claro.
- [ ] Un `SOLICITANTE` **no** puede crear un recurso `APROBADO` directamente ni aprobar/rechazar
      propuestas; un `COLABORADOR` no puede proponer (protegido en servidor).
- [ ] La **migración** añade el enum `EstadoAprobacionRecurso`, las columnas `estadoAprobacion` y
      `propuestoPorId` y la relación, sin errores, y **los recursos previos quedan `APROBADO`**
      (backfill).
- [ ] `pnpm test` cubre: estado inicial por origen, transiciones de revisión válidas/inválidas,
      `esSeleccionable`, exclusión de `PROPUESTO`/`RECHAZADO`/archivados en el listado seleccionable y
      rechazo de nombre duplicado — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `recursos/domain` y `recursos/application` permanecen
      **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Dependencias:** no debería hacer falta ninguna nueva (`zod`, RHF, Prisma y Auth.js ya están). Si
  se planteara una tabla de datos para la bandeja, **avisar** antes (límite duro).
- **Backfill de la migración:** el `@default(APROBADO)` de la columna cubre los inserts, pero para las
  **filas existentes** el default no basta si Postgres las deja nulas: la migración debe incluir un
  `UPDATE recursos SET "estadoAprobacion" = 'APROBADO'` (o crear la columna `NOT NULL DEFAULT
  'APROBADO'`, que rellena las filas). Verificar que no queda ningún recurso previo sin estado.
- **Invariante crítica de selección:** el punto de fallo más probable es olvidar filtrar por
  `soloSeleccionables` en algún selector de 005/006. La regla `esSeleccionable` vive en el dominio y
  el filtro en el repositorio; añadir un test que garantice que un `PROPUESTO` no entra en el listado
  que consumen metas/aportes.
- **Next 16:** server actions y server components cambian respecto a versiones previas; consultar
  `node_modules/next/dist/docs/` antes de codificar (AGENTS.md). Reutilizar `requireRol` de 002 y
  cubrir con el matcher de `proxy.ts` las rutas de propuesta del solicitante y la bandeja del admin.
- **Pureza de capas:** el enum `EstadoAprobacionRecurso` de dominio comparte valores con el de Prisma
  (misma unión de strings) para mapear sin casts, como en 004.
- **Riesgo de spam / propuestas de baja calidad:** el MVP asume buena fe y `requireRol(SOLICITANTE)`.
  La revisión del `ADMIN` es el filtro; si aparece abuso, se valorará una cuota o la verificación del
  solicitante (013). Documentar como deuda.
- **Conexión con 007:** la propuesta se ofrece desde el flujo de solicitud, pero el recurso propuesto
  no queda ligado por FK a esa solicitud. Si más adelante se quiere trazar "esta solicitud generó
  este recurso", entra como caso de uso propio (no en esta feature).
- **Enmienda de 004:** al cerrar esta feature, revisar que la `spec` de 004 y su `DOC` mencionen el
  `estadoAprobacion` para que la documentación siga fiel al modelo actualizado.
