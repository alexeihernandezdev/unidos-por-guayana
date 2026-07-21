# 031 · Imágenes y documentación en solicitudes — Tareas

> Checklist de implementación. Marca conforme avanza. Orden dominio → aplicación →
> infraestructura → composición → presentación → validación.

## Config y dependencias

- [x] `pnpm add @supabase/supabase-js`.
- [x] `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`.
- [x] `next.config.ts`: `images.remotePatterns` con el host de Supabase Storage.

## Modelo de datos

- [x] `schema.prisma`: enum `TipoArchivoSolicitud`, `model ArchivoSolicitud`, relación `archivos` en `Solicitud`.
- [x] Migración `solicitud_archivos` con índice único parcial de `PRINCIPAL` (escrita a mano).
- [ ] `pnpm db:migrate` para aplicarla (requiere Docker/BD arriba; pendiente de correr en local).
- [x] `pnpm db:generate`.

## Módulo `archivos`

- [x] `domain/StoragePort.ts` (+ tipos `UrlSubidaFirmada`).
- [x] `infrastructure/SupabaseStorageAdapter.ts`.
- [x] `application/fakes.ts` (`FakeStorage`).
- [x] Barril `domain/index.ts`.

## Dominio `solicitudes`

- [x] `ArchivoSolicitud.ts` (tipos).
- [x] `Solicitud.ts`: `archivos`.
- [x] `reglasArchivos.ts` (constantes + validadores + `construirPath` + `esPathDeSolicitud`).
- [x] `domain/index.ts` exporta lo nuevo.

## Aplicación `solicitudes`

- [x] `deps.ts`: `ArchivoSolicitudDeps` + `cargarSolicitudEditableDelDueno`.
- [x] `errors.ts`: `ArchivoInvalidoError`, `LimiteArchivosError`, `ArchivoNoEncontradoError`.
- [x] `prepararSubidaArchivo.ts` (+test).
- [x] `confirmarArchivo.ts` (+test).
- [x] `eliminarArchivo.ts` (+test).
- [x] `urlsLecturaDeSolicitud.ts`.
- [x] `reglasArchivos.test.ts`.

## Infraestructura

- [x] `SolicitudRepository`: métodos de archivos.
- [x] `PrismaSolicitudRepository`: include `archivos` + métodos.
- [x] Ampliar fake de `SolicitudRepository` (application/fakes.ts).

## Composición

- [x] `src/lib/solicitudes.ts`: instanciar `SupabaseStorageAdapter`, servicios + `cargarArchivosVistaServicio`.
- [x] `@/shared/solicitudes`: re-exportar servicios y tipos.

## Presentación

- [x] Server actions: `prepararSubidaArchivoAction`, `confirmarArchivoAction`, `eliminarArchivoAction`.
- [x] `ArchivosSolicitud` (subida directa, principal + adjuntos) en la edición.
- [x] `ArchivosSolicitudVista` (render en detalles) + helper `archivos.ts`.
- [x] Detalle dueño `(app)/solicitudes/[id]`.
- [x] Detalle admin `/panel/solicitudes/[id]` (solo lectura).
- [x] Aviso en `/solicitudes/nueva` (los archivos se añaden al editar).

## Validación y cierre

- [x] `pnpm test` en verde (406 tests; 19 nuevos).
- [x] `pnpm lint` sin errores (solo warnings preexistentes).
- [x] `pnpm build` sin errores.
- [x] `DOC/features/031-imagenes-y-documentacion-en-solicitudes.md`.
- [x] `constitution/roadmap.md`: 031 movida a Hecho.
