# 033 · Imágenes y documentación en actividades — Tareas

> Checklist de implementación. Marca conforme avanza. Orden dominio → aplicación →
> infraestructura → composición → presentación → transparencia → validación.

## Config

- [ ] `.env.example`: `SUPABASE_STORAGE_BUCKET_PUBLICO`.
- [ ] `next.config.ts`: verificar `images.remotePatterns` cubre el path de objeto público de Supabase.

## Modelo de datos

- [ ] `schema.prisma`: enum `TipoArchivoActividad`, `model ArchivoActividad`, relación `archivos` en `Actividad`.
- [ ] Migración `actividad_archivos` con índice único parcial de `PRINCIPAL` (escrita a mano).
- [ ] `pnpm db:migrate` para aplicarla (requiere Docker/BD arriba, puerto 5435).
- [ ] `pnpm db:generate`.

## Módulo `archivos` (extensión)

- [ ] `domain/StoragePort.ts`: `urlPublica(path)`.
- [ ] `SupabaseStorageAdapter`: bucket por constructor + `urlPublica` (`getPublicUrl`).
- [ ] `application/fakes.ts`: `FakeStorage.urlPublica`.
- [ ] Helpers puros compartidos en `archivos/domain/reglasArchivos.ts` (constantes + validadores + `extensionDe`).
- [ ] Helpers de UI compartidos en `archivos/ui` (`subirArchivoDirecto`, `archivos.ts`).

## Dominio `actividades`

- [ ] `ArchivoActividad.ts` (tipos).
- [ ] `Actividad.ts`: `archivos`.
- [ ] `reglasArchivos.ts` (`construirPath` + `esPathDeActividad`, sobre las constantes compartidas).
- [ ] `domain/index.ts` exporta lo nuevo.

## Aplicación `actividades`

- [ ] `deps.ts`: `ArchivoActividadDeps` + `cargarActividadDelDueno` (solo dueño, sin estado); `storage` en deps.
- [ ] `errors.ts`: `ArchivoInvalidoError`, `LimiteArchivosError`, `ArchivoNoEncontradoError`.
- [ ] `prepararSubidaArchivo.ts` (+test).
- [ ] `confirmarArchivo.ts` (+test).
- [ ] `eliminarArchivo.ts` (+test).
- [ ] `urlsPublicasDeActividad.ts`.
- [ ] `reglasArchivos.test.ts` (actividades + archivos según haga falta).

## Infraestructura

- [ ] `ActividadRepository`: métodos de archivos.
- [ ] `PrismaActividadRepository`: include `archivos` + métodos.
- [ ] Ampliar fake de `ActividadRepository`.

## Composición

- [ ] `src/lib/actividades.ts`: instanciar adaptador público, servicios de archivos.
- [ ] `@/shared/actividades`: re-exportar servicios y tipos.
- [ ] Transparencia: servicios resuelven `portadaUrl` (+ adjuntos en detalle).

## Presentación

- [ ] Server actions: `prepararSubidaArchivoAction`, `confirmarArchivoAction`, `eliminarArchivoAction`.
- [ ] `NuevaActividadCliente` + `SelectorArchivosNueva` (subida diferida al crear).
- [ ] `ArchivosActividad` (gestión en el detalle del dueño, cualquier estado).
- [ ] `ArchivosActividadVista` (render en detalle colaborador).

## Transparencia (rediseño galería editorial)

- [ ] DTOs: `EnvioResumenPublico.portadaUrl`, `DetallePublico.portadaUrl` + adjuntos.
- [ ] `TarjetaEnvioPublico` con portada + overlay.
- [ ] `EnvioDestacado` (destacada a lo ancho).
- [ ] `ResumenTransparencia` / `ListaEnviosPublicos`: layout destacada + grid; `TotalesImpacto` como stats.
- [ ] `DetalleEnvioPublico`: hero de portada + `GaleriaAdjuntos` + documentos.

## Validación y cierre

- [ ] `seed-dev`: una imagen `PRINCIPAL` y una `ADJUNTO` por actividad demo, carga idempotente al bucket público.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` sin errores nuevos.
- [ ] `pnpm build` sin errores.
- [ ] `DOC/features/033-imagenes-y-documentacion-en-actividades.md`.
- [ ] `constitution/roadmap.md`: 033 movida a Hecho.
