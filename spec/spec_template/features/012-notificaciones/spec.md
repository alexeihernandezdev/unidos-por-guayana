# 012 · Notificaciones

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles`, `005 · Ayudas / Envío`, `006 · Aportes`, `024 · Actividad: renombre y ciclo de vida por tipo`, `025 · Afiliación a centros de acopio y categorías de aporte` · Roadmap: `constitution/roadmap.md`

> **Actualización (post-025).** El disparador `NUEVA_AYUDA` de esta spec decía originalmente "todos los
> `COLABORADOR` verificados". Tras `025 · Afiliación a centros de acopio`, el destinatario correcto es la
> **red apta** del `ADMIN` dueño: los `COLABORADOR` verificados **afiliados a ese admin** cuya categoría
> declarada coincide con la categoría de **al menos un** recurso de las metas de la Actividad. Esta
> feature debe implementarse **después** de `024` y `025`, ya con esta lógica desde el primer día (no
> como una enmienda posterior). El resto de la tabla de "Disparadores" más abajo queda vigente tal cual
> (incluida la idempotencia y el resto de reglas); solo cambia la resolución de destinatarios de
> `NUEVA_AYUDA`, que pasa de `UsuarioRepository.listarVerificados()` a
> `AfiliacionRepository.listarRedDeAdmin(adminId)` filtrada por categoría e intersección con las metas.

## Qué hace

Introduce la **Notificación**: un aviso dirigido a un `Usuario` que le informa de un hecho relevante
del sistema sin que tenga que estar mirando el panel. Es el canal que conecta lo que ocurre en las
Ayudas con las personas que pueden actuar: cuando nace un envío que necesita recursos, los
`COLABORADOR` se enteran; cuando una meta se cumple, quienes participan lo saben.

La entrega es **in-app**: una **campana** con contador de no leídas y una **bandeja** donde el
usuario ve sus avisos, abre el elemento relacionado y **marca como leído**. No hay correo, SMS ni
push del navegador en este alcance (ver "No incluye").

- **Generación automática** — las notificaciones **no se crean a mano**. Las dispara la capa de
  aplicación de otras features cuando ocurre el hecho (crear una Ayuda, cumplir una meta). Ver
  "Disparadores".
- **Bandeja y campana (`in-app`)** — todo usuario autenticado tiene una campana en la cabecera con el
  **número de no leídas** y una bandeja (`/notificaciones`) que lista sus avisos, del más reciente al
  más antiguo, con su `tipo`, `mensaje`, fecha y un enlace a la `referencia` (p. ej. la Ayuda).
- **Marcar como leída** — el usuario marca un aviso como leído (individual) o **todos como leídos** de
  una vez. El contador de no leídas baja en consecuencia.
- **Referencia navegable** — cada notificación apunta a la entidad que la originó (por ahora, una
  Ayuda), de modo que al abrirla el usuario llega directo al detalle relacionado.

## Por qué

`mission.md` lista **Notificaciones** entre los módulos de apoyo: "avisan a los colaboradores de un
nuevo envío que necesita recursos o cuando se cumple una meta". Sin este canal, un colaborador solo se
entera de que hay un envío al que aportar si entra al panel por su cuenta; el sistema queda pasivo. La
notificación **acerca la acción al momento oportuno** y sostiene el principio de priorizar la
urgencia: cuando algo necesita recursos, la gente que puede darlos lo sabe.

También respeta la **simplicidad de uso** y la **conexión limitada** de la misión: es in-app, sin
depender de servicios externos de correo o push que fallan o se retrasan con mala señal. El usuario ve
sus avisos cuando abre la app.

## Decisiones tomadas

- **Solo entrega in-app.** Nada de email, SMS ni Web Push en este alcance. Son integraciones externas
  (deliverability, credenciales, colas) que chocan con la simplicidad y la conexión limitada de la
  misión. Se dejan como futuro (ver "No incluye").
- **El dominio no se acopla a la infraestructura de avisos.** Las features que disparan avisos (005,
  006) **no** conocen el módulo de notificaciones ni la base de datos. Dependen de un **puerto**
  (`NotificadorPort`) definido como contrato; la implementación concreta (persistir la `Notificacion`)
  vive en la infraestructura de este módulo y se inyecta por composición. Así 005/006 quedan puras y
  este módulo se puede sustituir o ampliar sin tocarlas.
- **Generación automática, nunca manual.** No hay caso de uso "crear notificación" expuesto al usuario;
  las notificaciones son un **efecto** de otros casos de uso. El único caso de uso que las **emite** es
  el interno del notificador (`emitir`), que 005/006 invocan a través del puerto.
- **Modelo de lectura binario (`leida` boolean).** Una notificación está **no leída** o **leída**. No
  hay "vista pero no leída", ni archivado, ni carpetas. El contador de la campana = número de
  notificaciones del usuario con `leida = false`. Simplicidad ante todo.
- **Idempotencia por disparador.** Un mismo hecho no debe generar dos avisos duplicados al mismo
  usuario. Cada notificación lleva una **clave de deduplicación** (`tipo` + `referencia` + destinatario)
  para evitar duplicados si el caso de uso se reintenta. "Meta cumplida" se emite **una sola vez** por
  meta (al cruzar el umbral, no en cada aporte posterior).
- **Destinatarios acotados y sin fan-out masivo.** Al crear una Ayuda se notifica a los `COLABORADOR`
  **verificados** (los que pueden aportar). Al cumplirse una meta se notifica al `ADMIN` dueño de la
  Ayuda y a los `COLABORADOR` que **aportaron** a esa meta. No se notifica a `SOLICITANTE` en este
  alcance. Ver "Disparadores" para el detalle.
- **Tipos cerrados (`enum TipoNotificacion`).** Un conjunto acotado de tipos conocidos, no texto libre
  de tipo. El `mensaje` sí es texto (se compone al emitir); el `tipo` clasifica y permite icono/estilo.
- **Sin tiempo real en esta feature.** El contador se refresca al cargar/navegar (server components +
  `revalidate`), no por WebSocket ni polling agresivo. Streaming en vivo se deja como futuro.
- **Módulo `src/modules/notificaciones/`** con las cuatro capas (Clean + Screaming). El puerto vive en
  su `domain` para que otras features lo importen como contrato sin acoplarse a la implementación.

## Disparadores

Los dos disparadores del alcance. Cada uno se invoca desde el caso de uso de la feature de origen a
través del `NotificadorPort`, después de que la operación de negocio haya tenido éxito.

| Disparador | Origen | Se dispara cuando | Destinatarios | `tipo` |
| --- | --- | --- | --- | --- |
| Nueva Ayuda que necesita recursos | 005 (`crearAyuda`) | El `ADMIN` crea una Ayuda con metas | Todos los `COLABORADOR` `VERIFICADO` | `NUEVA_AYUDA` |
| Meta de recurso cumplida | 006 (al marcar `RECIBIDO`) | El progreso de una `MetaRecurso` cruza el 100% por primera vez | `ADMIN` dueño de la Ayuda + `COLABORADOR` que aportaron a esa meta | `META_CUMPLIDA` |

- **Nueva Ayuda (`NUEVA_AYUDA`)** — `referencia` = la Ayuda; `mensaje` del estilo
  "Nuevo envío a {sectorDestino} necesita recursos". Se emite una sola vez, al crearla. Si la Ayuda
  nace sin metas, no se notifica (no hay recursos que pedir todavía).
- **Meta cumplida (`META_CUMPLIDA`)** — `referencia` = la Ayuda (con la meta/recurso en el `mensaje`,
  p. ej. "Meta de agua cumplida en el envío a {sectorDestino}"). El cruce del 100% se evalúa al
  confirmar un aporte `RECIBIDO` (006): si con ese aporte el progreso de la meta pasa de `< 100%` a
  `>= 100%`, se emite; en aportes posteriores que ya estaban al 100% no se repite (idempotencia por
  meta).

> Los disparadores viven en la **capa de aplicación de 005 y 006**, que invocan el puerto. Este módulo
> no observa la base de datos ni "escucha" eventos: recibe llamadas explícitas del emisor.

## Alcance

**Incluye**

- Modelo Prisma:
  - `enum TipoNotificacion { NUEVA_AYUDA META_CUMPLIDA }`.
  - `model Notificacion`: `id`, relación a `Usuario` destinatario (`usuarioId`, cascade al borrar el
    usuario), `tipo` (`TipoNotificacion`), `mensaje` (`String`), `referenciaTipo` (`String`, p. ej.
    `"AYUDA"`) y `referenciaId` (`String`) para apuntar a la entidad relacionada sin acoplar la tabla a
    una FK rígida, `leida` (`Boolean @default(false)`), `claveDedupe` (`String`, para idempotencia),
    `createdAt`. Índices por `(usuarioId, leida)` (contador y bandeja) y `@@unique([usuarioId, claveDedupe])`.
  - Relación inversa `notificaciones` en `Usuario`.
  - **Migración** correspondiente.
- Dominio (`notificaciones/domain`) — puro:
  - Entidad `Notificacion`, enum `TipoNotificacion`, tipo `NuevaNotificacion`.
  - **Puerto `NotificadorPort`** (contrato que otras features importan): `emitir(evento)`, donde
    `evento` describe `tipo`, `referencia`, `destinatarios` (o la regla para resolverlos) y los datos
    para componer el `mensaje`.
  - Reglas puras: composición del `mensaje` por `tipo`, cálculo de la `claveDedupe`, y el helper
    `contarNoLeidas(notificaciones)`.
  - Contrato `NotificacionRepository`: `crearMuchas`, `listarPorUsuario(usuarioId, filtro?)`,
    `contarNoLeidas(usuarioId)`, `marcarLeida(id, usuarioId)`, `marcarTodasLeidas(usuarioId)`,
    `existePorClave(usuarioId, claveDedupe)`.
- Aplicación (`notificaciones/application`) — pura:
  - `emitirNotificacion(deps, evento)`: resuelve destinatarios, compone `mensaje` y `claveDedupe`,
    **deduplica** (no crea si ya existe la clave para ese usuario) y persiste vía repositorio. Es la
    implementación del `NotificadorPort`.
  - `listarNotificaciones(deps, usuarioId, filtro?)` (todas / no leídas), `contarNoLeidas(deps, usuarioId)`,
    `marcarLeida(deps, id, usuarioId)`, `marcarTodasLeidas(deps, usuarioId)`.
  - Errores: `NotificacionNoEncontradaError`, `NoAutorizadoError` (un usuario solo marca las suyas).
- Integración con features existentes (mínima, sin duplicar lógica):
  - 005 `crearAyuda` invoca `NotificadorPort.emitir({ tipo: NUEVA_AYUDA, ... })` tras crear la Ayuda
    con metas.
  - 006 (al marcar `RECIBIDO`) evalúa el cruce del 100% de la meta y, si aplica, invoca
    `NotificadorPort.emitir({ tipo: META_CUMPLIDA, ... })`.
  - La resolución de "colaboradores verificados" usa el `UsuarioRepository` de 002; "colaboradores que
    aportaron a la meta" usa el `AporteRepository` de 006. Se inyectan por composición.
- Infraestructura (`notificaciones/infrastructure`): `PrismaNotificacionRepository` sobre
  `@/lib/prisma` (con `createMany`, `count` filtrado por `leida = false`, `updateMany` idempotente para
  marcar leídas). Composición que expone el `NotificadorPort` para 005/006.
- Presentación (`notificaciones/ui` + `src/app`):
  - **Campana** en la cabecera del área autenticada: icono `Bell` (lucide, `strokeWidth={1.5}`) con
    **badge de no leídas**; al abrir, un popover con las últimas notificaciones y enlace a la bandeja.
  - **Bandeja** `/notificaciones`: lista paginada/acotada de los avisos del usuario, con `tipo`,
    `mensaje`, fecha (Luxon, `es-VE`, `DD/MM/AAAA`), estado leída/no leída y enlace a la `referencia`.
    Acciones **marcar leída** y **marcar todas como leídas**.
  - Server actions con `zod`, sesión requerida (feature 002) y `revalidatePath`.
- Tests (Vitest): composición de `mensaje` por `tipo`, `claveDedupe`, deduplicación (no crea repetido),
  `contarNoLeidas`, `marcarLeida` (solo el dueño), evaluación del cruce de 100% en meta cumplida.

**No incluye**

- **Correo, SMS ni Web Push.** Toda entrega es in-app. Los canales externos quedan como futuro (ver
  "Notas y riesgos"); requerirían un proveedor y config aparte, fuera de este alcance.
- **Tiempo real** (WebSocket / SSE / polling agresivo). El contador se actualiza al navegar/recargar.
- **Preferencias de notificación** por usuario (silenciar tipos, frecuencia, digest). Todos reciben los
  dos tipos definidos.
- **Notificaciones a `SOLICITANTE`** (p. ej. "tu solicitud fue atendida") y avisos de cambios de estado
  del envío (`EN_TRANSITO`, `ENTREGADO`): se contemplan como tipos futuros junto a 010, no aquí.
- **Notificaciones de verificación de cuenta** (aprobada/rechazada por superadmin o admin): pertenecen a
  015/013; si se quisieran, se añaden como nuevos `tipo` reutilizando el puerto.
- **Archivado, borrado por el usuario ni retención/limpieza** automática de avisos viejos.

## Criterios de aceptación

- [ ] Cuando el `ADMIN` **crea una Ayuda con al menos una meta**, se genera una notificación
      `NUEVA_AYUDA` para **cada `COLABORADOR` verificado**, con `referencia` a esa Ayuda y `leida = false`.
- [ ] Cuando un aporte marcado `RECIBIDO` hace que el progreso de una `MetaRecurso` **cruce el 100% por
      primera vez**, se genera una notificación `META_CUMPLIDA` para el `ADMIN` dueño y para los
      `COLABORADOR` que aportaron a esa meta. Un aporte posterior sobre una meta **ya cumplida** no
      genera un aviso nuevo (idempotencia por meta).
- [ ] Una operación no genera **duplicados**: reintentar el disparador con la misma `claveDedupe` para el
      mismo usuario **no** crea una segunda notificación.
- [ ] Todo usuario autenticado ve una **campana** con el **contador de no leídas** correcto y una
      **bandeja** en `/notificaciones` con sus avisos, del más reciente al más antiguo, con la fecha en
      `DD/MM/AAAA` (`es-VE`).
- [ ] El usuario puede **marcar una notificación como leída** y **marcar todas como leídas**; el
      contador baja en consecuencia. Un usuario **no** puede marcar como leída una notificación de otro
      (validado en servidor).
- [ ] Cada notificación **enlaza a su `referencia`** (la Ayuda) y al abrirla lleva al detalle relacionado.
- [ ] Las features 005 y 006 disparan los avisos a través del **puerto** `NotificadorPort`, sin importar
      la infraestructura de notificaciones; `notificaciones/domain` y `notificaciones/application`
      permanecen **puras** (sin framework ni Prisma).
- [ ] La **migración** crea `notificaciones` y el enum `TipoNotificacion` sin errores; existen el índice
      `(usuarioId, leida)` y el único `(usuarioId, claveDedupe)`.
- [ ] `pnpm test` cubre: composición de `mensaje`, `claveDedupe`, deduplicación, `contarNoLeidas`,
      `marcarLeida` solo por el dueño y cruce del 100% de meta — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.

## Notas y riesgos

- **Dependencias:** no debería hacer falta ninguna nueva. Zod, RHF, Prisma, Auth.js, Luxon y
  `lucide-react` ya están. Si se planteara una librería de "toast"/realtime, **avisar**.
- **Next 16:** server actions y server components cambian — consultar `node_modules/next/dist/docs/`
  antes de codificar (AGENTS.md). La campana vive en el layout autenticado; reutilizar la sesión de 002.
- **Acoplamiento inverso (puerto):** el riesgo es que 005/006 terminen importando la infraestructura de
  notificaciones. Mitigación: el `NotificadorPort` se define en `notificaciones/domain` y se **inyecta**
  por composición; 005/006 solo conocen el contrato. ESLint (`import/no-restricted-paths`) ayuda a que no
  se cuele una importación de infraestructura.
- **Fan-out al crear Ayuda:** notificar a "todos los colaboradores verificados" es un `createMany`. Con
  el volumen esperado del proyecto es barato; si creciera, se paginaría el insert o se movería a una cola.
  **No** introducir cola ni job runner en esta feature.
- **Idempotencia / concurrencia:** el `@@unique([usuarioId, claveDedupe])` evita duplicados a nivel de
  base aunque el disparador se reintente. El insert usa `skipDuplicates` para no fallar por choque de
  clave. El cruce del 100% de meta se evalúa comparando el progreso **antes y después** del aporte, o
  se resuelve idempotentemente por la clave (una sola `META_CUMPLIDA` por meta).
- **Composición del `mensaje`:** se arma en el dominio a partir del `tipo` y los datos del evento
  (sector, recurso). Sin em-dash ni en-dash en el texto visible; fechas en `es-VE`.
- **Transaccionalidad:** el aviso se emite **después** de que la operación de negocio confirme. Si la
  emisión fallara, no debe revertir la Ayuda ni el aporte (el negocio manda). Registrar el fallo y
  seguir; los avisos son "best effort".
- **Futuro (fuera de alcance):** canales externos (email/push) se añadirían como **implementaciones
  adicionales del `NotificadorPort`** (un notificador compuesto), sin tocar 005/006. El tiempo real
  (SSE/WebSocket) y las preferencias por usuario también son evoluciones naturales del mismo puerto.
