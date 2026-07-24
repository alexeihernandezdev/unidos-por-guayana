# 012 · Notificaciones

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles`, `017 · Datos de contacto obligatorios`, `024 · Actividad: renombre y ciclo de vida por tipo`, `025 · Afiliación a centros de acopio y categorías de aporte` · Roadmap: `constitution/roadmap.md`

> **Historial de esta spec.**
> - Versión original: notificaciones **solo in-app** (campana + bandeja), con los canales externos
>   explícitamente fuera de alcance.
> - Actualización post-025: el disparador `NUEVA_AYUDA` pasó de "todos los colaboradores verificados"
>   a la **red apta** del `ADMIN` dueño.
> - **Esta versión (jul 2026):** se añade un **segundo canal de entrega: WhatsApp** (Meta Cloud API),
>   diseñado como adaptador **plug-n-play** del mismo `NotificadorPort`; se alinea el nombre de la
>   entidad a **Actividad** (024, antes `Ayuda`) y el tipo a `NUEVA_ACTIVIDAD`; y se añade, como
>   prerrequisito del envío por WhatsApp, la **captura de teléfono con selector de país y almacenamiento
>   en formato E.164**. El canal in-app se conserva íntegro.

## Qué hace

Introduce la **Notificación**: un aviso dirigido a un `Usuario` que le informa de un hecho relevante
del sistema sin que tenga que estar mirando el panel. Es el canal que conecta lo que ocurre en las
Actividades con las personas que pueden actuar: cuando nace una actividad que necesita recursos, la
**red apta** del admin se entera; cuando una meta se cumple, quienes participan lo saben.

La entrega ocurre por **dos canales complementarios**:

1. **In-app** (siempre activo): una **campana** con contador de no leídas y una **bandeja**
   (`/notificaciones`) donde el usuario ve sus avisos, abre el elemento relacionado y **marca como
   leído**.
2. **WhatsApp** (opcional, plug-n-play): el mismo aviso se envía por WhatsApp a los destinatarios que
   tengan un teléfono marcado como WhatsApp. Es un **adaptador enchufable**: mientras Meta no esté
   configurado (faltan las variables de entorno), el canal es **no-op silencioso** y el in-app funciona
   igual. Al colocar las credenciales y aprobar las plantillas en Meta, "se enciende" solo.

- **Generación automática** — las notificaciones **no se crean a mano**. Las dispara la capa de
  aplicación de otras features cuando ocurre el hecho (crear una Actividad, cumplir una meta). Ver
  "Disparadores".
- **Bandeja y campana (`in-app`)** — todo usuario autenticado tiene una campana en la cabecera con el
  **número de no leídas** y una bandeja que lista sus avisos, del más reciente al más antiguo, con su
  `tipo`, `mensaje`, fecha y un enlace a la `referencia` (la Actividad).
- **Envío por WhatsApp** — el mismo evento, además del in-app, intenta un mensaje de WhatsApp a los
  destinatarios con teléfono WhatsApp. Best-effort: si falla o no está configurado, no rompe nada.
- **Marcar como leída** — el usuario marca un aviso in-app como leído (individual) o **todos como
  leídos** de una vez. El contador de no leídas baja en consecuencia.
- **Referencia navegable** — cada notificación in-app apunta a la entidad que la originó (la Actividad),
  de modo que al abrirla el usuario llega directo al detalle relacionado.

## Por qué

`mission.md` lista **Notificaciones** entre los módulos de apoyo: "avisan a los colaboradores de una
nueva actividad que necesita recursos o cuando se cumple una meta". Sin este canal, un colaborador solo
se entera de que hay una actividad a la que aportar si entra al panel por su cuenta; el sistema queda
pasivo. La notificación **acerca la acción al momento oportuno** y sostiene el principio de priorizar la
urgencia: cuando algo necesita recursos, la gente que puede darlos lo sabe.

El canal **WhatsApp** refuerza ese principio en el contexto real del proyecto: WhatsApp es el canal de
mensajería dominante en Venezuela y llega a la persona sin que tenga que abrir la app. Se suma **sin
sacrificar** la robustez del in-app (que no depende de terceros) ni la simplicidad: es un adaptador que
se activa por configuración, no una reescritura.

## Decisiones tomadas

- **Dos canales sobre un mismo puerto.** El `NotificadorPort` sigue siendo el **único contrato** que
  invocan las features de origen (024 crear Actividad, 006 marcar recibido). Detrás del puerto hay un
  **notificador compuesto** que entrega por in-app y por WhatsApp. Añadir o quitar un canal no toca a
  las features de origen.
- **WhatsApp es plug-n-play (env-gated, no-op sin config).** El adaptador de WhatsApp detecta si faltan
  las credenciales de Meta y, en ese caso, no hace nada (igual que el `SupabaseStorageAdapter` degrada
  cuando falta su config). No hay que tocar código para activarlo: se ponen las variables de entorno y
  se aprueban las plantillas en Meta.
- **Best-effort inline, sin outbox ni reintentos.** El envío de WhatsApp se intenta en el momento, en
  paralelo sobre los destinatarios (`Promise.allSettled`). Cada fallo se registra en log y se continúa;
  **nunca** revierte la Actividad ni el aporte, ni bloquea el in-app. No se persiste el estado de envío
  de WhatsApp (no hay tabla nueva para ello) y **no** hay cola, job runner ni reintento automático.
- **Los canales son independientes.** Un fallo en WhatsApp no impide el in-app y viceversa. El in-app es
  el canal de verdad y auditable; WhatsApp es un empujón adicional.
- **El dominio no se acopla a la infraestructura de avisos.** Las features que disparan avisos (024,
  006) **no** conocen el módulo de notificaciones, ni la base de datos, ni la API de Meta. Dependen de
  un **puerto** (`NotificadorPort`) definido como contrato; las implementaciones concretas (persistir la
  `Notificacion`, llamar a Meta) viven en la infraestructura de este módulo y se inyectan por
  composición.
- **Generación automática, nunca manual.** No hay caso de uso "crear notificación" expuesto al usuario;
  las notificaciones son un **efecto** de otros casos de uso. El único punto que las **emite** es el
  notificador, que 024/006 invocan a través del puerto.
- **Modelo de lectura binario (`leida` boolean) solo para in-app.** Una notificación está **no leída** o
  **leída**. El contador de la campana = número de notificaciones del usuario con `leida = false`.
  WhatsApp no tiene "leído" propio en este alcance.
- **Idempotencia por disparador.** Cada notificación lleva una **clave de deduplicación**
  (`tipo` + `referencia` + destinatario) con `@@unique([usuarioId, claveDedupe])`. "Meta cumplida" se
  emite **una sola vez** por meta (al cruzar el umbral). La deduplicación gobierna el in-app; el envío de
  WhatsApp se hace solo para los destinatarios recién creados en esa emisión (no se reenvía a quien ya
  tenía la notificación).
- **Destinatarios acotados (red apta), sin fan-out masivo.** Al crear una Actividad con metas se notifica
  a la **red apta** del `ADMIN` dueño (colaboradores `VERIFICADO` afiliados a ese admin cuya categoría
  declarada intersecta la categoría de al menos un recurso de las metas, feature 025). Al cumplirse una
  meta se notifica al `ADMIN` dueño y a los colaboradores que **aportaron** a esa meta. No se notifica a
  `SOLICITANTE` en este alcance.
- **Destinatarios de WhatsApp = subconjunto con teléfono WhatsApp.** De los destinatarios in-app de un
  evento, se envía WhatsApp solo a los que tienen `telefonoEsWhatsApp = true` y un `telefono` no vacío.
  Los demás reciben solo in-app.
- **Teléfono en E.164 con selector de país.** Como prerrequisito del envío por WhatsApp, la captura de
  teléfono gana un **selector de país + código** y el número se **normaliza y guarda en E.164**
  (`+58XXXXXXXXXX`) en la base. La lista de países es **curada** (Venezuela por defecto + diáspora:
  EE.UU., España, Colombia, Chile, Perú, Argentina, Panamá, México, Brasil, Ecuador). Venezuela conserva
  la validación estricta de código de operadora; el resto valida por longitud E.164 (7 a 15 dígitos).
  **Sin dependencias nuevas** (validación y lista hechas a mano).
- **Plantillas de WhatsApp por configuración.** Meta exige plantillas pre-aprobadas para mensajes
  iniciados por el negocio. El adaptador invoca las plantillas **por nombre** (leído de env) con
  variables posicionales. Si la plantilla de un tipo no está configurada, ese tipo simplemente no se
  envía por WhatsApp (el otro sí). Los textos exactos a crear en Meta se documentan en
  `DOC/features/012-notificaciones.md`.
- **Tipos cerrados (`enum TipoNotificacion`).** Conjunto acotado (`NUEVA_ACTIVIDAD`, `META_CUMPLIDA`). El
  `mensaje` in-app es texto compuesto al emitir; el `tipo` clasifica y elige plantilla/icono.
- **Sin tiempo real ni preferencias por usuario.** El contador se refresca al navegar (server components
  + `revalidate`). No hay silenciar tipos ni digest. Streaming en vivo se deja como futuro.
- **Módulo `src/modules/notificaciones/`** con las cuatro capas (Clean + Screaming). El `NotificadorPort`
  vive en su `domain` para que otras features lo importen como contrato sin acoplarse a la
  implementación.

## Disparadores

Los dos disparadores del alcance. Cada uno se invoca desde el caso de uso de la feature de origen a
través del `NotificadorPort`, después de que la operación de negocio haya tenido éxito. Ambos canales
(in-app y WhatsApp) se resuelven a partir del mismo conjunto de destinatarios.

| Disparador | Origen | Se dispara cuando | Destinatarios in-app | Destinatarios WhatsApp | `tipo` |
| --- | --- | --- | --- | --- | --- |
| Nueva Actividad que necesita recursos | 024 (`crearActividad`) | El `ADMIN` crea una Actividad con metas | Red apta del `ADMIN` dueño (025) | Los anteriores con `telefonoEsWhatsApp` | `NUEVA_ACTIVIDAD` |
| Meta de recurso cumplida | 006 (al marcar `RECIBIDO`) | El progreso de una `MetaRecurso` cruza el 100% por primera vez | `ADMIN` dueño + colaboradores que aportaron a esa meta | Los anteriores con `telefonoEsWhatsApp` | `META_CUMPLIDA` |

- **Nueva Actividad (`NUEVA_ACTIVIDAD`)** — `referencia` = la Actividad; `mensaje` in-app del estilo
  "Nueva actividad en {sectorDestino} necesita recursos". Se emite una sola vez, al crearla. Si la
  Actividad nace sin metas, no se notifica (no hay recursos que pedir). Los destinatarios se resuelven
  con la **red apta** (`AfiliacionRepository.listarDestinatarios(adminId, categoriasDeLasMetas)`).
- **Meta cumplida (`META_CUMPLIDA`)** — `referencia` = la Actividad (con el recurso en el `mensaje`,
  p. ej. "Meta de agua cumplida en la actividad de {sectorDestino}"). El cruce del 100% se evalúa al
  confirmar un aporte `RECIBIDO` (006): si con ese aporte el progreso de la meta pasa de `< 100%` a
  `>= 100%`, se emite; en aportes posteriores que ya estaban al 100% no se repite (idempotencia por
  meta).

> Los disparadores viven en la **capa de aplicación de 024 y 006**, que invocan el puerto. Este módulo
> no observa la base de datos ni "escucha" eventos: recibe llamadas explícitas del emisor.

## Alcance

**Incluye**

### Teléfono en E.164 con selector de país (prerrequisito)

- Dominio (`usuarios/domain/datosContacto.ts`, puro):
  - Lista curada `PAISES_TELEFONO`: `{ iso, nombre, dialCode }` para Venezuela (default) + EE.UU.,
    España, Colombia, Chile, Perú, Argentina, Panamá, México, Brasil, Ecuador.
  - `validarTelefono(entrada, isoPais)` devuelve **E.164** (`+<dialCode><numeroNacional>`): para
    Venezuela acepta `0XXXXXXXXXX` (o local) y valida operadora (`CODIGOS_OPERADORA_VENEZUELA`); para el
    resto valida largo E.164 (7 a 15 dígitos tras el código de país) y compone `+<dialCode>...`.
  - `paisDeTelefonoE164(telefono)`: helper puro que deduce el `iso` del país desde el prefijo E.164
    (para reconstruir el selector al editar, sin columna nueva).
  - Se conserva la compatibilidad de la firma para no romper a los consumidores existentes: la
    validación de datos de contacto (`validarDatosContacto`) pasa a recibir también el país del teléfono.
- UI compartida:
  - Componente `TelefonoField` (en `usuarios/ui` o `shared/ui` según encaje): **select de país**
    (nombre + código de marcación) + input de número, controlado, con mensaje de error. Reemplaza el
    input plano de teléfono en `DatosContactoFields` (registro colaborador/solicitante, `/completar-perfil`,
    `/mi-perfil`) y en `PerfilAdminForm` (registro admin y `/panel/perfil`).
  - Al editar, el país se preselecciona derivándolo del E.164 guardado (`paisDeTelefonoE164`).
- Persistencia: `Usuario.telefono` y `PerfilAdmin.telefono` guardan E.164. **No** requieren columnas
  nuevas (el país se deriva del prefijo).
- **Migración de datos**: backfill de los `telefono` existentes de nacional venezolano `0XXXXXXXXXX` a
  E.164 `+58XXXXXXXXX` (quitar el `0` inicial, anteponer `+58`). Aplica a `Usuario` y `PerfilAdmin`.
- Fuera de este bloque: el `telefono` de `PuntoAcopio` (dato de contacto público del centro, no receptor
  de WhatsApp aquí) **no** cambia en esta feature.

### Notificaciones (in-app + WhatsApp)

- Modelo Prisma:
  - `enum TipoNotificacion { NUEVA_ACTIVIDAD META_CUMPLIDA }`.
  - `model Notificacion`: `id`, relación a `Usuario` destinatario (`usuarioId`, cascade al borrar el
    usuario), `tipo` (`TipoNotificacion`), `mensaje` (`String`), `referenciaTipo` (`String`, p. ej.
    `"ACTIVIDAD"`) y `referenciaId` (`String`), `leida` (`Boolean @default(false)`), `claveDedupe`
    (`String`), `createdAt`. Índices `@@index([usuarioId, leida])` y `@@unique([usuarioId, claveDedupe])`.
  - Relación inversa `notificaciones` en `Usuario`.
  - **Migración** correspondiente (tabla `notificaciones` + enum).
  - **No** hay tabla para el estado de envío de WhatsApp (best-effort inline).
- Dominio (`notificaciones/domain`) — puro:
  - Entidad `Notificacion`, enum `TipoNotificacion`, tipo `NuevaNotificacion`.
  - **Puerto `NotificadorPort`** (contrato que 024/006 importan): `emitir(evento)`, con
    `EventoNotificacion` como unión por `tipo` (`NuevaActividadEvento`, `MetaCumplidaEvento`) que
    describe la `referencia`, la regla para resolver destinatarios y los datos para componer el mensaje.
  - **Puerto `CanalWhatsApp`** (contrato del adaptador): `enviarPlantilla(destino, tipo, variables)` o
    equivalente; lo implementa la infraestructura.
  - Reglas puras: `componerMensaje(evento)` (texto in-app por `tipo`, sin em-dash/en-dash),
    `variablesPlantilla(evento)` (variables posicionales para la plantilla de WhatsApp),
    `claveDedupe(tipo, referenciaTipo, referenciaId)`, y `contarNoLeidas(notificaciones)`.
  - Contrato `NotificacionRepository`: `crearMuchas`, `listarPorUsuario(usuarioId, filtro?)`,
    `contarNoLeidas(usuarioId)`, `marcarLeida(id, usuarioId)`, `marcarTodasLeidas(usuarioId)`,
    `existePorClave(usuarioId, claveDedupe)`.
- Aplicación (`notificaciones/application`) — pura:
  - `emitirNotificacion(deps, evento)`: **resuelve destinatarios una sola vez con su contacto**
    (`{ usuarioId, telefono, telefonoEsWhatsApp }`), compone `mensaje` y `claveDedupe`, **deduplica**
    (crea solo los que aún no tienen la clave) y persiste in-app vía repositorio; luego delega en el
    canal WhatsApp el subconjunto con `telefonoEsWhatsApp`. Es la implementación del `NotificadorPort`.
  - `listarNotificaciones(deps, usuarioId, filtro?)`, `contarNoLeidas(deps, usuarioId)`,
    `marcarLeida(deps, id, usuarioId)`, `marcarTodasLeidas(deps, usuarioId)`.
  - Errores: `NotificacionNoEncontradaError`, `NoAutorizadoError` (un usuario solo marca las suyas).
- Integración con features existentes (mínima, sin duplicar lógica):
  - 024 `crearActividad` invoca `NotificadorPort.emitir({ tipo: NUEVA_ACTIVIDAD, ... })` tras crear la
    Actividad con metas.
  - 006 (al marcar `RECIBIDO`) evalúa el cruce del 100% de la meta y, si aplica, invoca
    `NotificadorPort.emitir({ tipo: META_CUMPLIDA, ... })`.
  - Resolución de "red apta" con `AfiliacionRepository` (025); "colaboradores que aportaron a la meta"
    con el `AporteRepository` (006); contacto de los destinatarios vía `UsuarioRepository` (002). Se
    inyectan por composición.
- Infraestructura (`notificaciones/infrastructure`):
  - `PrismaNotificacionRepository` sobre `@/lib/prisma` (`createMany` con `skipDuplicates`, `count`
    filtrado por `leida = false`, `updateMany` idempotente para marcar leídas).
  - **`WhatsAppCloudAdapter`** (implementa `CanalWhatsApp`): `fetch` a la Graph API de Meta
    (`https://graph.facebook.com/<version>/<phoneNumberId>/messages`) con `messaging_product: whatsapp`,
    `type: template`. **Env-gated**: si faltan `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`, es
    no-op. Selecciona la plantilla por `tipo` desde env; si no hay plantilla para ese tipo, omite.
- Presentación (`notificaciones/ui` + `src/app`):
  - **Campana** en la cabecera del área autenticada (`AppShell`): icono `Bell` (lucide,
    `strokeWidth={1.5}`) con **badge de no leídas**; al abrir, un popover con las últimas notificaciones
    y enlace a la bandeja.
  - **Bandeja** `/notificaciones`: lista acotada de los avisos del usuario, con `tipo`, `mensaje`, fecha
    (Luxon, `es-VE`, `DD/MM/AAAA`), estado leída/no leída y enlace a la `referencia`. Acciones **marcar
    leída** y **marcar todas como leídas**.
  - Server actions con `zod`, sesión requerida (002) y `revalidatePath`.
- Composición (`@/lib/notificaciones.ts` + fachada `@/shared/notificaciones`): compone
  `PrismaNotificacionRepository` + `WhatsAppCloudAdapter` + repos de 002/025/006 y expone el
  `NotificadorPort`; se inyecta en `@/lib/actividades.ts` y `@/lib/aportes.ts`.
- Env nuevas (a `.env.example`): `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_API_VERSION` (default `v21.0`), `WHATSAPP_LANG` (default `es`),
  `WHATSAPP_TEMPLATE_NUEVA_ACTIVIDAD`, `WHATSAPP_TEMPLATE_META_CUMPLIDA`.
- Tests (Vitest): ver "Criterios de aceptación".

**No incluye**

- **Correo, SMS ni Web Push.** Los otros canales externos quedan como futuro; se añadirían como nuevas
  implementaciones detrás del `NotificadorPort`.
- **Persistencia/auditoría del envío de WhatsApp, reintentos, cola o job runner.** Best-effort inline.
- **Estado "leído" en WhatsApp**, webhooks de recepción/entrega de Meta, ni respuestas entrantes.
- **Tiempo real** (WebSocket / SSE / polling agresivo).
- **Preferencias de notificación** por usuario (silenciar tipos, frecuencia, digest).
- **Notificaciones a `SOLICITANTE`** y avisos de cambios de estado de la actividad (`EN_TRANSITO`,
  `ENTREGADO`, etc.): tipos futuros.
- **Notificaciones de verificación de cuenta** (013/015): se añadirían como nuevos `tipo`.
- **Selector de país en el teléfono de `PuntoAcopio`**: fuera de alcance (se puede migrar luego con el
  mismo `TelefonoField`).
- **Archivado, borrado por el usuario ni retención/limpieza** automática de avisos viejos.

## Criterios de aceptación

### Teléfono E.164

- [ ] El formulario de teléfono (registro colaborador/solicitante, `/completar-perfil`, `/mi-perfil`,
      registro admin y `/panel/perfil`) muestra un **selector de país** con Venezuela por defecto y la
      diáspora curada, más el input de número.
- [ ] Un número venezolano válido se guarda como **E.164** (`+58…`); un número de otro país de la lista
      se guarda como `+<dialCode>…`. La validación rechaza números fuera de rango con mensaje en español.
- [ ] Al **editar** un teléfono ya guardado, el selector aparece preseleccionado con el país correcto
      derivado del prefijo E.164.
- [ ] La **migración** convierte los `telefono` existentes de `Usuario` y `PerfilAdmin` de `0XXXXXXXXXX`
      a `+58XXXXXXXXX` sin pérdida.

### Notificaciones in-app

- [ ] Cuando el `ADMIN` **crea una Actividad con al menos una meta**, se genera una notificación
      `NUEVA_ACTIVIDAD` para **cada miembro de la red apta** del admin (025), con `referencia` a esa
      Actividad y `leida = false`.
- [ ] Cuando un aporte marcado `RECIBIDO` hace que una `MetaRecurso` **cruce el 100% por primera vez**,
      se genera `META_CUMPLIDA` para el `ADMIN` dueño y los `COLABORADOR` que aportaron a esa meta. Un
      aporte posterior sobre una meta **ya cumplida** no genera aviso nuevo (idempotencia por meta).
- [ ] Reintentar un disparador con la misma `claveDedupe` para el mismo usuario **no** crea duplicado.
- [ ] Todo usuario autenticado ve una **campana** con el contador de no leídas correcto y una **bandeja**
      en `/notificaciones` con sus avisos, del más reciente al más antiguo, fecha en `DD/MM/AAAA`
      (`es-VE`).
- [ ] El usuario puede **marcar una notificación como leída** y **todas como leídas**; el contador baja.
      Un usuario **no** puede marcar como leída una notificación de otro (validado en servidor).
- [ ] Cada notificación **enlaza a su `referencia`** (la Actividad).
- [ ] 024 y 006 disparan los avisos a través del **puerto** `NotificadorPort`; `notificaciones/domain` y
      `notificaciones/application` permanecen **puras** (sin framework, Prisma ni `fetch`).
- [ ] La migración crea `notificaciones` y el enum `TipoNotificacion` con los índices `(usuarioId, leida)`
      y único `(usuarioId, claveDedupe)`.

### Canal WhatsApp

- [ ] **Sin variables de entorno de Meta**, el sistema funciona: se generan las notificaciones in-app y
      el canal WhatsApp es **no-op** (no lanza ni bloquea). No hay errores en `build`/runtime por ello.
- [ ] **Con** las variables configuradas, al dispararse un evento se hace una llamada a la Graph API de
      Meta (`type: template`) por cada destinatario con `telefonoEsWhatsApp = true` y teléfono válido; el
      número se envía en E.164 (sin `+` según formato de Meta) y con la plantilla del `tipo`.
- [ ] Un fallo de WhatsApp (red, token, plantilla) **no** revierte la Actividad ni el aporte, **no**
      impide el in-app, y queda registrado en log. (Verificable con `fetch` mockeado que rechaza).
- [ ] Si la plantilla de un `tipo` no está configurada en env, ese tipo **no** se envía por WhatsApp y el
      otro tipo sí.

### General

- [ ] `pnpm test` cubre: `validarTelefono` por país (VE estricta + otros por largo) y `paisDeTelefonoE164`;
      `componerMensaje`/`variablesPlantilla` por `tipo`; `claveDedupe`; deduplicación; `contarNoLeidas`;
      `marcarLeida` solo por el dueño; cruce del 100% de meta; `WhatsAppCloudAdapter` (no-op sin env y
      llamada correcta con env, `fetch` mockeado). En verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.

## Notas y riesgos

- **Dependencias:** **ninguna nueva.** Zod, RHF, Prisma, Auth.js, Luxon y `lucide-react` bastan; el
  cliente HTTP es `fetch` nativo, la lista de países y la validación son propias. (Se descartó
  `libphonenumber-js` a propósito para no añadir dependencia).
- **Next 16:** server actions y server components cambian, consultar `node_modules/next/dist/docs/`
  antes de codificar (AGENTS.md). La campana vive en el `AppShell` autenticado; reutilizar la sesión de
  002.
- **Acoplamiento inverso (puerto):** el riesgo es que 024/006 terminen importando la infraestructura de
  notificaciones. Mitigación: `NotificadorPort` en `notificaciones/domain`, inyectado por composición;
  024/006 solo conocen el contrato. ESLint (`import/no-restricted-paths`) ayuda.
- **Fan-out al crear Actividad:** la red apta es acotada; el in-app es un `createMany` barato y el
  WhatsApp un `Promise.allSettled` sobre ese subconjunto. Con el volumen esperado es suficiente; si
  creciera, se movería a una cola (fuera de alcance).
- **Idempotencia / concurrencia:** `@@unique([usuarioId, claveDedupe])` + `skipDuplicates` evitan
  duplicados in-app aunque el disparador se reintente. WhatsApp se envía solo a los recién creados en la
  emisión, así un reintento no reenvía a quien ya tenía la notificación.
- **Seguridad de credenciales:** `WHATSAPP_ACCESS_TOKEN` es secreto de **servidor**; nunca se expone al
  cliente ni se sube al repo (solo `.env.example` con claves vacías). El adaptador corre solo en
  servidor.
- **Plantillas de Meta:** el mensaje real lo define la plantilla aprobada en Meta, no el código. El
  `mensaje` in-app y las variables de plantilla comparten los mismos datos del evento. Los textos
  recomendados de plantilla se documentan en el `DOC/`.
- **Transaccionalidad:** el aviso se emite **después** de que la operación de negocio confirme. Si la
  emisión (in-app o WhatsApp) fallara, no revierte el negocio. Los avisos son "best effort".
- **Migración de teléfonos:** asume que todos los teléfonos actuales son venezolanos en formato nacional
  (cierto por la validación de 017 hasta hoy). Backfill idempotente y reversible en concepto.
- **Futuro (fuera de alcance):** email/push como más implementaciones del `NotificadorPort`; webhooks de
  entrega/lectura de Meta; tiempo real (SSE/WebSocket); preferencias por usuario; selector de país en
  `PuntoAcopio`.
