# 033 · Imágenes y documentación en actividades — Tareas

> Checklist de implementación. Marca conforme avanza. Orden dominio → aplicación →
> infraestructura → composición → presentación → transparencia → validación.

## Config

- [x] `.env.example`: `SUPABASE_STORAGE_BUCKET_PUBLICO`.
- [x] `next.config.ts`: `images.remotePatterns` ya cubre el path público (`/storage/v1/object/**`).

## Modelo de datos

- [x] `schema.prisma`: enum `TipoArchivoActividad`, `model ArchivoActividad`, relación `archivos` en `Actividad`.
- [x] Migración `actividad_archivos` con índice único parcial de `PRINCIPAL` (escrita a mano).
- [x] `prisma migrate deploy` aplicada (BD Neon).
- [x] `pnpm db:generate`.

## Módulo `archivos` (extensión)

- [x] `domain/StoragePort.ts`: `urlPublica(path)`.
- [x] `SupabaseStorageAdapter`: bucket por constructor + `urlPublica` (`getPublicUrl`).
- [x] `application/fakes.ts`: `FakeStorage.urlPublica`.
- [x] Helpers puros compartidos en `archivos/domain/reglasArchivos.ts` (constantes + validadores + rutas).
- [x] Helpers de UI compartidos en `archivos/ui/archivos.ts` (`ACCEPT_*`, `formatearTamano`, `iconoDeContentType`).

## Dominio `actividades`

- [x] `ArchivoActividad.ts` (tipos).
- [x] `Actividad.ts`: `archivos`.
- [x] `reglasArchivos.ts` (`construirPath` + `esPathDeActividad`, sobre las constantes compartidas).
- [x] `domain/index.ts` exporta lo nuevo.

## Aplicación `actividades`

- [x] `deps.ts`: `ArchivoActividadDeps` + `cargarActividadDelDueno` (solo dueño, sin estado).
- [x] `errors.ts`: `ArchivoInvalidoError`, `LimiteArchivosError`, `ArchivoNoEncontradoError`.
- [x] `prepararSubidaArchivo.ts` (+test).
- [x] `confirmarArchivo.ts` (+test).
- [x] `eliminarArchivo.ts` (+test).
- [x] `urlsPublicasDeActividad.ts`.
- [x] `reglasArchivos.test.ts`.

## Infraestructura

- [x] `ActividadRepository`: métodos de archivos.
- [x] `PrismaActividadRepository`: include `archivos` + métodos.
- [x] Ampliar fake de `ActividadRepository`.

## Composición

- [x] `src/lib/actividades.ts`: adaptador público, servicios de archivos, vista + portada.
- [x] `@/shared/actividades`: re-exportar servicios y tipos.
- [x] Transparencia: servicios resuelven `portadaUrl` (+ adjuntos en detalle).

## Presentación

- [x] Server actions: `prepararSubidaArchivoAction`, `confirmarArchivoAction`, `eliminarArchivoAction`.
- [x] `NuevaActividadCliente` + `SelectorArchivosNueva` (subida diferida al crear).
- [x] `ArchivosActividad` (gestión en el detalle del dueño, cualquier estado).
- [x] `ArchivosActividadVista` (render en detalle colaborador).

## Transparencia (rediseño galería editorial)

- [x] DTOs: `EnvioResumenPublico.portadaUrl`, `DetallePublico.portadaUrl` + adjuntos.
- [x] `TarjetaEnvioPublico` con portada + placeholder.
- [x] `EnvioDestacado` (destacada a lo ancho con overlay).
- [x] `ResumenTransparencia` / `ListaEnviosPublicos`: layout destacada + grid.
- [x] `DetalleEnvioPublico`: hero de portada + `GaleriaAdjuntos` + documentos.

## Validación y cierre

- [x] `seed-dev`: una imagen `PRINCIPAL` y una `ADJUNTO` por actividad demo, carga idempotente al bucket público (código; requiere `SUPABASE_*` + bucket público para ejecutarse).
- [x] `pnpm test` en verde (451 tests; 21 nuevos).
- [x] `pnpm lint` sin errores (solo 1 warning preexistente en `acopio`).
- [x] `pnpm build` sin errores.
- [x] `DOC/features/033-imagenes-y-documentacion-en-actividades.md`.
- [x] `constitution/roadmap.md`: 033 movida a Hecho.
