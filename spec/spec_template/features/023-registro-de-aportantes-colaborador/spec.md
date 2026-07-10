# 023 · Registro de aportantes visible al colaborador

> Estado: **Pendiente** · Enmienda: `006 · Aportes` · Depende de: `006`, `002` · Roadmap: `constitution/roadmap.md`

## Qué hace

Da al **`COLABORADOR`** una vista del **registro de aportes** de una actividad: **quiénes han aportado**,
qué recurso, cuánto y en qué estado. Hoy el colaborador solo ve **sus propios** aportes en `/mis-aportes`;
no puede ver quién más está colaborando. Esta feature añade, en el **detalle de la actividad**
(`/ayudas/[id]`), un **registro de aportantes** visible para cualquier usuario **autenticado**.

- **Lista de quiénes han aportado.** En el detalle de una actividad, una sección "Quiénes han aportado"
  muestra cada aporte con: **nombre del aportante**, **recurso**, **cantidad** (en la unidad del recurso)
  y **estado** (`Comprometido` / `Recibido`).
- **Reconoce el esfuerzo colectivo.** El colaborador ve que no está solo: otras personas también están
  aportando a esa actividad, lo que motiva a sumarse y da sensación de comunidad.
- **Solo datos de reconocimiento, sin datos de contacto.** Se muestra el **nombre** del aportante, nunca
  su cédula, teléfono, correo ni cualquier dato de contacto (esos son privados, ver feature 017).
- **Requiere sesión.** El registro con nombres es para usuarios **autenticados** (colaborador,
  solicitante, admin). La **transparencia pública** (`/transparencia`, feature 009) sigue **sin** mostrar
  nombres de personas.
- **Ordenado y legible.** Los aportes se listan del más reciente al más antiguo, con la fecha formateada
  en `es-VE` (`DD/MM/AAAA`). Si la actividad aún no tiene aportes, se muestra un vacío claro
  ("Todavía no hay aportes; sé el primero en colaborar").

## Por qué

Aportar es un acto social: la gente colabora más cuando **ve** que otros también lo hacen. Hoy el
colaborador aporta "a ciegas": no sabe si alguien más ha respondido a esa actividad ni cuánto falta en
compañía. La transparencia pública (009) da totales pero **oculta** a las personas (y con razón, es
abierta a cualquiera sin login). Falta un punto intermedio: para quien **ya tiene cuenta** y participa en
la red, mostrar **quién** ha aportado convierte el aporte en una historia colectiva, refuerza la
confianza ("esto es real, hay gente moviéndose") y anima a sumarse. El cliente lo pidió explícitamente:
"el colaborador podrá ver el registro de aporte, qué personas son las que han aportado".

## Decisiones tomadas

- **Se reutiliza el caso de uso existente `listarAportesPorAyuda`** (006). No hace falta modelo nuevo ni
  migración: el `Aporte` ya guarda `colaboradorId`, `cantidad`, `estado` y la relación con `Usuario` y
  `Recurso`. Solo se expone en una superficie nueva.
- **La vista vive en el detalle de la actividad de colaborador** (`/ayudas/[id]`), como una sección más,
  no una ruta aparte. Es donde el colaborador decide si aportar; ver quién más lo hizo cabe justo ahí.
- **Se muestra el `nombre` del `Usuario`, nada más de la persona.** El DTO de lectura para esta vista
  incluye solo `nombre` (más recurso/cantidad/estado/fecha). No se filtran `cedula`, `telefono`, `correo`
  ni ubicación. La query selecciona explícitamente los campos, no el usuario completo.
- **Acceso: usuarios autenticados.** El registro con nombres exige sesión. La ruta `/ayudas/[id]` puede
  ser visible sin login para ver la actividad, pero la **sección de aportantes con nombres** solo se
  renderiza para usuarios con sesión; sin sesión se muestran totales/agregados (o un CTA a iniciar
  sesión), nunca nombres.
- **Sin acciones desde esta vista.** Es de **solo lectura**: no se marca recibido ni se edita nada aquí
  (eso sigue siendo del `ADMIN` en su panel, 006). El colaborador solo consulta.
- **La transparencia pública (009) no cambia:** sigue anónima. Este registro con nombres es una superficie
  **distinta** y autenticada.

## Alcance

**Incluye**

- Aplicación (`src/modules/aportes/application`):
  - Reutilizar/ajustar una lectura para el detalle público-autenticado que devuelva, por actividad, los
    aportes con `nombre` del aportante, `recurso` (nombre/unidad), `cantidad`, `estado` y `fecha`.
    (Puede ser una variante "de reconocimiento" de `listarAportesPorAyuda` que **no** exponga datos de
    contacto.)
- Infraestructura (`src/modules/aportes/infrastructure`):
  - `PrismaAporteRepository`: `select` explícito de `colaborador: { nombre }` (sin cédula/teléfono/correo)
    + recurso + cantidad + estado + fecha, ordenado por `createdAt desc`.
- Presentación (`src/app/ayudas/[id]` + `src/modules/aportes/ui`):
  - Sección "Quiénes han aportado" en el detalle de la actividad, visible para usuarios **autenticados**.
  - Componente de tabla/lista de aportantes (nombre, recurso, cantidad, estado con su badge, fecha).
  - Estado vacío claro cuando no hay aportes.
  - Gating por sesión: sin login no se muestran nombres.
- Tests (Vitest): la lectura devuelve los aportes de la actividad con `nombre` y **sin** campos de
  contacto; ordena por fecha desc; el estado vacío se comporta bien.

**No incluye**

- **Mostrar datos de contacto** del aportante (cédula, teléfono, correo, ubicación): quedan fuera por
  privacidad.
- **Nombres en la transparencia pública** (`/transparencia`, 009): sigue anónima.
- **Acciones sobre aportes** desde esta vista (marcar recibido, revertir, editar): siguen siendo del
  `ADMIN` (006).
- **Perfiles públicos de colaborador** o rankings de aportantes: solo el registro por actividad. Si se
  quisiera un "top de colaboradores", se aborda aparte.
- **Filtros o paginación avanzada** del registro (más allá del orden por fecha): si el volumen lo pide,
  se trata como mejora posterior.

## Criterios de aceptación

- [ ] En el detalle de una actividad (`/ayudas/[id]`), un usuario **autenticado** ve la sección "Quiénes
      han aportado" con, por cada aporte: **nombre** del aportante, **recurso**, **cantidad** y **estado**.
- [ ] El registro **no** muestra cédula, teléfono, correo ni ubicación de ningún aportante (verificado en
      el DTO/`select`, no solo en la UI).
- [ ] Un usuario **sin sesión** **no** ve nombres de personas en esa sección (ve agregados o un CTA a
      iniciar sesión); la **transparencia pública** sigue sin nombres.
- [ ] Los aportes se listan del **más reciente al más antiguo**, con fecha en `es-VE` (`DD/MM/AAAA`).
- [ ] Si la actividad no tiene aportes, se muestra un **vacío claro** ("Todavía no hay aportes...").
- [ ] La vista es **solo lectura**: no permite marcar recibido, revertir ni editar (esas acciones siguen
      en el panel del `ADMIN`).
- [ ] `pnpm test` cubre: la lectura por actividad devuelve `nombre` sin datos de contacto y ordena por
      fecha desc, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `aportes/domain` y `aportes/application` permanecen **puras**.

## Notas y riesgos

- **Dependencias:** ninguna nueva. Reutiliza `Aporte`, la relación con `Usuario`/`Recurso` y el caso de
  uso `listarAportesPorAyuda` (006), Luxon (fechas) y Auth.js (sesión).
- **Privacidad como invariante:** la garantía de "solo `nombre`" debe estar en la **lectura**
  (`select` explícito de Prisma), no confiada a la UI. Un test debe fallar si el DTO expone cédula,
  teléfono o correo.
- **Sin migración:** el modelo de 006 ya tiene todo; esta feature es de **exposición**, no de datos.
- **Coherencia con 022:** el registro de aportantes es de la **actividad** (que el colaborador ve en la
  red completa), no de la gestión del admin; por tanto **no** se aísla por dueño (ver 022).
- **Estados con vocabulario claro:** reutilizar `EstadoAporteBadge` (006) para "Comprometido"/"Recibido".
- **Next 16:** el detalle `/ayudas/[id]` ya existe (006); leer `node_modules/next/dist/docs/` antes de
  tocarlo (AGENTS.md). Obtener la sesión con el helper de 002.
- **Prohibido em-dash (`—`) / en-dash (`–`)** en textos visibles (ver `constitution/tech-stack.md`).
