# 022 · Actividades por administrador (aislamiento por dueño)

> Estado: **Hecho** · Enmienda: `005 · Ayudas / Envío` y `008 · Panel de administración` · Depende de: `005`, `008`, `015`, `018` · Roadmap: `constitution/roadmap.md`

## Qué hace

Cada **Ayuda / Actividad** (envío, jornada o evento social) pasa a **pertenecer al `ADMIN` que la crea**.
Hoy la `Ayuda` no tiene dueño: cualquier `ADMIN` ve y gestiona las actividades de todos los demás. Esta
feature añade un **dueño** (`adminId`) a la actividad y **aísla la gestión por administrador**: un
`ADMIN` solo ve, edita y hace avanzar de estado **sus propias** actividades.

- **Toda actividad tiene dueño.** Al crearse, la actividad queda asociada al `ADMIN` autenticado. El
  dueño no cambia después.
- **El panel de gestión se filtra por dueño.** El listado `/(admin)/panel/ayudas` muestra **solo** las
  actividades del `ADMIN` en sesión. No se mezclan con las de otros administradores.
- **Detalle, edición y avance de estado protegidos por propiedad.** Si un `ADMIN` intenta abrir, editar,
  gestionar metas, avanzar el estado o eliminar una actividad que **no es suya**, el servidor lo impide
  (404 / no autorizado). La protección vive en el servidor, no solo en la UI.
- **Las métricas del panel (008) se miden por dueño.** Los agregados de `/panel` (envíos por estado,
  aportes pendientes, "qué envío sale primero", sectores top) cuentan **solo** las actividades del
  `ADMIN` en sesión, para que su tablero refleje su operación y no la de la red completa.
- **Lo público y lo del colaborador NO se aíslan.** El colaborador aporta a la red entera: las vistas de
  colaborador (`/ayudas`, `/ayudas/[id]`, aportar) y la **transparencia pública** (`/transparencia`,
  feature 009) siguen mostrando actividades de **todos** los administradores. El aislamiento es **solo**
  de la superficie de **gestión** del `ADMIN`.
- **El `SUPERADMIN` puede ver todas** (supervisión), pero **no** gestiona (crear/editar/avanzar sigue
  siendo del `ADMIN` dueño). Esta feature no crea una pantalla nueva para el superadmin; solo deja el
  dominio y las lecturas preparados para no re-aislar más adelante.
- **Migración con backfill.** Las actividades que ya existen se asignan a un `ADMIN` dueño (ver
  "Decisiones") para que ninguna quede huérfana.

## Por qué

En la red de "Unidos por la Guaira" cada `ADMIN` es un centro de acopio independiente (ver features 015 y
016). Que un administrador vea y pueda tocar las actividades de otro rompe esa independencia: genera
confusión ("¿por qué aparece un envío que yo no creé?"), riesgo de que alguien avance de estado o edite
algo ajeno, y métricas de panel que no representan su operación real. Atar cada actividad a su dueño y
filtrar la gestión por él devuelve a cada administrador **su** tablero, **sus** envíos y **su** control,
sin tocar la experiencia del colaborador ni la transparencia pública, que sí deben ver la red completa.

## Decisiones tomadas

- **`adminId` es un campo obligatorio de la `Ayuda`, con FK a `Usuario`.** Se llama `adminId` por
  coherencia con `PuntoAcopio.adminId` (016). No se crea entidad nueva ni módulo aparte: sigue siendo
  `src/modules/ayudas`.
- **El dueño se fija al crear y es inmutable.** No entra en `CambiosAyuda` (no se "transfiere" una
  actividad a otro admin). Si en el futuro hiciera falta transferir, se aborda como cambio aparte.
- **La propiedad se comprueba en el servidor en cada operación de gestión** (detalle de gestión, editar
  cabecera, gestionar metas, avanzar estado, eliminar). El caso de uso recibe el `adminId` del solicitante
  y rechaza si no coincide con el dueño (error de dominio → 404/403 en la capa `app`). No basta con
  ocultar en la UI.
- **El filtro por dueño es un parámetro del listado de gestión**, combinable con los filtros por estado
  (005) y por tipo (018) ya existentes. El listado de gestión **siempre** pasa el `adminId` de la sesión.
- **Backfill: las actividades existentes se asignan al `ADMIN` semilla** (el `ADMIN` de prueba sembrado
  por `db:seed`; si no existe, al primer `ADMIN` por `createdAt`, y si tampoco hubiera ninguno, al
  `SUPERADMIN`). La migración documenta esta regla. Se hace en dos pasos: columna **nullable** →
  `UPDATE` de backfill → `NOT NULL`.
- **Colaborador y público ven la red completa.** Las lecturas de colaborador y de transparencia (009) **no**
  reciben `adminId` y siguen sin filtrar por dueño. Se mantiene explícito para no aislar de más.
- **Las métricas del panel (008) reciben el `adminId` del ADMIN en sesión.** Los contadores y listados
  agregados que hoy son globales pasan a aceptar (y exigir, en el contexto del panel) el filtro por dueño.

## Alcance

**Incluye**

- Modelo Prisma (enmienda de 005):
  - En `model Ayuda`: `adminId String` + relación `admin Usuario @relation(...)`, con `@@index([adminId])`.
  - Relación inversa en `Usuario` (`ayudas Ayuda[]` o nombre equivalente).
  - **Migración** `add_admin_a_ayuda`: añade la columna (nullable), **backfillea** las filas existentes al
    `ADMIN` dueño según la regla anterior y fija `NOT NULL`.
- Dominio (`src/modules/ayudas/domain`):
  - `adminId: string` en la entidad `Ayuda` y en `NuevaAyuda`. **No** en `CambiosAyuda`.
  - Regla/error de dominio para "actividad no pertenece al solicitante".
- Aplicación (`src/modules/ayudas/application`):
  - `crearAyuda` persiste el `adminId` del creador.
  - `listarAyudas` acepta `adminId?` en el filtro (combinable con `estado?` y `tipo?`).
  - `obtenerAyuda`, `editarCabecera`, `gestionarMetas`, `avanzarEstado`, `eliminarAyuda` reciben el
    `adminId` del solicitante y **verifican propiedad** antes de operar; si no es el dueño, error.
  - Los casos de uso del panel (008) que hoy agregan global (`contarAyudasPorEstado`,
    `listarPrioridadRecolectando`, contadores de aportes/sectores) aceptan `adminId` para acotar al dueño.
- Infraestructura (`src/modules/ayudas/infrastructure`):
  - `PrismaAyudaRepository` mapea `adminId` en lectura/escritura y aplica el filtro por `adminId` al listar
    y en las agregaciones.
- Presentación (`src/app` + `ui`, solo `ADMIN`):
  - Todas las pantallas de `/(admin)/panel/ayudas` (listado, detalle, nueva, editar) pasan el `adminId` de
    la sesión y solo operan sobre actividades propias.
  - `/panel` (008): las métricas se calculan para el `ADMIN` en sesión.
  - Mensaje claro cuando se intenta acceder a una actividad ajena (404 "no encontrada" para no filtrar
    existencia).
- Tests (Vitest): creación fija el dueño; `listarAyudas` filtra por `adminId`; los casos de gestión
  rechazan cuando el solicitante no es el dueño; las métricas del panel se acotan por `adminId`.

**No incluye**

- **Transferir la propiedad** de una actividad a otro administrador.
- **Pantalla de supervisión del `SUPERADMIN`** con todas las actividades de la red (se deja el dominio
  listo, pero la vista es otra feature).
- **Aislar aportes, solicitudes o recursos por admin.** El `Recurso` es catálogo compartido; las
  `Solicitud` las gestiona el admin bajo otras reglas (007); los `Aporte` los cruza el colaborador. Aquí
  solo se aísla la **gestión de actividades**.
- **Cambiar la experiencia del colaborador ni la transparencia pública** (siguen viendo la red completa).

## Criterios de aceptación

- [ ] Al crear una actividad, queda asociada al `ADMIN` autenticado (`adminId`), y ese dueño **no** cambia
      al editar la cabecera (validado en servidor).
- [ ] El listado `/(admin)/panel/ayudas` muestra **solo** las actividades del `ADMIN` en sesión; ninguna
      de otro administrador aparece, con o sin filtros de estado/tipo aplicados.
- [ ] Un `ADMIN` que intenta abrir, editar, gestionar metas, avanzar estado o eliminar una actividad de
      **otro** administrador recibe un **404 / no autorizado** desde el servidor (no solo oculto en UI).
- [ ] Las métricas de `/panel` (008) reflejan **solo** las actividades del `ADMIN` en sesión.
- [ ] Las vistas de **colaborador** (`/ayudas`, `/ayudas/[id]`, aportar) y la **transparencia pública**
      (`/transparencia`) siguen mostrando actividades de **todos** los administradores (sin regresión).
- [ ] La **migración** añade `adminId`, **backfillea** todas las actividades existentes a un `ADMIN` dueño
      según la regla documentada y fija `NOT NULL`, sin filas huérfanas.
- [ ] Un usuario no-`ADMIN` (o sin sesión) sigue sin poder crear ni gestionar actividades (protección de
      002/015 intacta).
- [ ] `pnpm test` cubre: alta fija el dueño, filtro por `adminId` en el listado, rechazo de gestión sobre
      actividad ajena y métricas del panel acotadas por dueño, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `ayudas/domain` y `ayudas/application` permanecen **puras**
      (sin framework ni Prisma).

## Notas y riesgos

- **Dependencias:** ninguna nueva. Reutiliza Prisma, `zod`, Auth.js (`requireRol(ADMIN)` de 002/015).
- **Enmienda aditiva a 005 y 008, no reescritura.** Cuidar que la suite de 005/008 siga en verde tras
  añadir el filtro por dueño.
- **Backfill sensible:** si la base ya tuviera actividades de varios administradores "reales", asignarlas
  todas a un único dueño es una simplificación consciente (hoy no hay dueño, así que no hay una
  atribución "correcta"). Documentar la regla en la migración y avisar antes de aplicar en producción.
- **No filtrar existencia:** ante una actividad ajena, responder **404** ("no encontrada") en vez de 403
  para no revelar que existe una actividad de otro admin con ese id.
- **Punto único de verdad de la propiedad:** centralizar la comprobación "¿este `adminId` es el dueño?"
  en el dominio/aplicación, no repetir el `if` en cada server action.
- **Next 16:** las server actions y server components de gestión ya existen (005/018); leer
  `node_modules/next/dist/docs/` antes de tocarlas (AGENTS.md).
- **Prohibido em-dash (`—`) / en-dash (`–`)** en textos visibles (ver `constitution/tech-stack.md`).
