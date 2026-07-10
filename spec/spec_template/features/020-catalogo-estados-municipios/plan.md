# 020 · Catálogo de estados y municipios — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas). Enmienda 016 y 017 (ubicación deja de ser texto libre).

## Enfoque general

Construir de **adentro hacia afuera**:
**modelo + seed del catálogo → módulo `ubicaciones` (lectura + validación) → migrar FKs en
`Usuario`/`PerfilAdmin` → enmendar formularios y casos de uso → backfill → quitar columnas
string → tests**.

> ⚠️ Antes de tocar server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md).

## 1. Modelo de datos y migración

En `prisma/schema.prisma`:

```prisma
model Estado {
  id         String      @id @default(cuid())
  codigo     String      @unique  // p. ej. "LG", "DC", "M"
  nombre     String      @unique
  municipios Municipio[]
  usuarios   Usuario[]
  perfilesAdmin PerfilAdmin[]
  @@map("estados")
}

model Municipio {
  id        String   @id @default(cuid())
  codigo    String?  // opcional, si la fuente lo trae
  nombre    String
  estadoId  String
  estado    Estado   @relation(fields: [estadoId], references: [id], onDelete: Restrict)
  usuarios  Usuario[]
  perfilesAdmin PerfilAdmin[]
  @@unique([estadoId, nombre])
  @@index([estadoId])
  @@map("municipios")
}
```

En `Usuario` y `PerfilAdmin`:

- Añadir `estadoId String?` / `municipioId String?` con FKs a `Estado` / `Municipio`.
- Tras backfill, hacerlos obligatorios en flujo (nullable en BD solo si quedan filas legacy;
  para `PerfilAdmin` nuevos, NOT NULL tras backfill si es viable).
- Eliminar columnas `estado String` y `parroquia String`.

Migración en dos pasos del mismo PR (o una migración con SQL ordenado):

1. Crear tablas + columnas FK nullable.
2. (Seed/backfill fuera de la migración Prisma, en `db:seed` o script de migrate.)
3. Drop de columnas string.

## 2. Dataset y seed

- Archivo `prisma/data/venezuela-estados-municipios.ts` (o `.json`) con la lista completa tomada
  de `catalogo-venezuela.md` (24 entidades, 335 municipios; conteos por estado de la tabla
  resumen): `{ codigo, nombre, municipios: [{ nombre, codigo? }] }[]`.
- En `prisma/seed.ts`, función `seedUbicaciones()`:
  - `upsert` por `codigo`/`nombre` de estado.
  - `upsert` de municipios por `@@unique([estadoId, nombre])`.
  - Idempotente: re-ejecutar no duplica.
- Backfill opcional en el mismo seed: para cada `Usuario`/`PerfilAdmin` con strings, buscar
  estado/municipio por nombre normalizado; si match, setear FKs. Alias: `"Vargas"` → estado
  La Guaira.

## 3. Módulo `src/modules/ubicaciones`

### domain (puro)

- Entidades `Estado`, `Municipio`.
- `UbicacionRepository` (contrato): `listarEstados()`, `listarMunicipiosPorEstado(estadoId)`,
  `obtenerMunicipio(id)`, `obtenerEstado(id)`.
- `validarUbicacionCatalogo({ estadoId, municipioId }, deps)` — ambos no vacíos; el municipio
  existe y `municipio.estadoId === estadoId`. Mensajes:
  - `"Selecciona el estado."`
  - `"Selecciona el municipio."`
  - `"El municipio no pertenece al estado seleccionado."`

### application (puro)

- `listarEstados(deps)`
- `listarMunicipiosPorEstado(deps, estadoId)`
- (Opcional) `resolverUbicacion(deps, { estadoId, municipioId })` para devolver nombres al
  mostrar en bandejas.

### infrastructure

- `PrismaUbicacionRepository`.

### ui

- `EstadoMunicipioFields` (client): dos `<Select>` en cascada; al cambiar estado, limpia
  municipio y recarga opciones (TanStack Query o props precargadas desde RSC).
- Preferir **precargar estados en el server component** y cargar municipios vía server action /
  route handler ligero `listarMunicipiosPorEstado` para no mandar los 300+ municipios al cliente
  de golpe. Alternativa aceptable: precargar todo el catálogo si el payload es pequeño (~tens of
  KB) — medir y elegir la opción más simple que cumpla performance.

## 4. Enmiendas a `usuarios` (016 / 017)

- Dominio: reemplazar `validarUbicacion({ estado, parroquia })` por delegación a
  `validarUbicacionCatalogo` (o adaptar la firma a `{ estadoId, municipioId }`).
- `registrarUsuario` / `actualizarDatosContacto` / crear-editar `PerfilAdmin`: persisten FKs.
- Guard de perfil incompleto: exige `estadoId` y `municipioId`.
- UI: sustituir inputs de texto por `EstadoMunicipioFields` en registro, completar perfil,
  `/mi-perfil`, registro admin y `/panel/perfil`.
- Bandeja SUPERADMIN y vistas de perfil: mostrar `estado.nombre` / `municipio.nombre` (join).

## 5. Tests

- Dominio: pertenencia municipio↔estado; vacíos; IDs desconocidos.
- Application: listados; registro/actualización rechazan municipio de otro estado.
- Seed (opcional smoke): tras seed, conteo de estados ≥ 24 y municipios > 300.

## 6. Validación final

- `pnpm db:migrate` + `pnpm db:seed`.
- `pnpm test` / `pnpm exec eslint src` / `pnpm build`.
- Probar cascada en UI (cambiar estado limpia municipio; submit inválido rechazado).

## Orden de implementación sugerido

1. Schema + migración (tablas + FKs nullable, aún sin drop).
2. Dataset + seed.
3. Módulo `ubicaciones` + tests.
4. Enmendar casos de uso y UI de usuarios.
5. Backfill + drop columnas string.
6. Actualizar DOC 016/017/020 y roadmap.
