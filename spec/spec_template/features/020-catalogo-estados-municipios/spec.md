# 020 · Catálogo de estados y municipios de Venezuela

> Estado: **Pendiente** · Depende de: `016 · Perfil de administrador`, `017 · Datos de contacto` · Enmienda: `016`, `017` · Roadmap: `constitution/roadmap.md`

## Qué hace

Sustituye los campos de ubicación en **texto libre** (`estado` + `parroquia`) por un
**catálogo cerrado** de divisiones político-territoriales de Venezuela, sembrado en la base de
datos y seleccionado en los formularios:

- **Catálogo `Estado`** — las **24 entidades** con municipios: 23 estados + Distrito Capital
  (lista explícita en `catalogo-venezuela.md`). **No** se incluyen Dependencias Federales ni
  Guayana Esequiba.
- **Catálogo `Municipio`** — los **335 municipios** de esas entidades (relación
  `Municipio.estadoId → Estado`). Listado completo y conteos por estado en
  `catalogo-venezuela.md` (fuente de verdad del seed).
- **Selects en cascada** — el usuario elige primero el estado; el listado de municipios se filtra
  por ese estado. Aplica a:
  - Registro / completar perfil / `/mi-perfil` de `COLABORADOR` y `SOLICITANTE` (enmienda 017).
  - Registro público y edición de `PerfilAdmin` (enmienda 016).
- **Persistencia por FK** — se guardan `estadoId` y `municipioId` (no strings libres). El municipio
  **debe pertenecer** al estado elegido (regla de dominio + constraint en BD).
- **Semilla (`db:seed`)** — los datos oficiales se generan/insertan en la base al sembrar; son
  de solo lectura para la app (no hay CRUD de administración del catálogo en esta feature).

## Por qué

Hoy `estado` y `parroquia` son texto libre (decisión explícita de 016/017 “hasta tener catálogo”).
Eso produce typos, nombres inconsistentes (“La Guaira” vs “Vargas” vs “vargas”) y dificulta
filtrar por zona en el panel (008), la transparencia (009) y la logística de acopio (011). El
cliente pide que **estado y municipio** sean seleccionables desde datos reales de Venezuela
persistidos en la base. Esta feature cierra esa deuda y deja la ubicación normalizada.

## Decisiones tomadas

- **Municipio, no parroquia:** el segundo nivel del catálogo es **municipio** (división
  político-territorial estándar). Se **deja de pedir parroquia** en los formularios de 016/017.
  Las columnas string `estado` / `parroquia` se migran a FKs `estadoId` / `municipioId` y luego se
  eliminan. Si en el futuro se necesita parroquia, se añade como tercer nivel o texto opcional
  sin reabrir el modelo de estado/municipio.
- **Módulo `src/modules/ubicaciones`:** catálogo transversal (lo consumen `usuarios` y, más
  adelante, `acopio`). Screaming Architecture: dominio propio, no mezclado con reglas de cédula.
- **Datos de solo lectura en runtime:** el catálogo se **siembra** (`pnpm db:seed`); la app solo
  lista y valida FKs. No hay pantalla de admin para editar estados/municipios.
- **Fuente de datos:** el listado canónico está en
  `spec/spec_template/features/020-catalogo-estados-municipios/catalogo-venezuela.md`
  (**24 entidades, 335 municipios**). Se materializa en
  `prisma/data/venezuela-estados-municipios.ts` (o JSON) y el seed lo inserta con `upsert`
  idempotente. No se llama a APIs externas en runtime. Criterio de aceptación del seed: conteos
  exactos de la tabla resumen del catálogo.
- **Cascada obligatoria:** no se puede guardar un `municipioId` cuyo `estadoId` no coincida con el
  `estadoId` del mismo registro. Validación en dominio + FK + chequeo en el caso de uso.
- **Backfill de filas existentes:** se intenta mapear los strings actuales (`estado` /
  `parroquia`) a IDs por coincidencia normalizada de nombre (case-insensitive, trim). Si no hay
  match, `estadoId`/`municipioId` quedan `null` y el guard de perfil incompleto (017) obliga a
  re-seleccionar en `/completar-perfil`. Los `PerfilAdmin` sin match deben editar el perfil antes
  de operar (o el SUPERADMIN los ve incompletos en la bandeja).
- **UI:** componentes de select reutilizables (`EstadoSelect` + `MunicipioSelect` dependiente)
  en `ubicaciones/ui`, consumidos por los formularios de `usuarios`.

## Alcance

**Incluye**

- Modelos Prisma `Estado` y `Municipio` (con `@@unique` de nombre por estado en municipio, índices
  para listados).
- Migración que:
  1. Crea las tablas del catálogo.
  2. Añade `estadoId` / `municipioId` (nullable al inicio) a `usuarios` y `perfiles_admin`.
  3. Tras el seed/backfill en la misma ventana de despliegue, elimina las columnas string
     `estado` / `parroquia` (o las elimina en una segunda migración inmediata del mismo PR).
- Seed idempotente con el catálogo de `catalogo-venezuela.md` (24 entidades, 335 municipios).
- Módulo `src/modules/ubicaciones` (domain / application / infrastructure / ui):
  - Entidades y `validarUbicacionCatalogo({ estadoId, municipioId })`.
  - Casos de uso de lectura: `listarEstados`, `listarMunicipiosPorEstado`.
  - Repositorio Prisma.
  - Componentes de select en cascada.
- Enmendar 016/017: formularios, casos de uso (`registrarUsuario`, `actualizarDatosContacto`,
  perfil admin) y guard de perfil incompleto pasan a exigir `estadoId` + `municipioId`.
- Tests de dominio (municipio debe pertenecer al estado), de listados y de los casos de uso
  enmendados.

**No incluye**

- Catálogo de **parroquias**.
- CRUD administrativo del catálogo (alta/edición/baja de estados o municipios).
- Integración con APIs externas de geografía en runtime.
- Filtros geográficos en el panel (008) o tablero (009): esta feature solo deja los datos
  normalizados; los filtros se abordan cuando esas features los pidan.
- Cambio del modelo de `PuntoAcopio` (011): documentar que heredará `estadoId`/`municipioId` del
  `PerfilAdmin`, pero el CRUD de acopio sigue en 011.

## Criterios de aceptación

- [ ] Existen tablas `estados` y `municipios` en PostgreSQL; `municipios.estadoId` es FK a
      `estados`.
- [ ] `pnpm db:seed` inserta (o actualiza) las **24 entidades** y los **335 municipios** listados
      en `catalogo-venezuela.md` (conteos por estado correctos); re-ejecutar el seed no duplica
      filas.
- [ ] En registro / completar perfil / `/mi-perfil` (COLABORADOR/SOLICITANTE) y en registro /
      edición de `PerfilAdmin`, **estado** y **municipio** son selects; el de municipio se
      habilita y filtra tras elegir estado.
- [ ] No se puede enviar un municipio que no pertenezca al estado elegido (servidor rechaza con
      mensaje en español).
- [ ] `usuarios` y `perfiles_admin` persisten `estadoId` y `municipioId`; ya no hay columnas
      string `estado` / `parroquia`.
- [ ] Usuarios o perfiles cuyo backfill no matcheó quedan incompletos y deben re-seleccionar
      ubicación (guard 017 / edición de perfil admin).
- [ ] `pnpm test` cubre validación de pertenencia y listados; `pnpm lint` / `pnpm build` OK.
- [ ] `ubicaciones/domain` y `ubicaciones/application` son **puras** (sin Prisma/framework).

## Notas y riesgos

- **Enmienda a 016 y 017:** actualizar `DOC/` de ambas para decir “estado y municipio
  seleccionables” en lugar de “texto libre / parroquia”.
- **Nombre “La Guaira”:** el estado puede figurar en fuentes antiguas como “Vargas”. El seed usa
  el nombre oficial vigente (**La Guaira**, 1 municipio: Vargas) y alias de backfill
  `"Vargas"` → mismo `estadoId`.
- **Listado explícito:** no improvisar nombres en implementación; copiar desde
  `catalogo-venezuela.md`. Si el INE publica un cambio de nombre, se actualiza ese archivo y el
  dataset del seed en el mismo PR.
- **Volumen del seed:** 24 + 335 filas; el archivo de datos vive en el repo (TypeScript/JSON
  estático).
- **Dependencias:** no se prevén paquetes nuevos. Si se considerara uno solo para el dataset,
  avisar antes (límite duro de la constitución).
