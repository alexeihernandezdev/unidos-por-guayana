# 008 · Panel de administración

> Estado: **Hecho** · Depende de: `002 · Autenticación y roles`, `004 · Catálogo de recursos`, `005 · Ayudas / Envío`, `006 · Aportes`, `007 · Solicitudes de ayuda` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce el **panel del `ADMIN`**: la vista consolidada desde la que el administrador **entiende de
un vistazo** el estado del sistema y decide **qué envío sale primero**. Es una superficie de
**agregación y navegación** sobre módulos ya existentes (Ayudas, Aportes, Solicitudes, Catálogo); no
introduce entidades nuevas.

- **Vista general (`/(admin)/panel`)** — tarjetas con las métricas clave y bloques con las listas
  accionables:
  - **Envíos activos por estado** (`RECOLECTANDO`, `LISTO`, `EN_TRANSITO`) con contadores y enlace al
    listado filtrado.
  - **Progreso agregado** de los envíos en `RECOLECTANDO`: cuántas metas están al 100 %, cuántas por
    debajo, y % promedio de completitud.
  - **Solicitudes abiertas por urgencia** (`ALTA` primero) con enlace al listado filtrado.
  - **Aportes pendientes de confirmar** (`COMPROMETIDO`) con enlace directo para procesarlos.
  - **Sectores más demandados** en las últimas solicitudes abiertas (top-N, texto ordenado por
    volumen).
- **Bloque de decisión "Qué envío sale primero"** — lista los envíos en `RECOLECTANDO` ordenados por
  **% de metas completado (descendente)** y con un indicador de solicitudes abiertas afines por
  sector. No decide por el `ADMIN`, solo le muestra el criterio.
- **Atajos** — accesos directos a **crear Ayuda**, **crear Recurso** y **ver Solicitudes**.
- **Consumo de datos read-only** — el panel no muta nada por sí mismo; los cambios (marcar recibido,
  avanzar estado, atender solicitud) siguen viviendo en cada módulo. El panel enlaza.

## Por qué

`mission.md` describe explícitamente el panel del `ADMIN` como el **tablero de decisión**: sin él, el
administrador tiene que abrir cada módulo por separado y componer mentalmente el estado global. El
panel comprime esa lectura y da el "qué toca ahora". Es requisito directo del principio "priorizar
la urgencia" y prerrequisito visual de 009 (tablero público) — parte de las lecturas se reutilizarán.

## Decisiones tomadas

- **Panel es puramente de lectura y navegación.** Toda mutación se hace en el módulo dueño (005/006/
  007). Evita duplicar server actions y mantiene una sola fuente de verdad por operación.
- **Sin dashboard "libre".** No hay widgets configurables ni personalización por usuario. Es un panel
  opinado con métricas fijas para el MVP.
- **Sin gráficas complejas.** Números grandes, listas y barras de progreso simples. No se incorpora
  ninguna librería de charts en esta feature (respeta el límite duro "no añadir dependencias sin
  avisar"). Si en 009 se decide una, será una decisión conjunta.
- **Sin persistencia propia.** El panel no crea tablas ni índices; las queries agregan sobre lo que
  ya existe. Si algún cálculo resulta caro con el volumen real, se optimiza el repo del módulo dueño
  o se cachea con las herramientas nativas de Next 16 (`revalidate`, ISR).
- **`ADMIN` como única audiencia.** Otros roles ni ven ni deducen la existencia del panel. La
  protección es la de 002 (`requireRol(ADMIN)`, `proxy.ts` sobre `/panel/*`).
- **Cálculos reutilizados de los módulos.** El progreso de metas viene de `progresoDeAyuda` (006);
  las listas de solicitudes vienen de `listarSolicitudes` (007); los envíos, de `listarAyudas`
  (005). Si el panel necesita agregaciones nuevas, se añaden **como casos de uso** en el módulo
  dueño, no aquí.
- **Módulo `src/modules/panel/`** — solo con capas `application` (composición de lecturas) y `ui`
  (componentes de la vista). **Sin `domain` ni `infrastructure` propios**: no hay entidad "Panel",
  y las lecturas se apoyan en los repos existentes.

## Alcance

**Incluye**

- Ruta `/(admin)/panel` (renombra o convive con la actual `/panel` si existiera; alineado con 002).
  Server component con `requireRol(ADMIN)`.
- Casos de uso de **composición** en `src/modules/panel/application/`:
  - `obtenerResumenPanel(deps)` — devuelve un DTO con:
    - `enviosPorEstado`: `{ RECOLECTANDO, LISTO, EN_TRANSITO }` → conteos.
    - `progresoAgregadoRecolectando`: `{ metasAlCien, metasBajo, porcentajePromedio }`.
    - `solicitudesAbiertasPorUrgencia`: `{ ALTA, MEDIA, BAJA }` → conteos.
    - `aportesPendientesConteo`.
    - `sectoresTop`: top-N de `{ sector, conteo }` sobre solicitudes `ABIERTA`.
    - `enviosPrioridad`: lista de `{ ayudaId, titulo, sectorDestino, fecha, porcentaje, solicitudesAfinesConteo }`,
      ordenada por `porcentaje` desc.
- Nuevas lecturas en los módulos dueños si hacen falta (evitando que el panel escriba SQL propio):
  - **005** `contarAyudasPorEstado` (si no existe).
  - **006** ya provee `progresoDeAyuda`; añadir `contarAportesPendientes` si no existe.
  - **007** `contarSolicitudesPorUrgencia`, `sectoresTop`, `contarSolicitudesAbiertasPorSector`.
  Todas puras en aplicación, con su implementación Prisma en la infraestructura del módulo.
- UI en `src/modules/panel/ui/`: `PanelResumen`, `TarjetaMetrica`, `BloqueEnviosPrioridad`,
  `BloqueSolicitudesAbiertas`, `BloqueAportesPendientes`, `AccesosDirectos`.
- Tests (Vitest) del caso de uso `obtenerResumenPanel` con dobles en memoria de los repos que
  consume.

**No incluye**

- **Escritura** de ningún tipo (no marca aportes, no avanza estados, no cierra solicitudes). Los
  botones son enlaces a los módulos dueños.
- **Personalización** por usuario, filtros persistentes o widgets configurables.
- **Gráficas** con librerías externas. Barras simples con CSS/Tailwind si acaso.
- **Notificaciones** ni polling en tiempo real (fuera del MVP; se recarga la página).
- **Historial** o series temporales — hasta que 010 (seguimiento) y 009 (tablero público) definan qué
  vale la pena preservar.
- **Exports** (CSV/PDF) del resumen.
- **Vista para otros roles** — el panel es exclusivo del `ADMIN`.

## Criterios de aceptación

- [x] Un `ADMIN` autenticado ve en `/(admin)/panel` las tarjetas de métricas descritas
      (envíos por estado, solicitudes por urgencia, aportes pendientes, sectores top).
- [x] El bloque **"Qué envío sale primero"** lista los envíos en `RECOLECTANDO` ordenados por
      porcentaje de completitud de sus metas (descendente), con enlace al detalle.
- [x] Cada tarjeta / bloque tiene un **enlace claro** al listado del módulo correspondiente con el
      filtro aplicado (p. ej. "Solicitudes `ALTA` abiertas").
- [x] El panel **no ejecuta mutaciones**: todos los botones son links a los módulos dueños.
- [x] Un usuario **no-`ADMIN`** (o sin sesión) **no** accede a `/(admin)/panel` (protegido en
      servidor, redirige/bloquea vía `requireRol` / `proxy.ts`).
- [x] `pnpm test` cubre: `obtenerResumenPanel` compone correctamente los conteos y el orden de
      envíos por porcentaje, con dobles en memoria — en verde.
- [x] `pnpm lint` / `pnpm build` sin errores; `panel/application` **puro** (sin framework ni
      Prisma).

## Notas y riesgos

- **Dependencias:** ninguna nueva. Si aparece la tentación de añadir una librería de charts o de
  tablas, **avisar** y decidir en conjunto (límite duro).
- **Next 16:** aprovechar `revalidate` / caché nativa para el resumen. Si en producción el volumen
  hace lento el `obtenerResumenPanel`, considerar `revalidate` corto (p. ej. 30 s) o pre-render con
  ISR. **Evaluar antes de optimizar prematuramente.**
- **Acoplamiento del panel:** el panel depende de contratos de repos de 005/006/007. Si esos
  módulos cambian sus contratos, el panel se rompe. Compensa: el `application` del panel es lo único
  que hay que ajustar (dominio no existe aquí).
- **Sectores top:** el `sector` de las solicitudes es texto libre (007). Riesgo de duplicados
  semánticos ("Petare" vs "petare"). Aplicar `trim` + `toLowerCase` en el `groupBy` de sectores
  como pragmatismo, sin persistir el normalizado. Documentar la deuda.
- **Orden de envíos por porcentaje:** si dos envíos empatan, ordenar secundariamente por `fecha`
  ascendente (el más próximo primero). Definirlo en el caso de uso, no en la UI.
- **Reutilización para 009:** las agregaciones (`enviosPrioridad`, `solicitudesAbiertasPorUrgencia`,
  `sectoresTop`) son candidatas naturales al tablero público. Mantenerlas como funciones puras para
  poder reutilizarlas.
