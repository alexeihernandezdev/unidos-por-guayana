# 031 · Imágenes y documentación en solicitudes

> Estado: **En curso** · Enmienda: `007 · Solicitudes de ayuda` · Depende de: `007`, `021` · Roadmap: `constitution/roadmap.md`

## Qué hace

Permite que el `SOLICITANTE` dueño de una solicitud adjunte **una imagen principal** (portada visual de la situación) y **una lista de documentos de apoyo** (imágenes, PDF y `.doc/.docx`) mientras la solicitud está `ABIERTA`. Los archivos se muestran en el detalle de la solicitud dentro del espacio con sesión: al **dueño** (`(app)/solicitudes/[id]`) y al **`ADMIN`** que la evalúa (`/panel/solicitudes/[id]`).

- **Imagen principal (0 o 1).** Una sola imagen que encabeza la solicitud y le da contexto visual de un vistazo (la zona afectada, el estado de una vivienda, etc.). Se muestra destacada en ambos detalles.
- **Documentación (0 a 10 adjuntos).** Archivos de respaldo que sustentan la petición (presupuestos, informes médicos, fotos adicionales, listados). Se muestran como una lista descargable con ícono por tipo, nombre y tamaño.

Es la primera feature del proyecto que sube archivos de usuario, así que introduce también la **infraestructura de almacenamiento** (Supabase Storage) tras una abstracción de dominio, reutilizable por features futuras.

## Por qué

`mission.md` pone al `SOLICITANTE` como origen de la ayuda: describe una necesidad para que el `ADMIN` decida qué enviar. Hoy la solicitud es solo texto (`sector`, `urgencia`, `descripcion`, recursos), y el `ADMIN` no tiene forma de **ver** ni **verificar** la situación real. Una foto de la zona y documentos de respaldo:

1. **Dan contexto que el texto no transmite.** Una imagen de la vivienda o del sector comunica la urgencia mejor que un párrafo.
2. **Sustentan la decisión del `ADMIN`.** Un presupuesto, un informe o un listado permiten evaluar y priorizar con evidencia, no solo con la palabra del solicitante.
3. **Elevan la confianza.** La transparencia que la misión busca empieza por poder respaldar lo que se pide.

## Decisiones tomadas

- **Un solo modelo `ArchivoSolicitud` con `tipo` (`PRINCIPAL` | `ADJUNTO`), no un scalar suelto.** Guardar solo una ruta perdería metadatos (nombre original, tipo MIME, tamaño) que la UI necesita para listar y descargar bien. Una tabla rica cubre imagen principal y adjuntos con una sola forma y queda lista para reutilizar.
- **Máx 1 `PRINCIPAL` por solicitud, garantizado en base.** Índice único parcial `(solicitudId) WHERE tipo = 'PRINCIPAL'` (SQL crudo en la migración) además de la validación en el caso de uso. La invariante no depende solo de la aplicación.
- **Subida directa cliente → Supabase con URLs firmadas de subida.** El server action valida (dueño, estado `ABIERTA`, tipo, tamaño, cupo) y devuelve una URL firmada; el navegador sube el archivo **directo a Supabase** y luego un segundo action persiste la fila. Evita el tope de ~4.5 MB de las funciones serverless de Vercel, que bloquearía adjuntos de 10 MB. El passthrough por `FormData` se descartó por ese tope.
- **Bucket privado + URLs firmadas de lectura (~1 h).** Los archivos no son de acceso público en internet: se sirven solo con sesión, mediante URLs de lectura firmadas generadas en el servidor al renderizar el detalle. Respeta la decisión "visibles solo dentro de la app". No se crea ninguna página pública sin sesión ni se toca la transparencia (009).
- **Abstracción de almacenamiento (`StoragePort`) con un único adaptador real (Supabase).** El dominio define un puerto puro; la infraestructura implementa el adaptador con `@supabase/supabase-js` usando la **service role key solo en servidor**. Los tests usan un fake del puerto. Mantiene el dominio limpio y swappable sin duplicar caminos de subida.
- **Local dev usa el mismo Supabase cloud para storage.** El Docker Postgres sigue siendo solo la BD; para archivos, el entorno local apunta a un proyecto Supabase (env `SUPABASE_*` en `.env.local`). Se evita mantener un adaptador de disco local en paralelo.
- **El seed de desarrollo incluye una galería mínima por solicitud.** Cada solicitud demo recibe dos imágenes deterministas: una `PRINCIPAL` para la portada del grid y una `ADJUNTO` para probar composiciones con más de una imagen. Los binarios reutilizan assets locales del repositorio y se suben con `upsert` al bucket configurado; sin configuración de Storage, el seed conserva el escenario de datos y avisa que omitió los archivos.
- **Solo el dueño sube y solo mientras `ABIERTA`.** La gestión de archivos se habilita bajo la misma regla `esEditable(estado)` que el resto de la edición de la solicitud. El `ADMIN` los ve en solo lectura; no sube ni borra. Los colaboradores no tienen vista de solicitudes, así que no aplican.
- **Borrado consistente.** Quitar un archivo borra el objeto en Storage y luego la fila. Al eliminarse la solicitud, la cascada borra las filas `ArchivoSolicitud`; la limpieza de los objetos huérfanos en Storage se hace en el mismo flujo de borrado de solicitud (no se delega a un job).

## Alcance

**Incluye**

- **Modelo Prisma:**
  - Enum `TipoArchivoSolicitud { PRINCIPAL, ADJUNTO }`.
  - `model ArchivoSolicitud { id, solicitudId → Solicitud (onDelete: Cascade), tipo, path, nombreOriginal, contentType, tamanoBytes Int, createdAt }`, `@@index([solicitudId])`.
  - Relación inversa `archivos ArchivoSolicitud[]` en `model Solicitud`.
  - **Migración** `solicitud_archivos`: crea enum y tabla, y añade el **índice único parcial** de `PRINCIPAL` vía SQL crudo.
- **Módulo de almacenamiento** (`src/modules/archivos`, screaming + clean):
  - `domain/StoragePort.ts` — puerto puro: `crearUrlSubidaFirmada(path, contentType)`, `crearUrlLecturaFirmada(path, expiraSegundos)`, `eliminar(paths)`.
  - `infrastructure/SupabaseStorageAdapter.ts` — adaptador con `@supabase/supabase-js` (service role, solo servidor).
  - `application/fakes.ts` — fake en memoria para tests.
- **Dominio de solicitudes** (`src/modules/solicitudes/domain`) — puro:
  - Tipos `ArchivoSolicitud`, `TipoArchivoSolicitud`; `Solicitud` gana `archivos: ArchivoSolicitud[]`.
  - Reglas puras de validación: `MAX_ADJUNTOS = 10`, tamaños (`5 MB` principal, `10 MB` adjunto), listas de `contentType` permitidos (imagen: jpeg/png/webp; adjunto: + pdf, doc, docx), y helpers `esImagenPrincipalValida` / `esAdjuntoValido` / `puedeAgregarAdjunto(cantidadActual)`.
  - Convención de `path`: `solicitudes/{solicitudId}/{principal|adjuntos}/{uuid}.{ext}`.
- **Aplicación** (`src/modules/solicitudes/application`):
  - `prepararSubidaArchivo(deps, input, actor)`: valida dueño, `estado ABIERTA`, `tipo`, `contentType`, `tamanoBytes` y cupo (principal libre / < 10 adjuntos); genera `path` y devuelve la URL firmada de subida.
  - `confirmarArchivo(deps, input, actor)`: revalida y persiste `ArchivoSolicitud` (reemplaza la principal previa si existía, borrando su objeto).
  - `eliminarArchivo(deps, archivoId, actor)`: valida dueño + `ABIERTA`; borra objeto y fila.
  - `urlsLecturaDeSolicitud(deps, solicitud)`: mapea cada archivo a su URL firmada de lectura (usado por los detalles).
- **Infraestructura** (`src/modules/solicitudes/infrastructure`): `PrismaSolicitudRepository` incluye `archivos` en el `select`/mapeo de `obtener`; métodos `crearArchivo`, `eliminarArchivo`, `contarAdjuntos`, `obtenerArchivoPrincipal`.
- **Composición** (`src/lib` + `@/shared/solicitudes`): servicios que inyectan el `StoragePort` (Supabase) y el repositorio Prisma en los casos de uso, y server actions.
- **Presentación:**
  - `SolicitudForm`: bloque "Imagen principal" (dropzone single con preview) y "Documentación" (lista multi con ícono por tipo, nombre, tamaño, barra de progreso y botón quitar). Validación en cliente antes de pedir la URL firmada. Solo activo si la solicitud es editable.
  - Server actions: `prepararSubidaArchivoAction`, `confirmarArchivoAction`, `eliminarArchivoAction`.
  - Detalle dueño (`(app)/solicitudes/[id]`) y detalle admin (`/panel/solicitudes/[id]`): sección de imagen principal destacada (`next/image` con URL firmada) y lista de adjuntos descargables (enlace firmado, ícono por `contentType`). Admin en solo lectura.
- **Config:**
  - `next.config.ts`: añadir el host de Supabase Storage a `images.remotePatterns`.
  - `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`.
  - Nueva dependencia **`@supabase/supabase-js`** (avisada; la constitución exige no añadir deps en silencio).
- **Tests (Vitest):**
  - Reglas puras: tamaños/tipos límite, cupo de adjuntos, unicidad de principal.
  - `prepararSubidaArchivo`: rechaza no-dueño, solicitud no `ABIERTA`, tipo/tamaño inválidos, adjunto nº 11; acepta caso válido y genera `path` correcto.
  - `confirmarArchivo`: reemplazo de principal borra la anterior; persiste metadatos.
  - `eliminarArchivo`: solo dueño + `ABIERTA`; borra objeto y fila (con fake de `StoragePort`).
- **Datos demo:** `pnpm db:seed:dev` carga una imagen principal y una imagen adjunta por cada solicitud demo cuando `SUPABASE_*` está configurado.

**No incluye**

- **Página pública sin sesión** de solicitudes ni de sus archivos (decisión: solo dentro de la app).
- **Mostrar archivos en la transparencia pública (009)** ni en ninguna superficie anónima.
- **Que el `ADMIN` suba o borre archivos** de la solicitud (solo lectura para él).
- **Edición de archivos tras cerrar la solicitud** (`ATENDIDA`/`CERRADA` quedan inmutables, igual que hoy).
- **Previsualización embebida de PDF/doc** (se ofrecen como descarga; las imágenes sí se muestran).
- **Miniaturas/optimización server-side propia** más allá de lo que da `next/image`; sin `sharp`.
- **Antivirus/escaneo de contenido** de los archivos subidos (fuera de alcance; se limita por tipo y tamaño).
- **Jobs de limpieza de huérfanos** en Storage (el borrado se hace en línea; los huérfanos por subidas interrumpidas quedan como deuda menor conocida).

## Criterios de aceptación

- [ ] El `SOLICITANTE` dueño puede subir **una** imagen principal (`jpeg/png/webp`, ≤5 MB) a una solicitud `ABIERTA`; subir otra **reemplaza** la anterior y borra su objeto en Storage.
- [ ] El dueño puede adjuntar hasta **10** documentos (`imágenes + pdf + doc/docx`, ≤10 MB c/u) y quitar cualquiera mientras la solicitud esté `ABIERTA`.
- [ ] El sistema **rechaza en servidor**: actor no dueño, solicitud no `ABIERTA`, `contentType` fuera de la lista, tamaño excedido, o el adjunto número 11. Validado en test con fake del `StoragePort`.
- [ ] En base hay **como máximo una** fila `PRINCIPAL` por solicitud (índice único parcial); la migración aplica limpia.
- [ ] La subida va **directo del navegador a Supabase** (no pasa por la función serverless), con URL firmada de subida generada por el servidor.
- [ ] El detalle del dueño y el del `ADMIN` muestran la imagen principal (destacada) y la lista de adjuntos descargables mediante **URLs firmadas de lectura**; el `ADMIN` no puede subir ni borrar.
- [ ] Los archivos **no** son accesibles sin sesión (bucket privado) y **no** aparecen en la transparencia pública.
- [ ] Al eliminar una solicitud se borran sus filas `ArchivoSolicitud` (cascada) y sus objetos en Storage.
- [ ] Con Storage configurado, `pnpm db:seed:dev` deja cada solicitud demo con dos imágenes válidas y puede reejecutarse sin duplicarlas.
- [ ] `pnpm test` cubre lo listado en verde; `pnpm lint` / `pnpm build` sin errores; `solicitudes/domain`, `solicitudes/application` y `archivos/domain` permanecen **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Secreto solo en servidor:** `SUPABASE_SERVICE_ROLE_KEY` nunca se expone al cliente. La subida directa usa una URL firmada de un solo uso emitida por el server action; el cliente jamás ve la service key.
- **Tope de Vercel (4.5 MB):** es la razón de la subida directa. Un passthrough por server action fallaría con adjuntos de 10 MB aunque se suba `serverActions.bodySizeLimit`.
- **Local dev sin Supabase:** quien no configure `SUPABASE_*` en `.env.local` no podrá subir archivos en local; el resto de la solicitud sigue funcionando. Documentar en el README de la feature.
- **Privacidad de las imágenes:** pueden contener personas o datos sensibles. El bucket privado + URLs firmadas de corta vida limitan la exposición; no se listan objetos públicamente.
- **Huérfanos en Storage:** una subida directa que no llega a `confirmarArchivo` deja un objeto sin fila. Se acepta como deuda menor (sin job de limpieza en esta feature); mitigable a futuro con expiración del bucket o verificación en `confirmar`.
- **Validación en dos lados:** el cliente valida para UX, pero la **fuente de verdad** es el server action (tipo, tamaño, cupo, dueño, estado). Nunca confiar solo en el cliente.
- **Sin em-dash / en-dash** en textos visibles (constitución `tech-stack.md`).
- **Next 16:** `SolicitudForm`, `(app)/solicitudes/[id]` y `/panel/solicitudes/[id]` ya existen; leer `node_modules/next/dist/docs/` antes de tocar server actions/components (AGENTS.md). Reusar `requireRol`/guards de 002/021 y `esEditable` de 007.
- **Estilo visual:** dropzones y listas siguen la constitución (sin cards por defecto, hairlines, `lucide-react` `strokeWidth={1.5}`, tokens teal, `--ease-out-emil`, `prefers-reduced-motion`).
