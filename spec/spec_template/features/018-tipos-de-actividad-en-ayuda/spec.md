# 018 · Tipos de actividad en Ayuda (envío / jornada / evento social)

> Estado: **Pendiente** · Enmienda: `005 · Ayudas / Envío` · Depende de: `005 · Ayudas / Envío` · Roadmap: `constitution/roadmap.md`

## Qué hace

Añade a la **entidad central** (la **Ayuda**) un campo **`tipo`** que distingue tres clases de
actividad: **`ENVIO`**, **`JORNADA`** y **`EVENTO_SOCIAL`**. No se crea una entidad nueva ni un módulo
aparte: es la **misma** Ayuda, con el **mismo** modelo (comparte `MetaRecurso`, aportes, seguimiento y
la máquina de estados `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`). El `tipo` solo cambia **cómo se
nombra la acción de crear** y **cómo se presentan** los textos (labels y copys) en alta, listado y
detalle.

- **El `tipo` se elige al crear (solo `ADMIN`).** Al iniciar el alta, el `ADMIN` selecciona qué tipo de
  actividad va a crear; a partir de ahí la pantalla adapta su título y sus etiquetas (p. ej. "Crear
  envío", "Crear jornada" o "Crear evento social").
- **Un solo modelo, tres presentaciones.** Las tres comparten metas de recursos, aportes de
  colaboradores, seguimiento y el mismo ciclo de vida. Lo único que cambia es el vocabulario visible.
- **Listado con el tipo visible y filtrable.** El listado de gestión muestra el `tipo` de cada Ayuda y
  permite **filtrar por tipo** (además del filtro por estado que ya existe de la feature 005).
- **Detalle presentado según el tipo.** La cabecera del detalle usa el nombre del tipo correspondiente
  en su título y etiquetas.
- **Migración con backfill.** Las Ayudas que ya existen se consideran **`ENVIO`** por defecto.

## Por qué

El cliente amplió el alcance: la plataforma no solo coordina **envíos** de suministros, sino también
**jornadas** (p. ej. de recolección o atención) y **eventos sociales**. `mission.md` y `tech-stack.md`
ya recogen que la Ayuda tiene `tipo ∈ ENVIO | JORNADA | EVENTO_SOCIAL` y que el tipo cambia cómo se
nombra y presenta la acción de crear, **compartiendo** metas, aportes y seguimiento. Modelar esto como
tres entidades separadas duplicaría el ciclo de vida, los aportes y la trazabilidad sin aportar valor:
son la misma cosa con distinto rótulo. Un único campo `tipo` mantiene el dominio simple y reutiliza
todo lo construido en 005–010.

## Decisiones tomadas

- **`tipo` es un campo de la Ayuda, no una entidad nueva.** Se añade `tipo: TipoActividad` al modelo
  `Ayuda`; no hay tablas ni módulos adicionales. El módulo sigue siendo `src/modules/ayudas`.
- **`TipoActividad ∈ ENVIO | JORNADA | EVENTO_SOCIAL` como dominio puro**, igual que `EstadoAyuda`:
  const-object + unión de tipos, sin dependencias de framework ni Prisma.
- **El `tipo` se fija al crear y no cambia después.** Es una propiedad de identidad de la actividad; no
  se ofrece "convertir" un envío en jornada. (Si en el futuro se necesitara, se aborda como cambio
  aparte.) La cabecera editable en `RECOLECTANDO` (destino, fecha, título, descripción) **no** incluye
  el `tipo`.
- **El `tipo` no altera la máquina de estados ni las metas.** Las tres clases avanzan por la misma
  secuencia `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO` y definen sus `MetaRecurso` igual. No se
  ramifica la lógica por tipo en dominio salvo el propio valor del campo.
- **Backfill a `ENVIO`.** La migración da valor por defecto `ENVIO` a las filas existentes (coherente
  con que 005 nació hablando de "envíos"). El `@default(ENVIO)` cubre además futuras altas sin `tipo`
  explícito, pero la UI siempre pide elegirlo.
- **Presentación por tipo centralizada.** Los textos por tipo (nombre singular para títulos y botones,
  etiqueta para badges) viven en un único mapa de presentación en `ayudas/ui` (junto a `estados.ts`),
  para no esparcir copys por las pantallas.
- **Filtro por tipo en el listado**, combinable con el filtro por estado existente.

## Alcance

**Incluye**

- Modelo Prisma (enmienda de 005):
  - `enum TipoActividad { ENVIO JORNADA EVENTO_SOCIAL }`.
  - En `model Ayuda`: campo `tipo TipoActividad @default(ENVIO)`.
  - **Migración** `add_tipo_actividad` que crea el enum, añade la columna y **backfillea** las filas
    existentes a `ENVIO`.
- Dominio (`src/modules/ayudas/domain`):
  - `TipoActividad` (const-object + unión, mismos valores que Prisma).
  - Añadir `tipo: TipoActividad` a la entidad `Ayuda` y a `NuevaAyuda`. El `tipo` **no** entra en
    `CambiosAyuda` (no editable tras el alta).
  - Ajustar validaciones para exigir un `tipo` válido al crear.
- Aplicación (`src/modules/ayudas/application`):
  - `crearAyuda` acepta y valida `tipo`; lo persiste en el alta.
  - `listarAyudas` acepta un **filtro por `tipo`** (opcional), combinable con el filtro por estado.
  - `obtenerAyuda` devuelve el `tipo` (ya incluido en la entidad).
- Infraestructura (`src/modules/ayudas/infrastructure`):
  - `PrismaAyudaRepository` mapea `tipo` en lectura/escritura y aplica el filtro por `tipo` al listar.
- Presentación (`src/modules/ayudas/ui` + `src/app`, solo `ADMIN`):
  - **Alta**: selección del `tipo` al crear y textos (título de pantalla, botón, labels) adaptados. El
    nombre de la acción se **renombra** según el tipo ("Crear envío" / "Crear jornada" / "Crear evento
    social").
  - **Listado**: columna/etiqueta de `tipo` y **filtro por tipo** junto al de estado.
  - **Detalle**: cabecera presentada con el vocabulario del tipo.
  - Mapa de presentación por tipo (nombre singular + etiqueta de badge) en `ayudas/ui`.
- Tests (Vitest): validación de `tipo` al crear (válido/ inválido), `listarAyudas` con filtro por tipo,
  y que el `tipo` no se altera al editar la cabecera.

**No incluye**

- **Cambiar el `tipo` de una Ayuda ya creada** ni "convertir" entre tipos.
- **Lógica de negocio distinta por tipo** (metas, aportes, estados o trazabilidad diferentes): el ciclo
  de vida y las reglas son idénticos; solo cambia la presentación.
- **Iconos, colores o layouts propios por tipo** más allá del texto (labels/copys). Si se quisiera
  diferenciación visual mayor, se trata como mejora de diseño aparte.
- Cambios en **Aportes** (006), **Solicitudes** (007), **Panel** (008), **Transparencia** (009) o
  **Seguimiento** (010) más allá de reflejar el nombre por tipo si esas superficies muestran el título
  de la Ayuda (no es requisito de esta feature).

## Criterios de aceptación

- [ ] El `ADMIN` **elige el `tipo`** (`ENVIO` | `JORNADA` | `EVENTO_SOCIAL`) al iniciar el alta, y la
      pantalla **renombra** su título y botón según el tipo ("Crear envío" / "Crear jornada" / "Crear
      evento social").
- [ ] La Ayuda creada **persiste su `tipo`**; el resto del flujo (metas, estado inicial `RECOLECTANDO`,
      edición en `RECOLECTANDO`, avance de estado) funciona **igual que en 005**, sin ramificar por tipo.
- [ ] El **`tipo` no es editable** tras el alta: la edición de cabecera en `RECOLECTANDO` no lo cambia
      (validado en servidor).
- [ ] El **listado** muestra el `tipo` de cada Ayuda y permite **filtrar por tipo**, de forma
      **combinable** con el filtro por estado existente.
- [ ] El **detalle** presenta la cabecera con el vocabulario del tipo correspondiente.
- [ ] La **migración** crea el enum `TipoActividad`, añade la columna `tipo` y **backfillea** todas las
      Ayudas existentes a `ENVIO`, sin errores ni filas con `tipo` nulo.
- [ ] Un usuario **no-`ADMIN`** (o sin sesión) sigue **sin** poder crear ni gestionar Ayudas
      (protección de 002 intacta).
- [ ] `pnpm test` cubre: creación con `tipo` válido e inválido, filtro por tipo en el listado, e
      inmutabilidad del `tipo` al editar cabecera — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `ayudas/domain` y `ayudas/application` permanecen
      **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Dependencias:** ninguna nueva (Prisma, zod, RHF, Auth.js, Luxon ya están). Si se valorara algo más,
  **avisar**.
- **Enmienda a 005, no reescritura:** se reutilizan entidad, casos de uso, repositorio y UI existentes;
  el cambio es aditivo. Cuidar que los tests de 005 sigan en verde tras añadir `tipo`.
- **Backfill seguro:** la migración debe rellenar `ENVIO` en las filas previas antes (o a la vez que)
  fijar `NOT NULL`; el `@default(ENVIO)` evita nulos en altas futuras. Documentar el paso de backfill en
  la migración.
- **Presentación centralizada:** mantener los textos por tipo en un solo mapa (`ayudas/ui`) evita
  copys inconsistentes entre alta, listado y detalle. Prohibido em-dash (`—`) y en-dash (`–`) en esos
  textos visibles (ver `constitution/tech-stack.md`).
- **Fechas:** sin cambios respecto a 005; `fecha` se guarda en UTC y se formatea con **Luxon** en locale
  `es-VE` (`DD/MM/AAAA`).
- **Next 16:** las server actions y server components de la gestión ya existen (005); leer
  `node_modules/next/dist/docs/` antes de tocarlas (AGENTS.md). La gestión sigue bajo `requireRol(ADMIN)`
  y el área `/panel`.
