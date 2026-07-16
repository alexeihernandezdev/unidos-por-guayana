# 029 · Aportes anónimos (donación directa del admin y autoanonimato del colaborador)

> Estado: **En curso** · Enmienda: `006 · Aportes`, `014 · Donaciones monetarias externas`, `023 · Registro de aportantes` · Depende de: `006`, `022`, `023`, `024` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce el **anonimato del aportante** en dos vías, unificadas por un mismo concepto: un `Aporte` puede
ser **anónimo en las superficies compartidas** (el registro de aportantes autenticado de 023 y la
transparencia pública 009), mientras el **`ADMIN` dueño de la actividad** conserva la identidad y el
contacto para poder verificar la donación.

- **Donación directa registrada por el `ADMIN` (cualquier recurso).** Mucha gente dona a una actividad
  sin tener cuenta (le entregan insumos, transporte, dinero o trabajo directamente al organizador). El
  `ADMIN` dueño registra ese aporte **manualmente** desde el detalle de su actividad, contra cualquier
  recurso de sus metas. El aporte queda **sin colaborador** (`colaboradorId = null`), marcado como
  **anónimo**, imputado por el `ADMIN` (`registradoPorId`) y nace en `RECIBIDO` (la donación ya está en
  mano). Así suma al progreso de la meta sin que en los reportes parezca que el aporte lo hizo el propio
  administrador.
- **Colaborador registrado que se anonimiza.** Al aportar a una actividad, el `COLABORADOR` puede marcar
  una casilla **"Aportar de forma anónima"**. Su aporte se crea normal (`COMPROMETIDO`, con su
  `colaboradorId`), pero con la marca de anónimo: su **nombre no se muestra** en el registro de
  aportantes (023) ni en la transparencia (009). El `ADMIN` dueño **sí** ve su identidad en el panel,
  porque necesita contactarlo para verificar la donación.

Esta feature generaliza lo que la 014 dejó solo para dinero (`registrarAporteExterno`, recursos
`MONETARIO`) a **cualquier recurso** de las metas, mediante un caso de uso propio, y añade la marca de
anonimato que faltaba.

## Por qué

`mission.md` sitúa al colaborador y al aporte como el eje de la participación, y la 023 abrió el registro
de "quiénes han aportado" a los usuarios con sesión. Pero hoy faltan dos piezas que el cliente pidió:

1. **No toda donación viene de una cuenta.** Gente sin registrarse le entrega ayuda directa al
   organizador. Sin una forma de imputarla, o no se registra (y el progreso miente por lo bajo) o el
   `ADMIN` la carga a su propio nombre (y en los reportes parece que donó el administrador, lo cual
   distorsiona la transparencia). La donación directa **anónima** resuelve ambos: se contabiliza y no se
   atribuye a nadie que no corresponda.
2. **Aportar debe poder ser discreto.** Un colaborador puede querer ayudar sin que su nombre aparezca
   ante otros colaboradores o en la web pública. Pero el organizador necesita **saber quién es** para
   confirmar que la donación llegó. El anonimato "hacia afuera, identidad hacia el dueño" cubre las dos
   necesidades sin romper la verificación.

## Decisiones tomadas

- **Un solo concepto: `Aporte.esAnonimo`.** En vez de dos mecanismos separados, una sola bandera booleana
  gobierna la visibilidad del nombre en superficies compartidas. La donación directa del admin nace con
  `esAnonimo = true` (y sin colaborador); el colaborador que marca la casilla también. Un aporte normal
  es `esAnonimo = false`.
- **La anonimización se aplica en la LECTURA, no en la UI.** Igual que la 023 garantizó "solo el nombre,
  sin contacto" en el `select`, aquí la lectura de reconocimiento (`AportanteDeActividad`) devuelve
  `aportanteNombre = "Anónimo"` cuando el aporte es anónimo o no tiene colaborador. El nombre real
  **nunca sale** por esa consulta; un test debe fallar si se filtra.
- **Solo el `ADMIN` dueño ve la identidad real.** El panel del admin (aislado por dueño, feature 022)
  sigue mostrando nombre y correo del colaborador (privilegio del dueño, necesario para verificar).
  Ningún otro usuario con sesión (otros colaboradores, solicitantes, otros admins) ve el nombre de un
  aporte anónimo; solo ven "Anónimo".
- **El aporte anónimo se muestra como fila "Anónimo", no se oculta.** Conserva recurso, cantidad, estado y
  fecha, y suma a los totales; solo se sustituye el nombre. Así se mantiene la sensación de esfuerzo
  colectivo que motivó la 023.
- **Donación directa = caso de uso propio `registrarAporteDirecto`, no se toca `registrarAporteExterno`.**
  La 014 es específica de dinero (moneda, medio de donación, referencia, fecha de recepción elegida). La
  donación directa general reusa las validaciones de `crearAporte` (actividad en `RECOLECTANDO`, recurso
  en metas y activo, `cantidad > 0`) pero es ejecutada por el `ADMIN` **dueño** (regla de 022 que la 014
  no exige) y nace en `RECIBIDO`, anónima y sin colaborador. `registrarAporteExterno` queda intacto para
  el flujo monetario.
- **Nace en `RECIBIDO`.** La donación directa es ayuda ya recibida por el organizador; se marca recibida
  al registrarse y suma de inmediato al progreso. El `ADMIN` puede revertirla con el flujo normal de 006
  si se equivoca. La `nota` opcional permite al admin anotar una referencia interna del donante.
- **La transparencia pública (009) no cambia.** Ya es anónima (solo agregados por recurso/moneda, sin
  nombres). El anonimato no la afecta; solo protege el registro autenticado de 023.
- **Sin datos personales nuevos.** No se guarda identidad del donante directo (no la hay). El admin que la
  recibió la conoce fuera de la app; si quiere dejar rastro, usa la `nota`.

## Alcance

**Incluye**

- Modelo Prisma:
  - En `model Aporte`: nuevo campo `esAnonimo Boolean @default(false)`.
  - **Migración** `aporte_es_anonimo`. Backfill: los aportes con `colaboradorId = null` (ingresos
    monetarios anónimos de 014) pasan a `esAnonimo = true` por consistencia.
- Dominio (`src/modules/aportes/domain`) — puro:
  - `Aporte` gana `esAnonimo: boolean`; `NuevoAporte` gana `esAnonimo?: boolean`.
  - Regla pura `nombrePublicoAportante(esAnonimo, nombreColaborador)` que devuelve el nombre o la etiqueta
    `"Anónimo"`; constante `ETIQUETA_ANONIMO`.
- Aplicación (`src/modules/aportes/application`):
  - Nuevo caso de uso `registrarAporteDirecto(deps, input, actor)`: solo `ADMIN` **dueño** de la
    actividad; valida actividad en `RECOLECTANDO`, recurso en metas y activo, `cantidad > 0`; crea con
    `colaboradorId = null`, `esAnonimo = true`, `estado = RECIBIDO`, `registradoPorId = actor.id`,
    `nota?`.
  - `crearAporte`: acepta `esAnonimo?` y lo propaga.
- Infraestructura:
  - `PrismaAporteRepository.crear`: persiste `esAnonimo`; estampa `recibidoEn` cuando el aporte nace
    `RECIBIDO` sin fecha explícita (coherencia con el doble en memoria).
  - `listarAportantesDeActividad`: `select` incluye `esAnonimo`; el nombre se resuelve con
    `nombrePublicoAportante` (nunca el nombre real si es anónimo).
- Composición (`src/lib/aportes.ts` + `@/shared/aportes`): `registrarAporteDirectoServicio`.
- Presentación:
  - **Colaborador** (`AporteForm`): casilla "Aportar de forma anónima" con texto de ayuda ("Tu nombre no
    será visible para otros; el organizador sí lo verá para verificar tu aporte."). Se propaga por
    `crearAporteAction`.
  - **Admin** (detalle `/panel/actividades/[id]`, solo en `RECOLECTANDO`): componente `DonacionDirectaForm`
    (recurso de las metas, cantidad, nota) y server action `registrarAporteDirectoAction` con
    `requireAdminVerificado` + chequeo de dueño en el caso de uso.
  - **Registro de aportantes** (`AportantesTabla`, 023): muestra "Anónimo" vía el DTO (sin cambios de
    render necesarios).
  - **Panel del admin dueño** (`AportesTabla`): la donación directa (sin colaborador) se rotula
    "Donación directa"; un aporte de colaborador anónimo sigue mostrando su nombre + correo, con un
    indicador de que es anónimo hacia el público.
- Tests (Vitest):
  - `nombrePublicoAportante`: anónimo o sin colaborador devuelve "Anónimo"; normal devuelve el nombre.
  - Lectura de reconocimiento: un aporte anónimo devuelve "Anónimo" y **nunca** el nombre real; ordena por
    fecha desc.
  - `registrarAporteDirecto`: solo `ADMIN` dueño; nace `RECIBIDO`, `esAnonimo`, `colaboradorId = null`,
    `registradoPorId = admin`; rechaza no-dueño, no-admin, recurso fuera de metas, recurso archivado,
    actividad no `RECOLECTANDO`, `cantidad <= 0`.
  - `crearAporte` propaga `esAnonimo`.
- Arreglo de deuda: `registrarAporteExterno.test.ts` quedó desactualizado tras el rename de la 024
  (importa `@/modules/ayudas`, usa `ayudaId`/`progresoPorAyuda`); se actualiza a `actividades`/
  `actividadId`/`progresoPorActividad` para dejar el suite en verde.

**No incluye**

- **Ocultar el aporte anónimo de la lista** (se muestra como "Anónimo", decisión tomada).
- **Mostrar nombres en la transparencia pública** (009 sigue anónima).
- **Capturar identidad del donante directo** en la app (no la hay; el admin usa la `nota` si quiere).
- **Elegir la fecha de recepción** de la donación directa (nace con la fecha del registro; la 014 sí la
  pide para dinero, pero ese flujo no cambia).
- **Que el colaborador cambie el anonimato después** de crear el aporte (se decide al aportar; editarlo
  luego es mejora posterior).
- **Anonimato en el flujo monetario de 014** más allá de lo que ya hace (sigue permitiendo colaborador
  opcional).

## Criterios de aceptación

- [ ] El `Aporte` tiene `esAnonimo` (default `false`); la migración aplica y hace backfill de los aportes
      sin colaborador a `esAnonimo = true`.
- [ ] Un `ADMIN` **dueño** puede registrar una donación directa a su actividad en `RECOLECTANDO`, sobre un
      recurso de sus metas, con `cantidad > 0`. Nace `RECIBIDO`, `esAnonimo = true`, `colaboradorId = null`,
      `registradoPorId = admin`, y suma al progreso de la meta.
- [ ] El sistema **rechaza**: registrar donación directa si el actor no es `ADMIN`, si no es **dueño** de
      la actividad, si el recurso no está en las metas o está archivado, si la actividad no está en
      `RECOLECTANDO`, o si `cantidad <= 0`. Validado en servidor.
- [ ] Un `COLABORADOR` puede marcar su aporte como anónimo al crearlo; el aporte se guarda con
      `esAnonimo = true` y su `colaboradorId`.
- [ ] En el registro de aportantes de 023, un aporte anónimo (o sin colaborador) aparece como **"Anónimo"**;
      el nombre real **no** sale por el DTO/`select` (verificado en test, no solo en UI).
- [ ] El `ADMIN` **dueño** sigue viendo, en su panel, el **nombre y correo** del colaborador de un aporte
      anónimo (para verificar); la donación directa se muestra como "Donación directa".
- [ ] La **transparencia pública** (009) no muestra nombres (sin cambios).
- [ ] `pnpm test` cubre lo listado en verde, incluido el arreglo del test stale de 014.
- [ ] `pnpm lint` / `pnpm build` sin errores; `aportes/domain` y `aportes/application` permanecen **puras**
      (sin framework ni Prisma).

## Notas y riesgos

- **Privacidad como invariante:** la garantía "anónimo => nombre oculto" vive en la **lectura** de 023
  (`select` + `nombrePublicoAportante`), no en la UI. Un test debe fallar si el DTO expone el nombre real
  de un aporte anónimo.
- **Aislamiento por dueño (022):** `registrarAporteDirecto` exige `actividad.adminId === actor.id`. Es la
  diferencia clave con `registrarAporteExterno` (014), que no lo comprueba porque su flujo monetario es de
  "caja general".
- **Coherencia `recibidoEn`:** al nacer un aporte en `RECIBIDO` vía `crear`, la infraestructura estampa
  `recibidoEn` si no se pasó (hoy el doble en memoria lo hace y Prisma no; se alinea para no divergir).
- **Sin em-dash / en-dash** en textos visibles (constitución `tech-stack.md`).
- **Next 16:** el detalle `/panel/actividades/[id]` y `AporteForm` ya existen; leer
  `node_modules/next/dist/docs/` antes de tocar server actions/components (AGENTS.md). Reusar
  `requireAdminVerificado` y `requireRol` de 002/015.
- **Sin dependencias nuevas.** Zod, RHF, Prisma, Auth.js, Radix (`Checkbox`) ya están.
