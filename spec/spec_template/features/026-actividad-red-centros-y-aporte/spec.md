# 026 · Actividad: red apta visible, varios centros de acopio y rediseño de aporte

> Estado: **Hecho** · Enmienda: `024 · Actividad: renombre y ciclo de vida por tipo`, `025 ·
> Afiliación a centros de acopio y categorías de aporte`, `006 · Aportes` (solo presentación) · Depende
> de: `024`, `025`, `011 · Puntos de acopio` · Roadmap: `constitution/roadmap.md`

## Qué hace

Cierra tres huecos alrededor del flujo de crear una `Actividad` y de aportar a ella:

- **(A) Ver la red apta, no solo contarla.** Al crear o editar una actividad, junto al conteo de
  colaboradores aptos por meta ("N de tu red pueden aportar esto", feature 025) se añade un botón
  **"+ info"** que despliega **en línea** la lista de esos colaboradores (nombre, categorías declaradas y
  estado de verificación). Sigue siendo puramente informativa: no selecciona ni invita a nadie, no cambia
  a qué actividad puede aportar un colaborador (coherente con 025, sin RSVP).
- **(B) Asignar varios centros de acopio a una actividad.** La actividad pasa de tener **un** punto de
  acopio opcional (feature 024) a poder asociar **varios** puntos de acopio del propio `ADMIN` dueño. El
  colaborador ve esos centros en el detalle de la actividad para saber dónde entregar su aporte.
- **(C) Rediseño visual de las vistas de aporte y de detalle de actividad.** `/actividades/[id]` y
  `/actividades/[id]/aportar` (con `AporteForm`) hoy se ven planas y sin jerarquía. Se rediseñan
  respetando la constitución (`constitution/tech-stack.md`, sección "Estilo visual"). Es un cambio
  **solo de presentación**: no toca dominio, aplicación ni el modelo de aportes.

### (A) Red apta visible al crear/editar

- El conteo por meta se conserva tal cual (solo verificados, coherente con la convocatoria de 025).
- Un botón **"+ info"** por cada meta expande/colapsa, **debajo del selector de recurso**, la lista de
  colaboradores de la red del admin cuya categoría declarada incluye la del recurso elegido.
- Cada fila de la lista muestra: **nombre**, **categorías declaradas** y un **badge de verificación**
  (`VERIFICADO` / `PENDIENTE`). **Sin** teléfono ni WhatsApp; para contactar sigue estando `/panel/red`.
- **Población de la lista:** los afiliados del admin (verificados y no verificados) cuya categoría
  intersecta la del recurso. El **número** del encabezado sigue contando **solo verificados**; el badge
  permite ver quién aún está pendiente (y por tanto no entraría en la convocatoria de 012).
- Si nadie de la red es apto para esa categoría, el botón "+ info" no aparece (o se muestra deshabilitado)
  y se mantiene el texto actual "Nadie de tu red declaró poder aportar esto todavía."

### (B) Varios centros de acopio por actividad

- Al crear/editar una actividad, el `ADMIN` puede marcar **cero, uno o varios** de sus puntos de acopio
  activos (lista de checkboxes en vez del `Select` único de 024). **Opcional**: se puede crear sin ningún
  centro (hay actividades meramente informativas; un `ADMIN` sin puntos registrados sigue pudiendo crear).
- Cada punto asignado debe **pertenecer al `ADMIN` dueño** y estar **activo**. Se rechaza en servidor
  cualquier punto ajeno o archivado (mismo criterio de propiedad que 024/011).
- En el **detalle de la actividad** (`/actividades/[id]`), el colaborador ve un bloque "Dónde entregar"
  con los centros asignados (nombre, dirección, horarios/referencia según lo que exponga 011). Si no hay
  ninguno, el bloque no se muestra.
- La **transparencia pública** (`/transparencia`, feature 009) **sigue sin exponer** puntos de acopio
  (decisión de 024 intacta).

### (C) Rediseño de aporte y detalle de actividad

- Alcance visual: `/actividades/[id]` (detalle para colaborador), `/actividades/[id]/aportar` y el
  componente `AporteForm`; de rebote, los componentes que estas vistas reutilizan y que hoy se ven pobres
  (`ProgresoMetas`, `AportantesTabla`) se pulen sin cambiar su contrato de datos.
- La **constitución es la fuente de verdad dura**: paleta anclada (ocre `--primary` como identidad, teal
  `--accent` como soporte/interacción), `EB Garamond` (`font-serif`) para headings, `Geist Mono` +
  `numeric-tnum` para números, hairlines (`border-t border-border`) en vez de cards por defecto, radios
  desde `--radius`, motion con `--ease-out-emil`, y todas las restricciones duras (ver "No incluye" y
  "Criterios de aceptación").
- Se apoya en las skills `/interface-design`, `/emil-design-eng` e `/impeccable` como guía de calidad al
  implementar, pero ninguna sustituye ni contradice la constitución.
- **Cero regresión funcional:** mismos flujos, mismas rutas, mismos casos de uso y mismos tests de
  comportamiento (006/023). Solo cambia el marcado y las clases.

## Por qué

- **(A)** El cliente pidió (025) que el admin vea "quién de su red" puede aportar un recurso al crear la
  actividad. 025 entregó solo el **número** por decisión de alcance; el paso natural es dejar ver **la
  lista** sin salir del formulario, para decidir con nombres y no con un contador abstracto. Mantenerla
  informativa (sin selección) preserva el espíritu de 025 (afiliación no restrictiva, sin RSVP).
- **(B)** Un mismo envío o jornada suele recibir aportes en **más de un punto** (varios centros de acopio
  de la misma organización). El campo único de 024 obliga a elegir uno solo y deja al colaborador sin
  saber que puede entregar en otro sitio más cercano. Permitir varios refleja la operación real y da al
  colaborador el destino correcto.
- **(C)** Las vistas de aporte y de detalle son de las más visitadas por el colaborador (es donde decide
  y donde entrega) y hoy transmiten descuido: headings sans sin jerarquía, exceso de
  `text-muted-foreground`, sin identidad de marca. Pulirlas sube la percepción de seriedad de toda la
  plataforma justo en el momento de conversión (aportar).

## Decisiones tomadas

- **(A) Precarga en el server component, sin round-trips.** La página de crear/editar ya calcula los
  conteos por categoría (025); ahora además carga la red apta **agrupada por categoría**
  (`Record<CategoriaRecurso, MiembroRedApto[]>`) reutilizando la lectura de `afiliaciones`
  (`consultarRed` / `listarMiRed`). La base es pequeña (demo), así que precargar las 4 categorías es más
  simple y barato que un server action por clic. El "+ info" solo muestra/oculta en cliente.
- **(A) La lista reutiliza el mismo origen que `/panel/red`, con un DTO recortado.** Un
  `MiembroRedApto = { nombre, categorias, verificado }` sin datos de contacto, para no duplicar la
  exposición de teléfono/WhatsApp fuera de `/panel/red` (coherencia con 023 y 025).
- **(A) El conteo del encabezado no cambia de semántica.** Sigue siendo "solo verificados"; la lista
  añade contexto (quién está pendiente) mediante el badge, sin alterar el número que ya interpreta el
  admin.
- **(B) Tabla puente explícita `ActividadPuntoAcopio`, no relación implícita de Prisma.** Coherente con
  el resto de N a N del proyecto (`MetaRecurso`, `Afiliacion`, `RecursoSolicitud`), todas puente
  explícito. Da un punto claro para índices y para el mapeo en el repositorio.
- **(B) Se elimina `Actividad.puntoAcopioId`; la relación pasa a ser solo la tabla puente.** No se
  mantienen los dos caminos (campo único + puente) para no tener dos fuentes de verdad. La migración
  **backfillea** las filas existentes con `puntoAcopioId` a la tabla puente antes de eliminar la columna.
- **(B) Asignación opcional (cero centros permitido).** Se descarta obligar al menos uno: hay actividades
  informativas (p. ej. el calendario que viene) y un `ADMIN` puede no tener puntos aún (024 ya lo
  contemplaba). La UI ordena por nombre y no preselecciona ninguno.
- **(B) Propiedad y actividad comprobadas por punto.** `validarPuntoAcopio` se generaliza a validar cada
  id del array (existe, activo, del `adminId` dueño). Ids repetidos en el input se **deduplican** en
  aplicación.
- **(C) Rediseño solo de presentación, sin tocar contratos.** Se descarta aprovechar el rediseño para
  cambiar datos, DTOs o casos de uso: reduce el riesgo de regresión y mantiene 006/023 verdes. Si el
  rediseño necesita un dato nuevo (p. ej. dirección del punto para "Dónde entregar"), ese dato lo aporta
  la Parte B por su lectura, no un cambio en aportes.
- **(C) La constitución manda sobre las skills.** Ante cualquier conflicto entre lo que sugiera una skill
  de diseño y `constitution/tech-stack.md`, gana la constitución (paleta, tipografías, hairlines,
  restricciones duras).

## Alcance

**Incluye**

- **Modelo Prisma (enmienda de 024):**
  - Nueva `model ActividadPuntoAcopio`: `id`, `actividadId` (FK a `Actividad`, `onDelete: Cascade`),
    `puntoAcopioId` (FK a `PuntoAcopio`, `onDelete: Cascade`), `@@unique([actividadId, puntoAcopioId])`,
    índices por cada FK. Relaciones inversas en `Actividad` (`puntosAcopio`) y `PuntoAcopio`
    (`actividades`).
  - Se **elimina** `Actividad.puntoAcopioId` y su relación/índice single.
  - **Migración** `actividad_multi_punto_acopio`: crea la tabla puente, **backfillea**
    (`INSERT ... SELECT id, puntoAcopioId FROM actividades WHERE puntoAcopioId IS NOT NULL`) y luego
    elimina la columna `puntoAcopioId` de `actividades`.
- **Dominio (`actividades/domain`)** puro:
  - `Actividad` deja de tener `puntoAcopioId: string | null` y pasa a `puntosAcopioIds: string[]`
    (y/o una lista de puntos ricos en las lecturas que lo necesiten). `NuevaActividad` y `CambiosActividad`
    reflejan `puntosAcopioIds: string[]`.
  - Regla pura de deduplicación/validación de forma del array (sin framework).
- **Aplicación (`actividades/application`):**
  - `crearActividad` y `editarCabecera` aceptan `puntosAcopioIds: string[]`; validan cada id (existe,
    activo, propio del dueño) y deduplican. `validarPuntoAcopio` se generaliza (o se añade
    `validarPuntosAcopio`).
  - `obtenerActividad` devuelve los puntos asignados (para el detalle y para el formulario de edición).
  - Nueva lectura (o extensión de la de crear/editar página) que expone la **red apta agrupada por
    categoría** para el formulario, reutilizando `afiliaciones` sin duplicar lógica de intersección.
- **Infraestructura:** `PrismaActividadRepository` mapea la relación puente en lectura/escritura (crear
  con `create` anidado o `createMany`, editar con reemplazo del set de puntos). `afiliaciones` expone el
  DTO recortado `MiembroRedApto` si aún no existe.
- **Presentación:**
  - `ActividadForm`: selector único de punto de acopio → **lista de checkboxes** de puntos activos
    propios (opcional). Botón **"+ info"** por meta que despliega en línea la lista de red apta de esa
    categoría.
  - `/panel/actividades/nueva` y `/panel/actividades/[id]/editar`: pasan `puntosAcopio` y la red apta
    agrupada por categoría al formulario; el server action mapea `puntosAcopioIds`.
  - `/actividades/[id]`: bloque "Dónde entregar" con los centros asignados; **rediseño (C)** de toda la
    página.
  - `/actividades/[id]/aportar` y `AporteForm`: **rediseño (C)**.
  - `ProgresoMetas` y `AportantesTabla`: pulido visual sin cambiar su contrato.
- **Tests (Vitest):**
  - `crearActividad`/`editarCabecera`: asignar varios puntos propios; rechazar punto ajeno o archivado
    dentro del array; deduplicar ids repetidos; permitir array vacío.
  - Backfill de la migración (a nivel de lógica del repositorio/mapeo, según patrón del proyecto).
  - Red apta agrupada: intersección de categorías correcta; el DTO no incluye contacto.
  - Regresión: 006/023 y las máquinas de estado de 024 siguen verdes.
- **DOC de cliente:** `DOC/features/026-actividad-red-centros-y-aporte.md`.
- **Roadmap:** mover 026 a "Hecho" al cerrar y anotar la enmienda a 024/025.

**No incluye**

- **Seleccionar o invitar colaboradores concretos** desde el formulario (la red sigue informativa, sin
  RSVP ni entidad de asignación de personas). Solo lectura.
- **Exponer teléfono/WhatsApp** de la red en el formulario de actividad (sigue exclusivo de `/panel/red`).
- **Exponer los puntos de acopio en la transparencia pública** (`/transparencia`); 024/009 intactas.
- **Restringir a qué actividad puede aportar un colaborador** según red o centro (aporte libre, 006/025).
- **Actividades sin recursos / calendario** y demás ítems de `new.features.md`: futuras, fuera de aquí.
- **Cambios de datos/contratos en aportes (006/023)**: la Parte C es solo presentación.

## Criterios de aceptación

- [ ] (A) Al elegir un recurso de una meta al crear/editar, junto al conteo aparece "+ info" que
      despliega en línea la lista de colaboradores aptos de esa categoría (nombre, categorías, badge de
      verificación); sin datos de contacto.
- [ ] (A) El conteo del encabezado sigue contando **solo verificados**; la lista incluye también no
      verificados, diferenciados por el badge.
- [ ] (A) Si nadie es apto para la categoría, no se ofrece "+ info" y se mantiene el texto de "nadie
      declaró poder aportar esto todavía".
- [ ] (B) Un `ADMIN` puede asignar **cero, uno o varios** de sus puntos de acopio activos a una actividad
      al crear y al editar la cabecera.
- [ ] (B) Asignar un punto **ajeno** o **archivado** se **rechaza en servidor** (no solo oculto en UI);
      los ids repetidos se deduplican.
- [ ] (B) El colaborador ve en `/actividades/[id]` los centros asignados (nombre + ubicación/horarios);
      si no hay ninguno, no se muestra el bloque.
- [ ] (B) La transparencia pública sigue **sin** mostrar puntos de acopio.
- [ ] (B) La **migración** crea `ActividadPuntoAcopio`, **backfillea** las actividades con
      `puntoAcopioId` previo y elimina la columna, sin pérdida de asignaciones existentes.
- [ ] (C) `/actividades/[id]` y `/actividades/[id]/aportar` se rediseñan con jerarquía editorial
      (heading serif, números `numeric-tnum`, identidad de marca ocre/teal) y **sin regresión funcional**:
      mismos flujos y mismos tests de 006/023 en verde.
- [ ] (C) El rediseño respeta las restricciones duras de la constitución: **sin em-dash/en-dash** en
      texto visible, `transition` con propiedades explícitas (no `all`), solo `transform`/`opacity`
      animados, `ease-out`/`--ease-out-emil`, `prefers-reduced-motion` respetado, iconos `lucide` con
      `strokeWidth={1.5}`, hairlines en vez de cards por defecto.
- [ ] `pnpm test` en verde (nuevos casos de A/B + regresión de 006/023/024).
- [ ] `pnpm exec eslint src` y `pnpm build` sin errores; `actividades/domain` y `actividades/application`
      permanecen **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Depende de 024, 025 y 011 ya implementadas.** El árbol confirma que las tres están en código
  (`Actividad`, `Afiliacion`, `PuntoAcopio`, `/panel/red`, `/panel/puntos-acopio`).
- **Riesgo de la migración (B):** eliminar `puntoAcopioId` es destructivo; ejecutar el backfill **antes**
  del `DROP COLUMN` en la misma migración y probar en desarrollo. Documentar el orden en la migración.
- **Riesgo de regresión en el rename de campo:** `puntoAcopioId` aparece en dominio, aplicación,
  infraestructura, `fakes.ts`, tests y UI (formulario, página de editar). Barrer todas las referencias
  antes de cerrar.
- **(C) La constitución manda sobre las skills de diseño.** Leer "Estilo visual" de
  `constitution/tech-stack.md` antes de tocar clases; no inventar colores ni radios.
- **Prohibido em-dash (`—`) / en-dash (`–`)** en textos visibles (constitución).
- **Next 16:** rutas y server components de actividad/aporte ya existen; revisar
  `node_modules/next/dist/docs/` antes de tocarlas (AGENTS.md).
