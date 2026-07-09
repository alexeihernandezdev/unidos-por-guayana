# 010 · Seguimiento del envío

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles`, `005 · Ayudas / Envío` · Alimenta: `009 · Tablero público de transparencia` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce el **seguimiento del envío**: el **historial de trazabilidad** de cada Ayuda a lo largo de
su ciclo de vida. Cada vez que un envío cambia de estado
(`RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`) queda registrado un **evento de seguimiento**
(`SeguimientoEvento`) con **cuándo** ocurrió, una **nota** opcional y una **evidencia** opcional
(foto/URL). Da la traza de **origen a destino** que hoy el modelo promete pero no persiste.

Es la pieza que hace **auditable** el recorrido de cada ayuda: no solo "en qué estado está", sino
"cómo llegó hasta aquí y con qué respaldo".

- **Registro automático en cada transición** — al avanzar el estado de una Ayuda (acción del `ADMIN`,
  feature 005), se **crea un `SeguimientoEvento`** de forma atómica con la transición. El `ADMIN`
  puede adjuntar una **nota** ("salió del acopio de San Félix") y una **evidencia** (URL a una foto)
  al confirmar el paso.
- **Evidencia de entrega** — el paso a `ENTREGADO` es el momento clave para la transparencia: la UI
  **pide** (sin forzar en el MVP) una nota y una evidencia que respalden la entrega.
- **Línea de tiempo en el detalle del envío (`ADMIN`)** — el detalle de una Ayuda muestra su historial
  ordenado cronológicamente: cada transición con su fecha, quién la registró, la nota y la evidencia.
- **Línea de tiempo pública** — el detalle público del envío (009) muestra la **misma traza** pero
  **sin datos personales**: transiciones, fechas, notas y evidencias; nunca quién las registró. Es lo
  que completa la promesa de transparencia "a dónde fue cada ayuda" con "y con qué respaldo".
- **Solo lectura una vez registrado** — un evento de seguimiento es un **hecho histórico**: no se
  edita ni se borra suelto (la auditabilidad exige un registro inmutable). Se corrige, si acaso, con
  un evento nuevo, no reescribiendo el pasado.

## Por qué

`mission.md` define el **seguimiento del envío** como uno de los ocho módulos centrales: "Traza el
estado de cada Ayuda a lo largo de su ciclo de vida, con evidencia de entrega, para dar visibilidad
de origen a destino". Y `tech-stack.md` lo eleva a **invariante**: "el ciclo de vida de una `Ayuda`
avanza en un solo sentido y **cada transición registra un `SeguimientoEvento`**". Hoy ese invariante
no se cumple: `avanzarEstado` (005) cambia el estado pero **no deja rastro**. Sin este módulo, la
**trazabilidad** (segundo principio de la misión) es una promesa vacía: no hay auditoría del recorrido
ni evidencia de que la ayuda llegó. Es también el insumo que faltaba al tablero público (009) para
mostrar el recorrido, no solo el estado final.

## Decisiones tomadas

- **El evento es parte del agregado Ayuda, no un módulo aparte.** `SeguimientoEvento` vive **dentro
  del módulo `ayudas`** (dominio/aplicación/infraestructura de `ayudas`). Motivo: la transición de
  estado y el registro del evento deben ocurrir **atómicamente** y la lógica de avance ya vive en
  `ayudas/application/avanzarEstado`. Un módulo `seguimiento` separado obligaría a una escritura
  cruzada entre módulos y arriesgaría el invariante "cada transición registra un evento". Si el
  seguimiento crece (múltiples fuentes de eventos, no solo transiciones), se reevalúa extraerlo.
- **Registro atómico con la transición.** `avanzarEstado` cambia el estado **y** crea el evento en una
  **misma transacción** (repositorio con `prisma.$transaction`). Nunca un estado sin su evento ni un
  evento sin su cambio.
- **Evento de creación opcional.** Al crear la Ayuda (005) se registra un evento inicial
  (`estadoAnterior = null`, `estadoNuevo = RECOLECTANDO`) para que la línea de tiempo tenga un origen
  claro. Es una decisión de completitud; si complica 005, el mínimo exigible son los eventos de
  transición.
- **Evidencia como URL, sin pipeline de subida.** En el MVP la `evidencia` es un **enlace** (URL a una
  foto ya alojada), **no** un sistema de carga de archivos. Motivo: subir/almacenar imágenes implica
  almacenamiento (Supabase Storage) y validaciones que exceden el MVP y añadirían dependencias
  (límite duro). La subida real de archivos es una iteración posterior; el modelo ya deja el campo
  listo.
- **Evidencia recomendada, no obligatoria (por ahora).** El paso a `ENTREGADO` **pide** nota y
  evidencia en la UI, pero el dominio **no** las fuerza en el MVP: bloquear la operación por falta de
  una URL sería frágil en campo. Queda documentada como candidata a obligatoria en `ENTREGADO`.
- **Eventos inmutables.** No hay editar/borrar de un `SeguimientoEvento` individual. Se conserva el
  historial íntegro (auditabilidad). Si se borra la Ayuda (solo posible en `RECOLECTANDO`, 005), sus
  eventos caen en cascada con ella.
- **Solo el `ADMIN` genera eventos.** Como solo el `ADMIN` avanza estados (005), solo él registra
  seguimiento. Se guarda `registradoPor` (id del `ADMIN`) para auditoría **interna**; ese campo
  **nunca** se expone en la vista pública.
- **La vista pública no expone identidades.** La línea de tiempo pública (009) muestra transición,
  fecha, nota y evidencia; **oculta** `registradoPor`. Coherente con el límite de privacidad de 009.

## Alcance

**Incluye**

- Modelo Prisma:
  - `model SeguimientoEvento`: `id`, relación a `Ayuda` (`onDelete: Cascade`),
    `estadoAnterior EstadoAyuda?`, `estadoNuevo EstadoAyuda`, `nota String?`, `evidenciaUrl String?`,
    `ocurridoEn DateTime @default(now())`, `registradoPor String?` (id del `ADMIN`), `createdAt`.
    Índice `@@index([ayudaId])`. `@@map("seguimiento_eventos")`.
  - Relación inversa `seguimiento SeguimientoEvento[]` en `Ayuda`.
  - **Migración** correspondiente.
- Dominio (`ayudas/domain`): entidad `SeguimientoEvento`, ampliar el contrato `AyudaRepository` con la
  operación atómica de avance-con-evento y con la lectura del historial. Reglas puras: la máquina de
  estados existente (`maquinaEstados.ts`) sigue siendo la fuente de verdad de qué transición es válida;
  el evento **describe** la transición ya validada.
- Aplicación (`ayudas/application`):
  - Ampliar `avanzarEstado(deps, id, detalle?)` para aceptar un `detalle?` opcional
    (`{ nota?, evidenciaUrl? }`) y registrar el `SeguimientoEvento` de la transición **atómicamente**.
  - `registrarEventoCreacion` (o integrarlo en `crearAyuda`, 005) para el evento inicial.
  - `listarSeguimiento(deps, ayudaId)` → historial ordenado por `ocurridoEn` asc (para el `ADMIN`).
  - `listarSeguimientoPublico(deps, ayudaId)` → misma traza **sin** `registradoPor` (para 009).
- Infraestructura (`ayudas/infrastructure`): implementar en `PrismaAyudaRepository` el avance atómico
  con `prisma.$transaction` (cambiar estado + insertar evento) y las lecturas del historial.
- Presentación:
  - **Admin**: en el detalle `/(admin)/panel/ayudas/[id]` (005), un bloque **línea de tiempo** con los
    eventos; el control de "avanzar estado" pasa a permitir adjuntar `nota` y `evidenciaUrl` (server
    action con `zod`, `requireRol(ADMIN)`, `revalidatePath`).
  - **Público**: en el detalle `/transparencia/[id]` (009), un bloque de línea de tiempo pública
    (sin datos personales). Si 009 aún no está, dejar el caso de uso `listarSeguimientoPublico` listo
    para que 009 lo consuma.
  - Componentes en `ayudas/ui`: `LineaTiempoSeguimiento`, `EventoSeguimiento`, y ampliación del
    formulario/acción de avance de estado con los campos opcionales.
- Fechas con **Luxon** (`es-VE`, `dd/MM/yyyy`); guardar en UTC, formatear a español al mostrar.
- Tests (Vitest): que `avanzarEstado` crea el evento con `estadoAnterior`/`estadoNuevo` correctos y
  respeta la máquina de estados; atomicidad (si falla el evento, no cambia el estado, con doble en
  memoria); `listarSeguimiento` ordena cronológicamente; `listarSeguimientoPublico` **no** incluye
  `registradoPor`.

**No incluye**

- **Subida/almacenamiento de archivos** (fotos): la evidencia es una URL en el MVP. El pipeline de
  carga real (Supabase Storage, validación de tipo/tamaño) es una iteración posterior.
- **Edición o borrado** de eventos individuales (inmutabilidad).
- **Retroceso o salto de estados**: la máquina de estados (005) no cambia; sigue avanzando en un solo
  sentido y paso a paso.
- **Eventos de otras fuentes** (aportes recibidos, notas sueltas sin transición): por ahora el evento
  representa **transiciones de estado** (más el evento de creación). Otros tipos entran si se justifican.
- **Geolocalización / mapa** del recorrido: solo `sectorDestino` (005) y la traza de estados. Sin
  lat/lng (principio de simplicidad).
- **Notificaciones** al cambiar de estado (feature 012).
- **Exponer `registradoPor`** en ninguna superficie pública.

## Criterios de aceptación

- [ ] Al **avanzar el estado** de una Ayuda, se crea un `SeguimientoEvento` con `estadoAnterior`,
      `estadoNuevo`, `ocurridoEn` y (si se aportaron) `nota` y `evidenciaUrl`, **en la misma
      transacción** que el cambio de estado.
- [ ] La máquina de estados se respeta: solo transiciones válidas
      (`RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`); `ENTREGADO` es terminal. Una transición
      inválida **no** crea evento ni cambia el estado.
- [ ] El detalle de la Ayuda (`ADMIN`) muestra la **línea de tiempo** ordenada cronológicamente, con
      fecha, nota, evidencia y quién la registró.
- [ ] El detalle **público** (009) muestra la misma traza **sin** `registradoPor` ni ningún dato
      personal.
- [ ] Al pasar a `ENTREGADO`, la UI **solicita** nota y evidencia (sin bloquear la operación si faltan,
      en el MVP).
- [ ] Un evento registrado **no** se puede editar ni borrar de forma aislada; al borrar la Ayuda
      (solo en `RECOLECTANDO`) sus eventos caen en cascada.
- [ ] Las fechas se muestran en español (`dd/MM/yyyy`, Luxon `es-VE`); almacenadas en UTC.
- [ ] La **migración** crea `seguimiento_eventos` y su índice sin errores.
- [ ] `pnpm test` cubre: creación del evento en la transición, respeto de la máquina de estados,
      atomicidad, orden cronológico y ausencia de `registradoPor` en la lectura pública — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `ayudas/domain` y `ayudas/application` **puras** (sin
      framework ni Prisma).

## Notas y riesgos

- **Dependencias:** ninguna nueva mientras la evidencia sea una URL. Un pipeline de subida de archivos
  (Supabase Storage) **sí** añadiría dependencias: **avisar** y decidir aparte (límite duro).
- **Next 16:** server actions y `revalidatePath` para el avance con detalle; consultar
  `node_modules/next/dist/docs/` antes de codificar (AGENTS.md). Reutilizar `requireRol(ADMIN)` (002).
- **Atomicidad:** el punto delicado es que estado y evento se escriban juntos. Implementar el avance
  con `prisma.$transaction` en la infraestructura; el dominio/aplicación permanece puro orquestando a
  través del contrato del repositorio. Testear el fallo (si el insert del evento falla, el estado no
  cambia).
- **Impacto en 005:** `avanzarEstado` cambia de firma (acepta `detalle?` opcional) y su
  implementación del repo. Es un cambio **retrocompatible** (el `detalle` es opcional). Ajustar la
  server action de avance de 005 para pasar los campos.
- **Evidencia por URL:** riesgo de enlaces rotos o a hosts arbitrarios. Validar formato de URL en el
  límite (zod) y, si se quiere, restringir esquemas a `https`. La confianza real llega con la subida
  gestionada (posterior).
- **Coherencia con 009:** la vista pública consume `listarSeguimientoPublico`. Mantener ese caso de
  uso como la **única** puerta pública al historial, para no filtrar `registradoPor` por descuido.
- **Zona horaria:** `ocurridoEn` en UTC; formatear a `es-VE` solo al mostrar. No guardar fechas
  locales.
- **Volumen:** un envío tendrá pocos eventos (3-4 transiciones + creación); sin paginación. El índice
  `@@index([ayudaId])` basta para las lecturas por envío.
