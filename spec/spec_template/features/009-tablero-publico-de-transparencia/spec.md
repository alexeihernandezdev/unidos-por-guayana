# 009 · Tablero público de transparencia

> Estado: **Pendiente** · Depende de: `004 · Catálogo de recursos`, `005 · Ayudas / Envío`, `006 · Aportes` · Relacionado (reutiliza lecturas): `008 · Panel de administración` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce el **tablero público de transparencia**: una vista **abierta (sin iniciar sesión)** que
muestra **qué se recolectó**, el **progreso de cada envío** y **a dónde fue cada ayuda**. Es la
materialización del principio de **transparencia** de `mission.md`: cualquiera (donante potencial,
prensa, comunidad, autoridad) puede auditar el estado de la operación sin credenciales.

Es una superficie de **agregación read-only y pública** sobre módulos ya existentes (Ayudas,
Aportes, Recursos). No introduce entidades nuevas ni mutaciones. Es la contraparte pública del panel
del `ADMIN` (008): donde el panel prioriza y acciona, este tablero solo **rinde cuentas**.

- **Vista general (`/transparencia`)** — pública, sin sesión, con:
  - **Titular de impacto** — totales agregados de lo recolectado hasta hoy: número de envíos, cuántos
    **entregados**, y el agregado de aportes `RECIBIDO` (p. ej. "N envíos, M entregados, X aportes
    confirmados"). Sin datos personales.
  - **Recolectado por recurso** — para los recursos con actividad, cuánto se ha recibido (suma de
    aportes `RECIBIDO`) expresado en la `unidad` del recurso (litros, cajas, vehículos, personas…).
    Los recursos `MONETARIO` se muestran como monto agregado por moneda, dejando claro que el dinero
    se recibe **por fuera** de la app (ver `mission.md` → "Qué NO es").
  - **Envíos y su progreso** — lista de envíos con `titulo`, `sectorDestino`, `fecha`, `estado` y un
    **progreso global** (% de metas cumplidas) con barra. Cada tarjeta enlaza a su detalle público.
  - **A dónde fue cada ayuda** — el `sectorDestino` y el `estado` de cada envío hacen visible el
    destino; los `ENTREGADO` se marcan como "entregado" de forma destacada.
- **Detalle público de un envío (`/transparencia/[id]`)** — vista abierta con:
  - Cabecera: `titulo`, `sectorDestino`, `fecha`, `estado`.
  - **Metas por recurso**: `recurso`, `cantidadObjetivo`, `cantidadRecibida` y `%` con barra.
  - **Progreso global** del envío.
  - **Sin datos personales** de quién aportó: solo cantidades agregadas por recurso.
- **Consumo de datos read-only y anónimo** — el tablero no muta nada ni expone identidades. Solo
  lecturas agregadas.

## Por qué

`mission.md` lista el **tablero público de transparencia** como uno de los ocho módulos centrales y
consagra la **transparencia** como primer principio: "Cualquiera puede ver qué se recolectó, cuánto
falta y a dónde fue cada ayuda". Sin esta vista, esa promesa vive solo dentro del panel del `ADMIN`
(privado). El tablero es lo que convierte la trazabilidad interna en **confianza pública**: da a los
donantes una razón para aportar (ven que lo recolectado llega a destino) y a la comunidad una forma
de auditar sin pedir acceso. Es también el escaparate natural del proyecto, complementario a la
landing (003).

## Decisiones tomadas

- **Público y sin sesión.** Vive fuera de `/(app)` y `/(admin)`; no pasa por `requireRol`. Ruta en la
  raíz del árbol público (`/transparencia`), accesible por cualquiera. La landing (003) enlaza a él.
- **Cero datos personales.** No se muestra **quién** aportó ni **quién** solicitó: ni nombres, ni
  correos, ni conteos que permitan reidentificar. Solo **cantidades agregadas por recurso** y estado
  de los envíos. Es una decisión de privacidad **dura**, no negociable en el MVP.
- **Read-only puro.** El tablero no crea, edita ni cambia estados. Toda mutación sigue viviendo en el
  módulo dueño (005/006). El tablero solo compone lecturas.
- **Reutiliza las agregaciones de 008.** El panel del `ADMIN` ya expone lecturas agregadas
  (`progresoDeAyuda`, conteos por estado, `listarPrioridadRecolectando`). El tablero las reutiliza
  **como funciones puras**, filtrando a lo que es apto para publicar. Si necesita una lectura nueva,
  se añade **como caso de uso en el módulo dueño**, no aquí.
- **Qué envíos se publican.** Se muestran **todos** los envíos (incluidos los que están
  `RECOLECTANDO`): la transparencia incluye "cuánto falta", no solo lo entregado. Si más adelante se
  quiere ocultar borradores, se introduce un flag de visibilidad en 005 (fuera de alcance aquí).
- **El dinero se muestra como agregado, nunca como pago.** Los recursos `MONETARIO` se reflejan como
  monto recibido agregado por moneda, con nota de que el pago ocurre por un canal externo. La app no
  procesa pagos (límite duro de `tech-stack.md`).
- **Cacheable por diseño.** Al ser público y no depender de la sesión, es candidato natural a caché
  con las herramientas nativas de Next 16 (`revalidate` / ISR). Sirve datos "casi en vivo" sin
  golpear la BD en cada visita. Empezar sin caché y **medir** antes de fijar el `revalidate`.
- **Sin gráficas con librerías externas.** Barras de progreso CSS/Tailwind y números grandes, igual
  que 008. Añadir una librería de charts es una decisión aparte y explícita (límite duro: no añadir
  dependencias sin avisar).
- **Módulo `src/modules/transparencia/`** — solo capas `application` (composición de lecturas
  publicables) y `ui` (componentes de la vista pública). **Sin `domain` ni `infrastructure`
  propios**: no hay entidad "Transparencia"; las lecturas se apoyan en los repos de 005/006.

## Alcance

**Incluye**

- **Sin cambios de schema.** No se crean tablas, enums ni columnas. Se verifica que los índices que
  las lecturas necesitan ya existen (añadidos por 005/006); si falta alguno, se añade **en el módulo
  dueño**.
- Casos de uso de **composición** en `src/modules/transparencia/application/`:
  - `obtenerResumenPublico(deps)` → DTO **sin datos personales** con:
    - `totales`: `{ enviosTotal, enviosEntregados, aportesConfirmados }`.
    - `recolectadoPorRecurso`: `Array<{ recurso, unidad, categoria, cantidadRecibida }>` (solo
      recursos con actividad; `MONETARIO` agregado por moneda).
    - `envios`: `Array<{ ayudaId, titulo, sectorDestino, fecha, estado, porcentaje }>`, ordenados por
      `fecha` desc (lo más reciente primero).
  - `obtenerDetallePublico(deps, ayudaId)` → DTO con cabecera (`titulo`, `sectorDestino`, `fecha`,
    `estado`), `metas`: `Array<{ recurso, unidad, cantidadObjetivo, cantidadRecibida, porcentaje }>`
    y `porcentajeGlobal`. **Nunca** incluye identidades de aportantes.
- Lecturas agregadas nuevas en los módulos dueños **solo si faltan** (para que `transparencia` no
  escriba SQL propio):
  - **005 · Ayudas** — `listarEnviosPublicos(deps)` (o reutilizar `listarAyudas` + `progresoDeAyuda`);
    envíos con su porcentaje.
  - **006 · Aportes** — `recolectadoPorRecurso(deps)` → suma de aportes `RECIBIDO` agrupada por
    recurso (y por moneda para `MONETARIO`). Puras en `application`, con su implementación Prisma en
    la infraestructura del módulo.
- Presentación pública:
  - Ruta `/transparencia/page.tsx` — server component, **sin** `requireRol`. Invoca
    `obtenerResumenPublico` y renderiza la vista.
  - Ruta `/transparencia/[id]/page.tsx` — server component público; invoca `obtenerDetallePublico`.
    `notFound()` si el id no existe.
  - Componentes en `src/modules/transparencia/ui/`: `ResumenTransparencia`, `TotalesImpacto`,
    `RecolectadoPorRecurso`, `ListaEnviosPublicos`, `TarjetaEnvioPublico`, `DetalleEnvioPublico`,
    `BarraProgreso` (o reutilizar la que exista).
  - Enlace desde la landing (003) y/o el header público hacia `/transparencia`.
  - Metadatos/SEO (`generateMetadata`) para la vista pública (título, descripción), coherente con la
    landing.
- Formateo de fechas con **Luxon** (`es-VE`, `dd/MM/yyyy`) y números con `numeric-tnum` donde aplique.
- Tests (Vitest) de los casos de uso `obtenerResumenPublico` y `obtenerDetallePublico` con dobles en
  memoria de los repos, verificando en especial que **no** filtran datos personales y que los
  agregados y porcentajes son correctos.

**No incluye**

- **Cualquier dato personal** de colaboradores o solicitantes (nombres, contacto, historial
  individual de aportes). Es un límite de la feature.
- **Escritura** de ningún tipo. El tablero no marca recibidos, no avanza estados, no registra nada.
- **Login o roles.** Es 100 % público; no hay vista "premium" para usuarios autenticados aquí.
- **Historial / trazabilidad por evento** (transiciones con evidencia): eso llega en 010
  (`SeguimientoEvento`). Aquí solo se muestra el `estado` actual, no la línea de tiempo.
- **Solicitudes** de ayuda en la vista pública (privacidad y foco): el tablero rinde cuentas de lo
  **recolectado y entregado**, no expone quién pidió qué. Si se decide publicar necesidades
  agregadas, entra como iteración aparte.
- **Filtros avanzados, buscador o paginación compleja.** Un listado simple ordenado por fecha basta
  para el MVP; la paginación se añade si el volumen lo exige (dejar el contrato del repo abierto).
- **Gráficas** con librerías externas, exports (CSV/PDF) o embeds. Barras CSS y números.
- **Tiempo real** / auto-refresh. Se recarga la página (o revalida por ISR).

## Criterios de aceptación

- [ ] Un visitante **sin sesión** accede a `/transparencia` y ve: totales de impacto, recolectado por
      recurso y la lista de envíos con su progreso y destino (`sectorDestino` + `estado`).
- [ ] El **detalle público** `/transparencia/[id]` muestra las metas por recurso con
      `cantidadObjetivo`, `cantidadRecibida` y `%`, más el progreso global. `notFound()` si el id no
      existe.
- [ ] La vista **no expone ningún dato personal** de aportantes ni solicitantes: solo cantidades
      agregadas por recurso y estado de los envíos. (Verificado en el DTO y en la UI.)
- [ ] Los recursos `MONETARIO` se muestran como **monto agregado por moneda**, con nota de que el pago
      es por canal externo; **no** hay ninguna operación de cobro.
- [ ] Los envíos `ENTREGADO` se distinguen visualmente como "entregado" (destino cumplido).
- [ ] Las fechas se muestran en español (`dd/MM/yyyy`, Luxon `es-VE`); nunca ISO ni `MM/DD/AAAA` en
      texto visible.
- [ ] El tablero **no ejecuta mutaciones** y **no requiere sesión** (no pasa por `requireRol`).
- [ ] `pnpm test` cubre: `obtenerResumenPublico` y `obtenerDetallePublico` componen agregados y
      porcentajes correctos y **no** incluyen campos personales, con dobles en memoria — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `transparencia/application` **puro** (sin framework ni
      Prisma).

## Notas y riesgos

- **Dependencias:** ninguna nueva. Si surge la tentación de una librería de charts para el impacto
  visual, **avisar** y decidir en conjunto (límite duro).
- **Next 16:** vista pública cacheable. Consultar `node_modules/next/dist/docs/` antes de tocar
  server components / `revalidate` / ISR (AGENTS.md). Empezar sin caché y medir; si hay latencia,
  fijar un `revalidate` corto (p. ej. 60 s) por ser dato público casi-en-vivo.
- **Privacidad como invariante:** el mayor riesgo es **filtrar identidades** al agregar. Los casos de
  uso deben construir el DTO público **incluyendo solo** los campos aptos, nunca "todo menos X". Los
  tests deben afirmar explícitamente la ausencia de campos personales.
- **Dependencia de 006 (Aportes):** el "recolectado" real y los porcentajes dependen de que exista el
  cálculo de progreso de 006 (`progresoDeAyuda`, aportes `RECIBIDO`). Si 009 se aborda antes de que
  006 esté completo, el tablero se puede montar contra la estructura de metas de 005 mostrando
  progreso 0/agregados vacíos, y completarse cuando 006 aterrice. Documentar el orden.
- **Reutilización de 008:** las agregaciones del panel (`progresoDeAyuda`, conteos, prioridad) son la
  base natural. Mantenerlas puras para reutilizarlas sin duplicar SQL. Si el panel cambia contratos,
  ajustar solo `transparencia/application`.
- **`sectorDestino`:** es el destino declarado del envío (005). No hay geolocalización ni mapa en el
  MVP (principio de simplicidad y conexión limitada).
- **Coherencia editorial con la landing (003):** el tablero es cara pública del proyecto; respetar el
  estilo visual de `tech-stack.md` (paleta ocre/teal, tipografías, sin em-dash en texto visible, sin
  eyebrows uppercase decorativos, barras de progreso con `--ease-out-emil`).
- **Volumen:** con muchos envíos, considerar paginación o límite en el listado público; dejar el
  contrato del repo preparado, sin implementarla hasta que haga falta.
