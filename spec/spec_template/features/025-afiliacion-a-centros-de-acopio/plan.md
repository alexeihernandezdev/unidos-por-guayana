# 025 · Plan de implementación

> Deriva de `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, dominio puro,
> sin em-dash/en-dash en texto visible, Next 16). Depende de 024 (entidad `Actividad` ya renombrada).

## Decisiones técnicas

- **Categorías del colaborador: array de enum nativo.** `Usuario.categoriasAporte CategoriaRecurso[]`
  (Postgres enum array), no tabla puente. Es una capacidad de la persona (no una relación N a N con otra
  entidad), el conjunto es pequeño y fijo (4 valores) y evita un join extra. La regla "al menos una" se
  valida en la aplicación (una FK sola no lo garantiza). Default `[]` en base.
- **Afiliación: tabla puente sin estado.** `model Afiliacion { id, colaboradorId, adminId, createdAt }`
  con `@@unique([colaboradorId, adminId])`. Existir la fila = afiliado; remover = borrar la fila
  (re-afiliarse permitido, sin estado `REMOVIDA`). Dos FKs a `Usuario` con relaciones nombradas
  (`ColaboradorAfiliaciones`, `AdminRed`).
- **Módulo nuevo `src/modules/afiliaciones`** (domain/application/infrastructure/ui) para la `Afiliacion`,
  "su red", conteo de aptos y destinatarios de convocatoria. La **declaración de categorías** vive en el
  módulo `usuarios` (es un dato del `Usuario`): se añade `categoriasAporte` a la entidad, al
  `UsuarioRepository` y a `registrarUsuario`.
- **Convocatoria (012) desacoplada.** 012 (`Notificacion`) aún no existe. Esta feature implementa y prueba
  el **cálculo de destinatarios** (`listarDestinatariosConvocatoria`: afiliados verificados cuya categoría
  intersecta las categorías de los recursos de la Actividad). El **envío** del aviso se deja a 012, cuya
  spec se actualiza para nacer con este destinatario. No se toca `crearActividad` con un hook de envío
  (no hay a dónde enviar todavía).
- **Registro:** el paso de **categorías es obligatorio** (checkboxes en el registro de `COLABORADOR`). La
  **afiliación a centros es opcional y se completa desde `/mi-perfil`** (descubrir centros, afiliarse,
  ver/dejar afiliaciones); así el colaborador "queda registrado sin afiliaciones y las completa después",
  que es exactamente el resultado omitible que pide la spec, sin bloquear el alta.

## Modelo Prisma / migración

- `Usuario`: `categoriasAporte CategoriaRecurso[]` + relaciones inversas `afiliaciones`, `red`.
- `model Afiliacion` con `@@unique`, índices por `colaboradorId` y `adminId`, FKs `onDelete: Cascade`.
- Migración: `CREATE TABLE "afiliaciones"` + `ADD COLUMN "categoriasAporte" ... DEFAULT ARRAY[]`.
- `prisma/seed.ts`: los colaboradores de prueba reciben categorías de ejemplo (backfill vía seed).

## Dominio (`afiliaciones/domain`) — puro
- `Afiliacion` (id, colaboradorId, adminId, createdAt).
- `reglas.ts`: `intersectanCategorias(a, b)`, `categoriasValidas(cats)` (no vacío, sin duplicados,
  todas del enum), `perteneceARed(afiliacion, adminId)`.
- `AfiliacionRepository`: `afiliar`, `remover`, `existe`, `listarPorColaborador`,
  `listarRedDeAdmin(adminId, filtroCategoria?)` (devuelve colaborador + categorías + verificación +
  contacto), `contarAptosPorCategoria(adminId)`, `listarDestinatarios(adminId, categorias)`.
- `CentroDisponible` (admin verificado + PerfilAdmin + puntos activos) como tipo de lectura; su lectura
  se resuelve con un puerto `LectorCentrosDisponibles`.

## Aplicación (`afiliaciones/application`)
- `afiliarseACentro`, `removerDeRed` (propiedad → `NoAutorizadoError`), `listarMiRed`,
  `contarAptosPorRecurso`/`contarAptosPorCategoria`, `listarCentrosDisponibles`,
  `listarDestinatariosConvocatoria`. Errores: `NoAutorizadoError`, `CategoriasVaciasError`.
- `usuarios/application`: `declararCategorias(deps, colaboradorId, categorias)` +
  `registrarUsuario` exige categorías no vacías para `COLABORADOR`.

## Presentación
- Registro `COLABORADOR`: fieldset de categorías (obligatorio, 4 checkboxes).
- `/mi-perfil`: editar categorías declaradas + gestionar afiliaciones (lista de centros verificados
  filtrable por estado/municipio, expandible a puntos activos; afiliarse/dejar).
- `/panel/red` (ADMIN): red del admin (nombre, categorías, verificación, teléfono/WhatsApp), filtro por
  categoría, acción remover.
- Form de crear/editar Actividad: al elegir el recurso de una meta, conteo de aptos por categoría
  (número), precomputado por categoría y pasado al form.

## Validación
- Vitest: unicidad de afiliación, remover + re-afiliar, propiedad al remover, intersección de categorías,
  conteo de aptos (solo verificados), categorías no vacías, destinatarios de convocatoria.
- `pnpm exec eslint src`, `pnpm build`, migración `prisma migrate deploy` + `prisma generate` + seed.
