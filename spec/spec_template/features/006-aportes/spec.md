# 006 · Aportes

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles`, `004 · Catálogo de recursos`, `005 · Ayudas / Envío` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce el **Aporte**: el registro con el que un `COLABORADOR` ofrece ayuda a una **Ayuda / Envío**
concreta contra un **Recurso** del catálogo. El aporte es la unidad de participación de los
colaboradores; sin él las metas de una Ayuda quedan como cifras en el aire. Cuando un aporte se marca
como **`RECIBIDO`**, su `cantidad` **suma al progreso** de la meta correspondiente.

- **Creación (`COLABORADOR`)** — el colaborador elige una Ayuda **en `RECOLECTANDO`** y un `Recurso`
  del catálogo (activo), indica una `cantidad` en la unidad del recurso y opcionalmente una nota. El
  aporte nace en estado `COMPROMETIDO`.
- **Confirmación (`ADMIN`)** — el `ADMIN` marca aportes como `RECIBIDO` cuando la entrega ocurre (o
  cuando confirma el ingreso monetario por un canal externo). Solo entonces el aporte suma al
  progreso de la meta.
- **Cancelación** — el colaborador puede **cancelar** su aporte mientras siga `COMPROMETIDO` (equivale
  a borrarlo); una vez `RECIBIDO` queda fijo y solo el `ADMIN` puede revertirlo.
- **Progreso de meta** — para cada `MetaRecurso` de una Ayuda, el progreso es
  `sum(aportes.cantidad WHERE estado = RECIBIDO AND ayudaId = X AND recursoId = Y) / cantidadObjetivo`.
  Se calcula aquí (los consumidores 008/009 lo leerán).
- **Recursos `MONETARIO`** — el aporte solo **registra** el monto; el pago siempre ocurre por fuera de
  la app (transferencia, PayPal, Zelle…). El `ADMIN` lo marca `RECIBIDO` al confirmar el ingreso.

## Por qué

`mission.md` sitúa al colaborador como uno de los tres actores centrales y al aporte como la vía por
la que suma. Sin `Aporte` no hay progreso real de metas, no hay transparencia posible (feature 009)
ni base para las notificaciones (012). Es el eslabón que convierte la Ayuda de plantilla en una pieza
que avanza. Es requisito directo de 008 (panel del admin) y 009 (tablero público).

## Decisiones tomadas

- **Solo cuentan aportes `RECIBIDO`.** `COMPROMETIDO` es intención, no progreso. El total mostrado en
  UI y usado para "meta cumplida" descarta los comprometidos. Los `COMPROMETIDOS` se muestran aparte
  como "prometido" para dar visibilidad al admin.
- **Estado en dos pasos (`COMPROMETIDO → RECIBIDO`).** El colaborador declara, el `ADMIN` confirma.
  Sin este dos-pasos cualquier persona podría inflar el progreso. La transición la ejecuta el `ADMIN`
  y es unidireccional (ver "Máquina de estados").
- **Máquina de estados en dominio puro.** Transiciones válidas:
  `COMPROMETIDO → RECIBIDO` (por `ADMIN`) y `COMPROMETIDO → (cancelado/borrado)` (por dueño o
  `ADMIN`). `RECIBIDO` es terminal desde el punto de vista del colaborador; el `ADMIN` puede revertir
  a `COMPROMETIDO` como corrección (ver notas). Nada de estados libres.
- **Aportes solo sobre Ayudas en `RECOLECTANDO`.** Una vez la Ayuda pasa a `LISTO`, no se aceptan
  aportes nuevos ni cancelaciones; los `COMPROMETIDOS` que queden se consideran "no cumplidos" pero
  no bloquean el avance del envío. Esto respeta la decisión de 005: metas y progreso congelados tras
  `LISTO`.
- **Recurso del aporte debe coincidir con una `MetaRecurso` de la Ayuda.** No se aportan recursos que
  la Ayuda no necesita. Si un colaborador quiere ofrecer algo fuera de meta, es un tema de solicitud
  (007), no de aporte.
- **`cantidad` numérica positiva**, en la unidad del recurso. Se almacena como `Decimal` en la base
  (precisión) y se convierte a `number` en el límite de infraestructura.
- **Un colaborador puede tener varios aportes sobre la misma Ayuda + Recurso.** No hay unicidad por
  (ayuda, recurso, colaborador); dos aportes pequeños del mismo colaborador son válidos. El progreso
  suma todos los `RECIBIDO`.
- **`PuntoAcopio` diferido a 011.** El campo relacional queda previsto pero sin UI ni validación
  contra el catálogo de acopios hasta 011.
- **Módulo `src/modules/aportes/`** con las cuatro capas (Clean + Screaming).

## Alcance

**Incluye**

- Modelo Prisma:
  - `enum EstadoAporte { COMPROMETIDO RECIBIDO }`.
  - `model Aporte`: `id`, relación a `Ayuda` (no cascade — no se borran ayudas con aportes recibidos),
    relación a `Recurso`, relación a `Usuario` (colaborador), `cantidad` (`Decimal @db.Decimal(12,2)`),
    `estado` (`@default(COMPROMETIDO)`), `nota` (opcional), `recibidoEn` (opcional, marca al pasar a
    `RECIBIDO`), timestamps. Índices por `ayudaId` y por `(ayudaId, recursoId, estado)` para el cálculo
    de progreso.
  - Relaciones inversas `aportes` en `Ayuda`, `Recurso` y `Usuario`.
  - **Migración** correspondiente.
- Dominio: entidad `Aporte`, enum `EstadoAporte`, contrato `AporteRepository`, reglas puras
  (`cantidad > 0`, transiciones válidas, `esEditable(estado)`), y la función pura de agregación
  `progresoDeMeta(aportes, cantidadObjetivo)`.
- Casos de uso:
  - `crearAporte` (colaborador): valida Ayuda en `RECOLECTANDO`, recurso activo y presente en las metas
    de la Ayuda, `cantidad > 0`; crea en `COMPROMETIDO`.
  - `listarAportesPorAyuda` (con filtro por estado); `listarAportesDeColaborador` (los propios).
  - `cancelarAporte` (colaborador dueño o `ADMIN`): solo si `COMPROMETIDO` y Ayuda aún en
    `RECOLECTANDO`.
  - `marcarRecibido` (solo `ADMIN`): transiciona `COMPROMETIDO → RECIBIDO`, marca `recibidoEn`.
  - `revertirARecibido` (solo `ADMIN`, corrección): transiciona `RECIBIDO → COMPROMETIDO` para
    corregir un marcado erróneo; deja auditoría en `updatedAt`.
  - `progresoDeAyuda(ayudaId)`: por cada meta de la Ayuda devuelve `{ recurso, objetivo, recibido, prometido, porcentaje }`.
- Infraestructura: `PrismaAporteRepository` (mapea `Decimal → number`); consultas de agregación por
  `(ayudaId, recursoId, estado)` con `groupBy`/`aggregate` de Prisma.
- Presentación:
  - **Colaborador** (bajo `/(app)/…` o el área autenticada equivalente a 002): botón "Aportar" en el
    detalle público/autenticado de una Ayuda; formulario `AporteForm` con selector de recurso
    (limitado a las metas de esa Ayuda), `cantidad` y nota. Vista **"Mis aportes"**.
  - **Admin** (bajo `/(admin)/panel/…`): lista de aportes de una Ayuda con acción **marcar recibido** y
    **revertir**; tarjeta de **progreso por meta** en el detalle de Ayuda (feature 005 queda con el
    hueco de "sin aportes aún" — aquí se rellena).
  - Server actions con `zod`, `requireRol` correspondiente y `revalidatePath`.
- Tests (Vitest): transiciones (válidas e inválidas), cantidad no positiva, aporte a Ayuda no
  `RECOLECTANDO`, recurso fuera de metas, cancelación fuera de estado, cálculo de progreso puro.

**No incluye**

- **Notificaciones** al colaborador cuando su aporte se marca `RECIBIDO` (feature 012).
- **Evidencia de entrega** (foto, nota estructurada) — es parte del seguimiento (010).
- **Vinculación con `PuntoAcopio`** en la UI (011). Campo previsto pero opcional y sin selector.
- **Registro manual de aportes por el `ADMIN`** en nombre de un tercero: para imputar un aporte
  externo (típico en `MONETARIO` recibido por transferencia). **Implementado en 014** como el caso de
  uso `registrarAporteExterno` (aquí en `aportes/application`): crea un `Aporte` `MONETARIO` que nace en
  `RECIBIDO`, con `colaboradorId` opcional (donación anónima) y `registradoPorId` = el `ADMIN`. La 014
  enmienda este modelo (hace `colaboradorId` y `ayudaId` opcionales y añade
  `registradoPorId`/`medioDonacionId`/`moneda`/`referencia`).
- **Reportes/exports** de aportes.
- Aportes a Ayudas en estados distintos de `RECOLECTANDO`.

## Criterios de aceptación

- [ ] Un `COLABORADOR` autenticado puede **crear** un aporte a una Ayuda en `RECOLECTANDO`, sobre un
      recurso presente en las metas y activo, con `cantidad > 0`. Nace en `COMPROMETIDO`.
- [ ] El sistema **rechaza**: cantidad no positiva, recurso archivado, recurso ausente de las metas de
      la Ayuda, Ayuda en estado distinto de `RECOLECTANDO`. Validado en servidor.
- [ ] El dueño del aporte (o un `ADMIN`) puede **cancelar** un aporte mientras esté `COMPROMETIDO`; un
      aporte `RECIBIDO` no se cancela.
- [ ] Solo el `ADMIN` puede **marcar** un aporte como `RECIBIDO` (registra `recibidoEn`). Solo el
      `ADMIN` puede **revertir** un `RECIBIDO` a `COMPROMETIDO`.
- [ ] El **progreso de una meta** = suma de `cantidad` de aportes `RECIBIDO` sobre esa
      `(ayuda, recurso)` ÷ `cantidadObjetivo`. Los `COMPROMETIDOS` **no** cuentan al progreso pero se
      exponen como "prometido".
- [ ] El **detalle de una Ayuda** (feature 005) muestra por cada meta: `objetivo`, `recibido`,
      `prometido`, `porcentaje` — reemplazando el placeholder "sin aportes aún".
- [ ] Un no-autenticado no puede aportar. Un `SOLICITANTE` no puede aportar (rol no autorizado).
- [ ] La **migración** crea `aportes` y el enum `EstadoAporte` sin errores; los índices por
      `ayudaId` y `(ayudaId, recursoId, estado)` existen.
- [ ] `pnpm test` cubre: transiciones válidas/inválidas, `cantidad ≤ 0`, recurso fuera de metas,
      aporte a Ayuda no `RECOLECTANDO`, cancelación fuera de estado y cálculo de `progresoDeMeta`
      puro — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `aportes/domain` y `aportes/application` **puras**
      (sin framework ni Prisma).

## Notas y riesgos

- **Dependencias:** no debería hacer falta ninguna nueva. Zod, RHF, Prisma, Auth.js y Luxon ya están.
  Si se plantea una librería de tabla (data-table) para el listado admin, **avisar**.
- **Next 16:** server actions y server components cambian — consultar `node_modules/next/dist/docs/`
  antes de codificar (AGENTS.md). Reutilizar `requireRol` y `proxy.ts` de 002; extender el matcher si
  hace falta para `/(app)/…` de aportes.
- **`Decimal` de Prisma:** convertir a `number` en el límite de infraestructura, consistente con lo
  decidido en 005. Documentarlo también aquí.
- **Concurrencia al marcar recibido:** dos administradores marcando el mismo aporte a la vez debe ser
  idempotente. Chequear estado dentro de la transacción o en la propia sentencia (`updateMany` con
  filtro `estado = COMPROMETIDO`).
- **Cálculo del progreso en lecturas frecuentes:** el `groupBy` sobre `aportes` filtrando por
  `estado = RECIBIDO` es barato con el índice `(ayudaId, recursoId, estado)`. Si en 009 el tablero
  público lo consume mucho, considerar cache/ISR — **no** materializar contadores denormalizados en
  esta feature.
- **Auditoría de reversión:** revertir un `RECIBIDO` es una corrección; queda el rastro básico en
  `updatedAt`. El histórico completo con nota y autor entra en 010 (Seguimiento). No adelantar.
- **Trazabilidad del ingreso monetario:** para recursos `MONETARIO` el aporte guarda el compromiso; la
  confirmación externa la registra el `ADMIN` al marcar `RECIBIDO`. Cualquier registro de "medios
  externos" o de "montos ingresados sin colaborador identificado" vive en 014.
