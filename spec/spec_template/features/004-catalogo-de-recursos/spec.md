# 004 · Catálogo de recursos

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce el **catálogo de recursos**: la lista maestra de "qué se puede aportar o necesitar" en la
plataforma. Un **`Recurso`** es una referencia estable (agua, medicinas, alimentos, un camión, un
voluntario, una donación en USD…) con su **unidad** de medida y una **categoría**. Es el primer
módulo de dominio del flujo central y la base sobre la que, más adelante, se definen las **metas**
de un envío y se registran los **aportes**.

- **Gestión del catálogo (solo `ADMIN`)** — crear, editar y **archivar** recursos. El `ADMIN`
  mantiene una lista limpia y coherente que el resto del sistema reutiliza.
- **Categorías** — cada recurso pertenece a una de: `SUMINISTRO` (agua, alimentos, medicinas…),
  `TRANSPORTE` (camión, combustible…), `PERSONAL` (voluntarios…) o `MONETARIO` (donación en USD/Bs).
- **Unidad de medida** — texto libre (litros, cajas, unidades, vehículos, personas, USD…) porque las
  unidades varían mucho entre recursos. Aportes y metas se medirán siempre en la unidad del recurso.
- **Lectura para el resto del sistema** — el catálogo se expone para que las features siguientes
  (005 Ayudas/metas, 006 Aportes) elijan recursos existentes en vez de escribir texto libre.

## Por qué

`tech-stack.md` define el `Recurso` como la **referencia contra la que se miden metas y aportes**:
sin un catálogo estable, cada meta o aporte usaría nombres/unidades sueltos, imposibilitando sumar el
progreso ("¿estos 20 «litros de agua» cuentan para la meta de «Agua»?"). Centralizar el catálogo da
consistencia (una sola "Agua", una sola unidad), habilita el cálculo de progreso de metas y mantiene
la coherencia de la transparencia. Es requisito de las features 005–009.

## Decisiones tomadas

- **Solo `ADMIN` gestiona el catálogo.** Coherente con `mission.md` (solo el `ADMIN` administra el
  núcleo). La escritura (crear/editar/archivar) está protegida por rol en servidor, no solo en la UI.
- **Archivar en vez de borrar.** Los recursos serán referenciados por metas y aportes (005/006); un
  borrado dejaría datos huérfanos. Se usa un campo `activo` (soft-archive): un recurso archivado deja
  de ofrecerse para nuevas metas/aportes, pero se conserva para el histórico. No hay borrado físico.
- **`nombre` único** (normalizado: `trim`, comparación sin distinguir mayúsculas) para evitar
  duplicados como "Agua" / "agua ".
- **`unidad` como texto libre**, no enum: las unidades son demasiado variadas. Se valida que no esté
  vacía; su interpretación (sumar cantidades) es responsabilidad de quien define metas/aportes.
- **Módulo `src/modules/recursos/`** con las cuatro capas (domain / application / infrastructure /
  ui), siguiendo Clean + Screaming como en `usuarios`.

## Alcance

**Incluye**

- Modelo `Recurso` en Prisma: `nombre` (único), `unidad`, `categoria`
  (`SUMINISTRO` | `TRANSPORTE` | `PERSONAL` | `MONETARIO`), `descripcion` (opcional), `activo`
  (por defecto `true`), timestamps. Enum `CategoriaRecurso`. **Migración** correspondiente.
- Capa de dominio: entidad `Recurso`, enum `CategoriaRecurso`, contrato `RecursoRepository` y las
  reglas (nombre normalizado no vacío, unidad no vacía, categoría válida).
- Casos de uso (aplicación): **crear**, **listar** (con filtro por categoría / solo activos),
  **editar** y **archivar/activar** un recurso. Rechazo de `nombre` duplicado.
- Infraestructura: `PrismaRecursoRepository`.
- Presentación **solo-`ADMIN`** bajo el área de administración: **listado** del catálogo, **alta** y
  **edición** mediante formularios (React Hook Form), y acción de **archivar/activar**. Gated con el
  `requireRol(ADMIN)` de la feature 002.
- Validación en el límite (servidor) con `zod`; mensajes claros de error (p. ej. nombre duplicado).
- Tests (Vitest) de los casos de uso: rechazo de duplicado, normalización de nombre, categoría
  inválida y archivar/activar.

**No incluye**

- **Metas de recursos** (`MetaRecurso`) ni su relación con Ayudas: es la feature 005.
- **Aportes** contra recursos: feature 006.
- **Borrado físico** de recursos (solo archivar).
- Importación/exportación masiva (CSV), imágenes de recurso, ni jerarquías/etiquetas de recursos.
- Registro de **montos monetarios** recibidos (eso es 014); aquí `MONETARIO` es solo una categoría del
  catálogo (p. ej. "Donación en USD").
- Gestión del catálogo por roles distintos de `ADMIN`.

## Criterios de aceptación

- [ ] El `ADMIN` puede **crear** un recurso con `nombre`, `unidad` y `categoria` (y `descripcion`
      opcional); queda guardado y aparece en el listado.
- [ ] El sistema **rechaza** un `nombre` duplicado (validado en servidor, insensible a mayúsculas y
      espacios) con un mensaje claro.
- [ ] Solo se aceptan categorías válidas (`SUMINISTRO` | `TRANSPORTE` | `PERSONAL` | `MONETARIO`).
- [ ] El `ADMIN` puede **editar** un recurso existente (nombre, unidad, categoría, descripción).
- [ ] El `ADMIN` puede **archivar** un recurso (queda `activo = false`) y **reactivarlo**; los
      archivados no se ofrecen por defecto pero se conservan.
- [ ] El **listado** muestra los recursos del catálogo, con distinción visual de los archivados y
      posibilidad de filtrar por categoría / estado.
- [ ] Un usuario **no-`ADMIN`** (o sin sesión) **no** puede acceder a la gestión del catálogo
      (protegido en servidor; redirige/bloquea).
- [ ] La **migración** crea la tabla `recursos` y el enum sin errores.
- [ ] `pnpm test` cubre: rechazo de duplicado, normalización de nombre, categoría inválida y
      archivar/activar — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `recursos/domain` y `recursos/application` permanecen
      **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Dependencias:** no debería hacer falta ninguna nueva (`zod`, RHF, Prisma y Auth.js ya están). Si
  se valorara una tabla de datos (data-table) o una librería de iconos, **avisar** antes (límite duro).
- **Next 16:** route handlers, server actions y server components cambian respecto a versiones
  previas — leer `node_modules/next/dist/docs/` antes de codificar (AGENTS.md). El área de gestión
  vive bajo la protección por rol de la feature 002 (`requireRol`, `proxy.ts`).
- **Pureza de capas:** el `Recurso` de dominio es independiente de Prisma; el enum de dominio y el de
  Prisma comparten valores (misma unión de strings) para mapear sin casts, como en `usuarios`.
- **Unicidad e insensibilidad a mayúsculas:** la restricción `@unique` de Postgres es sensible a
  mayúsculas; la normalización (comparar en minúsculas) se hace en la aplicación al validar, y se
  guarda el nombre "tal cual" lo escribe el `ADMIN` (con `trim`). Documentar esta decisión.
- **Categoría `MONETARIO`:** aquí solo cataloga el tipo de recurso; el registro de montos recibidos y
  los medios de donación externos son la feature 014.
- **Consumo futuro:** dejar el caso de uso de **listar (solo activos)** listo para que 005/006 elijan
  recursos; no adelantar la relación con metas/aportes.
