# 025 · Afiliación a centros de acopio y categorías de aporte

> Estado: **Pendiente** · Enmienda: `002 · Autenticación y roles`, `017 · Datos de contacto
> obligatorios` · Depende de: `002`, `013 · Verificación de usuarios`, `016 · Perfil de administrador y
> centro de acopio`, `020 · Catálogo de ubicación`, `024 · Actividad: renombre y ciclo de vida por tipo`
> · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce la **afiliación**: el vínculo entre un `COLABORADOR` y un `ADMIN` (centro de acopio) al que
elige unirse, y la **declaración de categorías**: qué tipo de recurso (`SUMINISTRO`, `TRANSPORTE`,
`PERSONAL`, `MONETARIO`) ese colaborador podría aportar. Juntas forman "su red": cuando un `ADMIN` crea
una `Actividad` con metas, puede ver cuántas personas de su red son candidatas a aportar cada recurso, y
esas personas reciben el aviso correspondiente.

- **Categorías obligatorias en el registro.** Todo `COLABORADOR` nuevo elige, en un paso del registro,
  al menos una de las cuatro `CategoriaRecurso` que podría aportar. Es una capacidad de la persona (no
  cambia según el centro) y vive en su perfil.
- **Afiliación a centros, opcional y omitible en el registro.** El registro incluye un paso (tipo
  wizard/pasos) para elegir a qué `ADMIN` afiliarse, con opción de **omitir** y completarlo después desde
  `/mi-perfil`. Un colaborador puede afiliarse a **varios** centros a la vez.
- **Descubrir centros.** El paso de afiliación (en registro o en `/mi-perfil`) lista los `ADMIN`
  `VERIFICADO`, con su `nombreCuenta`/ubicación (`PerfilAdmin`), filtrable por estado/municipio del
  catálogo (020). Cada centro se puede **expandir** (collapse/dropdown) para ver sus `PuntoAcopio`
  activos antes de decidir.
- **Afiliación unilateral, removible por el admin.** Elegir un centro afilia de inmediato, sin
  aprobación. El `ADMIN` puede **remover** a un colaborador de su red (deja de contarlo/verlo); el
  colaborador removido puede **volver a afiliarse** cuando quiera (remover no bloquea).
- **Puramente informativa: no restringe aportes.** Cualquier `COLABORADOR` sigue pudiendo aportar a
  cualquier `Actividad`, esté o no afiliado a ese `ADMIN`. La afiliación solo alimenta visibilidad
  ("su red") y convocatoria (aviso dirigido), nunca un permiso de acceso.
- **"Mi red" del admin.** Nueva sección `/panel/red`: lista los `COLABORADOR` afiliados al `ADMIN`
  logueado, con nombre, categorías declaradas, estado de verificación, teléfono/WhatsApp y filtro por
  categoría. Acción de **remover** de la red.
- **Conteo previo al crear una Actividad.** Al elegir el `Recurso` de una meta en el formulario de crear
  Actividad, se muestra cuántos `COLABORADOR` **verificados** afiliados a ese `ADMIN` declararon la
  categoría del recurso (solo el número, sin listar personas).
- **Convocatoria automática al crear.** Al crear la Actividad con sus metas, se notifica a todos los
  afiliados **verificados** cuya categoría declarada coincide con la de al menos un recurso de la
  Actividad (implementación concreta del disparador `NUEVA_AYUDA`/`NUEVA_ACTIVIDAD` de la feature `012`,
  que nace ya con esta lógica de destinatarios en vez de "todos los verificados").
- **Responder es aportar.** No hay un RSVP separado (aceptar/rechazar convocatoria): la respuesta del
  colaborador a un aviso es registrar un `Aporte` (006), como ya funciona hoy.

## Por qué

El cliente pidió que, al crear una `Actividad`, el `ADMIN` pueda ver qué personas de "su red" están
aptas para aportar un recurso concreto. Hoy no existe el concepto de "red": cualquier `COLABORADOR`
verificado es un destinatario igual de válido para cualquier `ADMIN` (así lo especifica el disparador
`NUEVA_AYUDA` de `012`), y no hay forma de saber, sin preguntar uno por uno, quién podría aportar
transporte frente a quién podría aportar dinero. Esta feature cierra ese hueco con el mínimo de fricción
posible: el colaborador declara una vez qué categorías puede aportar (no recurso por recurso, que sería
tedioso y quedaría desactualizado cada vez que cambia el catálogo), y elige a qué centros quiere unirse
sin que eso le impida ayudar en cualquier otro lado.

## Decisiones tomadas

- **Ancla de la afiliación: el `ADMIN`, no el `PuntoAcopio`.** El colaborador se une a la organización
  (cuenta `ADMIN` con su `PerfilAdmin`), no a una ubicación física concreta. Encaja con que las
  `Actividad` ya pertenecen a un `ADMIN` (022): "su red" = colaboradores afiliados a ese `ADMIN`. Los
  puntos de acopio (011) son solo logística y pueden archivarse sin romper afiliaciones.
- **Granularidad por categoría, no por recurso.** Se usa el `enum CategoriaRecurso` ya existente
  (`SUMINISTRO`, `TRANSPORTE`, `PERSONAL`, `MONETARIO`). Registro rápido (checkboxes), sin mantenimiento
  cuando el catálogo de recursos crece o se archivan/proponen recursos nuevos (019). El filtro del admin
  cruza la categoría del recurso de la meta con las categorías declaradas, no el recurso exacto.
- **Categorías globales del colaborador, no por afiliación.** Lo que alguien puede aportar es una
  capacidad de la persona; no varía según el centro. Se descarta una matriz centro × categoría en el
  registro (justo la fricción que se quería evitar).
- **Categorías obligatorias, afiliación a centros opcional.** Las cuatro categorías son un paso de bajo
  costo cognitivo y se exigen para que toda la base quede clasificada desde el alta. Elegir centros
  concretos requiere conocerlos, así que se puede **omitir** en el registro y completarse luego desde
  `/mi-perfil` (patrón wizard con paso saltable, similar en espíritu al guard de `/completar-perfil` de
  `017`, pero sin bloquear: aquí el paso se salta, no se pospone con guard).
- **Backfill vía seeder, no vía guard.** Los colaboradores ya sembrados (`prisma/seed.ts`) reciben
  categorías de ejemplo directamente en el seed. No se introduce un guard de servidor nuevo para forzar a
  los colaboradores existentes a completar categorías retroactivamente (a diferencia de `017`); se asume
  base de desarrollo/demo pequeña y controlada.
- **Afiliación unilateral con remoción por el admin, sin bloqueo permanente.** Sin máquina de estados de
  aprobación: afiliarse no otorga ningún permiso nuevo (aportar ya es libre para cualquiera), solo
  visibilidad, así que el riesgo de auto-unirse es bajo. El `ADMIN` puede remover a alguien de su red
  (deja de aparecer/contar), pero remover **no** es un veto: el colaborador puede volver a afiliarse
  cuando quiera. Se descarta un estado `REMOVIDA` que bloquee re-afiliación por mantener el modelo simple
  y porque el caso de conflicto real (que sí ameritaría bloqueo) no se ha presentado.
- **Solo informativa, nunca restrictiva.** La afiliación no controla a qué `Actividad` puede aportar un
  colaborador. Restringir aportes por red rompería el espíritu de ayuda humanitaria (rechazar un aporte
  por "no ser de la red" sería contraproducente) y enmendaría 006 con un guard nuevo; se descarta.
- **Multi-afiliación.** Un colaborador puede afiliarse a varios `ADMIN` a la vez (tabla puente, sin
  restricción de cardinalidad). Coherente con que aportar ya no está limitado a un solo admin.
- **Sin RSVP.** Se descarta una entidad de "convocatoria con respuesta" separada del aporte: `PERSONAL`
  ya es una categoría de recurso y un `Aporte` de "2 voluntarios" cubre el caso de asistencia. Menos
  modelo, menos estados, sin limbo de "dijo que sí pero nunca aportó".
- **Conteo previo solo cuenta verificados.** El número que ve el admin al elegir un recurso refleja
  quiénes realmente podrían ser notificados y aportar (coherente con que `012` solo notifica a
  verificados). Contar también no-verificados infllaría el número con cuentas que aún no operan.
- **Datos visibles en `/panel/red` incluyen contacto.** El propósito explícito es que el admin pueda
  convocar; sin teléfono/WhatsApp no puede contactar a nadie fuera del aviso in-app. Coherente con que
  `017` ya hizo `telefono`/`telefonoEsWhatsApp` obligatorios para `COLABORADOR`.
- **Descubrimiento de centros con drill-down a sus puntos.** Además de filtrar por ubicación, cada centro
  en la lista se puede expandir para ver sus `PuntoAcopio` activos (nombre, referencia), para que el
  colaborador decida con contexto real de dónde está la operación, no solo el nombre de la cuenta.
- **Secuenciación con `012 · Notificaciones`.** `012` todavía no está implementada; en vez de
  implementarla con destinatario "todos los verificados" y enmendarla después, se implementa **esta**
  feature primero (o junto) para que `012` nazca ya con el destinatario correcto ("red apta del admin
  dueño"). Se actualiza el disparador `NUEVA_AYUDA`/`NUEVA_ACTIVIDAD` en la spec de `012` para reflejarlo
  antes de que se construya.

## Alcance

**Incluye**

- Modelo Prisma:
  - `model Afiliacion`: `id`, `colaboradorId` (FK a `Usuario`, rol `COLABORADOR`), `adminId` (FK a
    `Usuario`, rol `ADMIN`), `createdAt`. `@@unique([colaboradorId, adminId])` para no duplicar el
    vínculo; sin campo de estado (existir la fila = afiliado; remover = borrar la fila, dado que
    re-afiliarse está permitido sin fricción).
  - Categorías declaradas del colaborador: `Usuario` gana `categoriasAporte CategoriaRecurso[]`
    (array del enum ya existente) o una tabla puente `UsuarioCategoriaRecurso` si el driver/versión de
    Prisma no soporta bien arrays nativos en Postgres con las migraciones del proyecto (decisión técnica
    concreta en `plan.md`); mínimo una categoría no vacía para `COLABORADOR`.
  - Relaciones inversas en `Usuario` (`afiliaciones` como colaborador, `red` como admin).
  - **Migración** correspondiente, con backfill de `categoriasAporte` para colaboradores existentes vía
    `prisma/seed.ts` (no vía guard de servidor).
- Dominio (`afiliaciones/domain`, o dentro de `usuarios/domain` si el módulo de usuarios ya existe como
  tal; a decidir en `plan.md`) — puro:
  - Entidad `Afiliacion`, reglas puras: unicidad del vínculo, `perteneceA` (propiedad para remover),
    intersección de categorías (colaborador vs. categorías de los recursos de una Actividad).
  - Contrato `AfiliacionRepository`: `afiliar`, `remover` (comprobando propiedad del `ADMIN`),
    `listarPorColaborador`, `listarRedDeAdmin(adminId, filtroCategoria?)`,
    `contarAptosPorCategoria(adminId, categoria)`.
- Aplicación:
  - `afiliarseACentro(deps, colaboradorId, adminId)`, `removerDeRed(deps, adminId, colaboradorId)`
    (verifica propiedad), `listarCentrosDisponibles(deps, filtroUbicacion?)` (admins `VERIFICADO` con su
    `PerfilAdmin` y sus `PuntoAcopio` activos para el drill-down), `listarMiRed(deps, adminId,
    filtroCategoria?)`, `contarAptosPorRecurso(deps, adminId, recursoId)` (resuelve la categoría del
    recurso y cuenta afiliados verificados con esa categoría).
  - `declararCategorias(deps, colaboradorId, categorias)`: valida no vacío, persiste.
  - Errores: `NoAutorizadoError` (remover de una red ajena), `CategoriasVaciasError`.
- Integración con `012 · Notificaciones` (cuando se implemente): el destinatario del disparador
  `NUEVA_AYUDA`/`NUEVA_ACTIVIDAD` deja de ser "todos los `COLABORADOR` verificados" y pasa a ser "los
  `COLABORADOR` verificados afiliados al `adminId` dueño cuyas categorías intersectan las categorías de
  los recursos de la Actividad". Este cambio se documenta también como actualización de la spec de `012`
  antes de implementarla.
- Presentación:
  - Registro de `COLABORADOR`: paso de categorías (obligatorio, checkboxes de las 4) y paso de
    afiliación a centros (opcional, con **Omitir**), en un flujo tipo wizard/steps.
  - `/mi-perfil`: edición de categorías declaradas y gestión de afiliaciones (unirse a más centros, ver
    las actuales).
  - `/panel/red` (nueva, área `ADMIN`): listado de la red del admin (nombre, categorías, estado de
    verificación, teléfono/WhatsApp), filtro por categoría, acción remover.
  - Formulario de crear/editar Actividad (024): al elegir el recurso de una meta, mostrar el conteo de
    afiliados aptos (solo número).
  - Selector de centros: lista de `ADMIN` verificados con filtro por estado/municipio (020) y expandible
    (collapse) por centro para ver sus `PuntoAcopio` activos.
- Tests (Vitest): unicidad de afiliación, remover + re-afiliar, propiedad al remover (un admin no remueve
  de la red de otro), intersección de categorías, conteo de aptos (solo verificados), validación de
  categorías no vacías.

**No incluye**

- **Restringir a qué Actividad puede aportar un colaborador.** Sigue siendo libre, esté o no afiliado
  (ver decisiones).
- **Aprobación de afiliación por el admin.** Es unilateral; no hay bandeja ni estado `PENDIENTE` de
  afiliación.
- **RSVP o convocatoria como entidad separada del aporte.**
- **Categoría por recurso específico** ni cantidad/disponibilidad declarada por el colaborador: solo las
  4 categorías, sin matices.
- **Guard de servidor tipo `/completar-perfil`** para forzar categorías a colaboradores existentes: se
  resuelve con el seeder.
- **Exponer la red o las categorías en `/transparencia`** (tablero público): esto es información de
  gestión del admin, no de transparencia pública.

## Criterios de aceptación

- [ ] Un `COLABORADOR` nuevo debe elegir **al menos una** categoría (`SUMINISTRO`/`TRANSPORTE`/
      `PERSONAL`/`MONETARIO`) para completar el registro; el sistema **rechaza** guardar sin ninguna.
- [ ] El paso de afiliación a centros en el registro se puede **omitir**; el colaborador queda registrado
      sin afiliaciones y puede completarlas después desde `/mi-perfil`.
- [ ] El colaborador puede afiliarse a **varios** `ADMIN` verificados a la vez; el listado de centros es
      filtrable por estado/municipio y cada centro se puede **expandir** para ver sus `PuntoAcopio`
      activos.
- [ ] Afiliarse a un centro es **inmediato** (sin aprobación del admin).
- [ ] Un `ADMIN` puede **remover** a un colaborador de su red desde `/panel/red`; tras removerlo, ese
      colaborador **puede volver a afiliarse** sin restricción.
- [ ] Un colaborador **no afiliado** a un `ADMIN` puede seguir aportando con normalidad a las Actividades
      de ese `ADMIN` (la afiliación no bloquea aportes).
- [ ] `/panel/red` lista, para el `ADMIN` logueado, solo a **sus** afiliados (nombre, categorías, estado
      de verificación, teléfono/WhatsApp), filtrable por categoría; un `ADMIN` no ve la red de otro.
- [ ] Al elegir un `Recurso` para una meta en el formulario de crear/editar Actividad, se muestra el
      **conteo** de `COLABORADOR` verificados de la red del admin cuya categoría declarada coincide con
      la categoría de ese recurso (solo el número).
- [ ] Al crear una Actividad con metas, se dispara el aviso `NUEVA_AYUDA`/`NUEVA_ACTIVIDAD` (`012`) **solo**
      a los afiliados verificados cuya categoría coincide con alguna de las metas (no a toda la base de
      verificados).
- [ ] La **migración** crea `Afiliacion` (o equivalente) y las categorías del colaborador sin errores; los
      colaboradores sembrados por `prisma/seed.ts` quedan con categorías de ejemplo.
- [ ] `pnpm test` cubre unicidad de afiliación, remover/re-afiliar, propiedad al remover, intersección de
      categorías y conteo de aptos, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; las capas de dominio/aplicación permanecen **puras**.

## Notas y riesgos

- **Depende de `024`:** esta feature debe construirse sobre el modelo ya renombrado (`Actividad`) para no
  heredar el nombre `Ayuda` en el código nuevo.
- **Depende de `013 · Verificación de usuarios`:** el conteo y la convocatoria filtran por
  `estadoVerificacion = VERIFICADO`; si `013` aún no está implementada al construir esta feature,
  usar el campo ya existente en `Usuario` (nace `PENDIENTE` desde 002) y dejar la gestión de aprobación
  para cuando `013` se implemente.
- **`012` se implementa después (o junto), ya con la lógica correcta.** No hace falta "enmendar" `012` una
  vez construida: se actualiza su spec **antes** de que nazca su implementación, de modo que el
  disparador `NUEVA_AYUDA`/`NUEVA_ACTIVIDAD` use `Afiliacion` desde el primer día.
- **Arrays de enum en Postgres vs. tabla puente:** Prisma soporta `CategoriaRecurso[]` sobre Postgres,
  pero conviene confirmar en `plan.md` si el proyecto prefiere una tabla puente
  (`UsuarioCategoriaRecurso`) por consistencia con el resto del esquema (todas las relaciones N a N del
  proyecto hoy son tablas puente explícitas: `MetaRecurso`, `RecursoSolicitud`). Si se opta por tabla
  puente, ajustar el criterio de "al menos una" a nivel de aplicación (no lo garantiza una FK sola).
- **`/panel/red` con datos de contacto:** aplicar el mismo cuidado de propiedad que 011 (un admin solo ve
  su propia red) para no filtrar teléfonos de colaboradores fuera de su red.
- **Coherencia con 023:** el registro de aportantes (023) sigue mostrando solo nombre, sin cambios; la
  exposición de contacto de esta feature es exclusiva de `/panel/red`, no se filtra a otras superficies.
- **Prohibido em-dash (`—`) / en-dash (`–`)** en textos visibles (ver `constitution/tech-stack.md`).
- **Next 16:** el wizard de registro y `/panel/red` son superficies nuevas; revisar
  `node_modules/next/dist/docs/` antes de codificar (AGENTS.md).
