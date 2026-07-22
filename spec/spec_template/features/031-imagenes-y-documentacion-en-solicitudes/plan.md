# 031 · Imágenes y documentación en solicitudes — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, pureza de
> capas, convenciones y límites duros). De adentro hacia afuera: dominio → aplicación → infraestructura →
> composición → presentación → tests.

## Enfoque general

Primera feature del proyecto que sube archivos de usuario. Dos partes:

1. **Infraestructura de almacenamiento reutilizable** — módulo nuevo `src/modules/archivos` con un puerto
   puro `StoragePort` y un único adaptador real `SupabaseStorageAdapter` (`@supabase/supabase-js`, service
   role solo servidor). Bucket privado; URLs firmadas de subida y de lectura.
2. **Archivos en solicitudes** — modelo `ArchivoSolicitud` (`PRINCIPAL` | `ADJUNTO`), casos de uso
   `prepararSubidaArchivo` / `confirmarArchivo` / `eliminarArchivo` / `urlsLecturaDeSolicitud`, y UI en
   `SolicitudForm` + los dos detalles.

Flujo de subida (esquiva el tope de 4.5 MB de Vercel): el cliente valida → `prepararSubidaArchivoAction`
valida (dueño, `ABIERTA`, tipo, tamaño, cupo) y devuelve URL firmada → el navegador sube **directo** a
Supabase → `confirmarArchivoAction` persiste la fila.

Orden: **dep + config → migración → módulo `archivos` (puerto + adaptador + fake) → dominio solicitudes
(tipos + reglas) → aplicación (+tests) → infraestructura (repo Prisma) → composición → presentación →
validación**.

> ⚠️ Antes de tocar server actions / server components de Next 16, leer `node_modules/next/dist/docs/`
> (AGENTS.md). La protección por rol reutiliza `requireRol` (002/021) y `esEditable` (007).

## 1. Dependencia y configuración

- `pnpm add @supabase/supabase-js` (avisado, constitución § "No añadir deps sin avisar").
- `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`.
- `next.config.ts`: añadir a `images.remotePatterns` el host `*.supabase.co` (path `/storage/v1/object/sign/**`).

## 2. Modelo de datos y migración

- `prisma/schema.prisma`:
  - `enum TipoArchivoSolicitud { PRINCIPAL ADJUNTO }`.
  - `model ArchivoSolicitud { id, solicitudId, solicitud (onDelete: Cascade), tipo, path, nombreOriginal, contentType, tamanoBytes Int, createdAt, @@index([solicitudId]) }`.
  - `model Solicitud`: relación inversa `archivos ArchivoSolicitud[]`.
- Migración `solicitud_archivos` (`pnpm db:migrate --name solicitud_archivos`, Docker arriba, puerto 5435):
  crea enum + tabla y el **índice único parcial**:
  `CREATE UNIQUE INDEX "archivos_solicitud_principal_unico" ON "archivos_solicitud"("solicitudId") WHERE "tipo" = 'PRINCIPAL';`
- `pnpm db:generate`.

## 3. Módulo `archivos` (`src/modules/archivos`)

- `domain/StoragePort.ts` — puro, sin framework:
  - `crearUrlSubidaFirmada(path, contentType): Promise<UrlSubidaFirmada>` (`{ url, metodo, headers? }` o token).
  - `crearUrlLecturaFirmada(path, expiraSegundos): Promise<string>`.
  - `eliminar(paths: string[]): Promise<void>`.
- `infrastructure/SupabaseStorageAdapter.ts` — cliente Supabase con service role (lee env en servidor);
  usa `createSignedUploadUrl`, `createSignedUrl`, `remove`. Bucket desde `SUPABASE_STORAGE_BUCKET`.
- `application/fakes.ts` — `FakeStorage` en memoria (registra subidas/lecturas/borrados) para tests.
- `index.ts` barriles por capa.

## 4. Dominio `solicitudes` (`src/modules/solicitudes/domain`) — puro

- `ArchivoSolicitud.ts`: `TipoArchivoSolicitud`, tipo `ArchivoSolicitud` (`id, tipo, path, nombreOriginal, contentType, tamanoBytes, createdAt`), `NuevoArchivoSolicitud`.
- `Solicitud.ts`: `Solicitud` gana `archivos: ArchivoSolicitud[]`.
- `reglasArchivos.ts` (puro):
  - Constantes: `MAX_ADJUNTOS = 10`, `MAX_BYTES_PRINCIPAL = 5 MB`, `MAX_BYTES_ADJUNTO = 10 MB`,
    `TIPOS_IMAGEN` (`image/jpeg`,`image/png`,`image/webp`), `TIPOS_ADJUNTO` (imagen + `application/pdf`,
    `application/msword`, `.../vnd.openxmlformats-officedocument.wordprocessingml.document`).
  - `esImagenPrincipalValida(contentType, bytes)`, `esAdjuntoValido(contentType, bytes)`,
    `puedeAgregarAdjunto(cantidadActual)`, `extensionDe(contentType)`, `construirPath(solicitudId, tipo, uuid, contentType)`.
- Barril `domain/index.ts` exporta lo nuevo.

## 5. Aplicación (`src/modules/solicitudes/application`)

- `deps.ts`: `SolicitudDeps` gana `storage: StoragePort`. (Los casos de uso existentes no lo usan.)
- `errors.ts`: `ArchivoInvalidoError`, `LimiteArchivosError`.
- `prepararSubidaArchivo(deps, input, actorId)`: carga solicitud, valida dueño + `ABIERTA`, valida
  tipo/tamaño según `tipo`, valida cupo (principal: siempre reemplaza; adjunto: `< MAX_ADJUNTOS`); genera
  `uuid` + `path`; devuelve `{ path, subida }` con la URL firmada.
- `confirmarArchivo(deps, input, actorId)`: revalida dueño + `ABIERTA` + tipo/tamaño; si `PRINCIPAL` y ya
  existe, borra el objeto anterior y su fila; persiste `ArchivoSolicitud`.
- `eliminarArchivo(deps, archivoId, actorId)`: valida dueño + `ABIERTA`; borra objeto (StoragePort) + fila.
- `urlsLecturaDeSolicitud(deps, solicitud)`: mapea archivos a `{ ...archivo, url }` con URL firmada (~1 h).
- El `uuid` se genera con `crypto.randomUUID()` (Node/edge estándar; se puede inyectar en tests).

## 6. Infraestructura (`src/modules/solicitudes/infrastructure`)

- `PrismaSolicitudRepository`:
  - `INCLUDE_RECURSOS` gana `archivos: { orderBy: { createdAt: "asc" } }`; el mapeo incluye `archivos`.
  - `crearArchivo(nuevo)`, `eliminarArchivo(id)`, `contarAdjuntos(solicitudId)`,
    `obtenerArchivoPrincipal(solicitudId)`, `buscarArchivoPorId(id)`.
- `SolicitudRepository` (dominio) declara esos métodos.

## 7. Composición (`src/lib/solicitudes.ts` + `@/shared/solicitudes`)

- Instanciar `SupabaseStorageAdapter` y añadirlo a `deps`.
- Exponer `prepararSubidaArchivoServicio`, `confirmarArchivoServicio`, `eliminarArchivoServicio`,
  `urlsLecturaDeSolicitudServicio`.

## 8. Presentación

- Server actions en `(app)/solicitudes/actions.ts`: `prepararSubidaArchivoAction`, `confirmarArchivoAction`,
  `eliminarArchivoAction` (todas `requireRol(SOLICITANTE)` + traducción de errores). Zod para inputs.
- `SolicitudForm`: nuevos props opcionales `solicitudId?`, `archivosIniciales?`. Sub-componente
  `ArchivosSolicitud` (client) con dropzone de imagen principal (preview) y lista de adjuntos (progreso,
  quitar). Sube vía `fetch`/`uploadToSignedUrl` directo a Supabase. Solo visible en modo edición
  (cuando hay `solicitudId` y la solicitud es editable); en "nueva" se explica que los archivos se añaden
  tras crear (el form de nueva no tiene id todavía).
- Detalles (`(app)/solicitudes/[id]` y `/panel/solicitudes/[id]`): sección "Imagen y documentación" que
  resuelve `urlsLecturaDeSolicitudServicio` en el server component y renderiza imagen principal
  (`next/image`) + lista de adjuntos descargables. Componente compartido `ArchivosSolicitudVista`.

## 9. Tests (Vitest)

- `reglasArchivos.test.ts`: límites de tamaño/tipo, cupo, extensiones, `construirPath`.
- `prepararSubidaArchivo.test.ts`: rechaza no-dueño, no `ABIERTA`, tipo/tamaño inválidos, adjunto nº 11;
  acepta válido y pide URL al `FakeStorage`.
- `confirmarArchivo.test.ts`: reemplazo de principal borra la anterior (objeto + fila); persiste metadatos.
- `eliminarArchivo.test.ts`: solo dueño + `ABIERTA`; borra objeto y fila.
- Fakes: `FakeStorage` (archivos/application) y ampliación del fake de `SolicitudRepository`.

## 10. Validación

- `pnpm test`, `pnpm lint`, `pnpm build`. Comprobar que `solicitudes/domain`, `solicitudes/application` y
  `archivos/domain` quedan puras (sin Prisma ni framework). La subida real a Supabase requiere
  `SUPABASE_*` configuradas; en local sin ellas el resto de la solicitud funciona.

## 11. Datos demo para el grid

- `prisma/seed-dev.ts` reutiliza imágenes válidas de `public/assets`, asigna de forma determinista una
  `PRINCIPAL` y una `ADJUNTO` a cada solicitud demo, y sube los objetos al bucket con `upsert`.
- Las filas `ArchivoSolicitud` usan ids y paths estables para que reejecutar el seed actualice los mismos
  20 archivos en vez de duplicarlos.
- Si ninguna variable `SUPABASE_*` está presente, se omite solo esta parte con un aviso. Una configuración
  parcial se considera un error para evitar sembrar metadatos o archivos incompletos.
