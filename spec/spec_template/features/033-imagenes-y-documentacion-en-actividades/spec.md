# 033 · Imágenes y documentación en actividades

> Estado: **En curso** · Enmienda: `024 · Actividad` · Depende de: `024`, `022`, `031`, `009`, `021` · Roadmap: `constitution/roadmap.md`

## Qué hace

Permite que el `ADMIN` dueño de una actividad adjunte **una imagen principal** (portada visual) y **una lista de documentos de apoyo** (imágenes, PDF y `.doc/.docx`), y **aprovecha esas imágenes para rediseñar el tablero público de transparencia** en una galería editorial con cara e impacto. A diferencia de la 031 (solicitudes, todo privado), los archivos de actividad son **públicos**: se ven sin sesión en `/transparencia` y en el detalle público `/transparencia/[id]`, además del detalle del colaborador logeado (`/actividades/[id]`).

- **Imagen principal (0 o 1).** Una sola imagen que encabeza la actividad y le da contexto visual: la zona atendida, la jornada, el evento. Se muestra destacada en el detalle público, en la tarjeta del tablero y en el detalle del colaborador.
- **Documentación (0 a 10 adjuntos).** Archivos que sustentan o documentan la actividad (fotos del reparto, actas, listados, informes). Se muestran como galería de imágenes + lista descargable con ícono por tipo, nombre y tamaño.
- **Rediseño de transparencia.** El tablero público pasa de texto plano a una **galería editorial**: actividad destacada con portada a lo ancho y grid de tarjetas con imagen; el detalle público gana un hero con la portada, las metas y la galería de adjuntos.

Reutiliza la **infraestructura de almacenamiento** introducida en la 031 (`src/modules/archivos`, `StoragePort` + `SupabaseStorageAdapter`), añadiendo un **bucket público** para las actividades.

## Por qué

`mission.md` pone la transparencia como norte del proyecto y `009` la materializa en un tablero público. Hoy ese tablero es solo texto (totales, recolectado por recurso, lista de actividades con progreso): comunica datos, pero no **muestra** la operación. Con fotos de las actividades:

1. **La transparencia se vuelve creíble y humana.** Ver la jornada, el reparto o la zona atendida transmite el impacto mejor que un porcentaje.
2. **El `ADMIN` documenta lo que hizo.** Fotos del evento y actas dejan constancia pública de la ayuda entregada.
3. **El tablero público deja de ser una tabla y pasa a ser una vitrina** que invita a colaborar; el registro de la actividad (metas, destino, progreso) sigue ahí, ahora con contexto visual.

## Decisiones tomadas

- **Un solo modelo `ArchivoActividad` con `tipo` (`PRINCIPAL` | `ADJUNTO`).** Igual que `ArchivoSolicitud` (031): una tabla rica con metadatos (nombre original, tipo MIME, tamaño) cubre portada y adjuntos con una sola forma. Máx 1 `PRINCIPAL` por actividad, garantizado en base con **índice único parcial** `(actividadId) WHERE tipo = 'PRINCIPAL'`.
- **Archivos públicos → bucket público separado.** En Supabase la visibilidad es por bucket, no por objeto. El bucket privado de 031 se queda para solicitudes/evidencia; las actividades usan un **bucket público nuevo** (`SUPABASE_STORAGE_BUCKET_PUBLICO`). La **subida** sigue igual que 031 (URL firmada de subida con service role, directo navegador → Supabase, esquiva el tope de 4.5 MB de Vercel); la **lectura** usa **URL pública permanente** (`getPublicUrl`), sin firmar: cacheable, apta para transparencia y SEO, sin generar URLs por request.
- **Gestiona solo el `ADMIN` dueño, en cualquier estado.** El gate es únicamente la propiedad (`adminId`, feature 022); no se ata a `RECOLECTANDO` como la edición de cabecera. El dueño puede subir fotos incluso tras avanzar la actividad (p. ej. fotos de un evento ya `REALIZADA`). Colaborador y público, en solo lectura.
- **Subir al crear (paridad con 031).** El binario necesita el `id` de la actividad para su ruta en Storage, que no existe hasta crearla. La pantalla de alta recolecta portada + adjuntos con preview local (sin subir); al devolver `crearActividadAction` el `id`, se suben en secuencia. Gestión posterior (añadir/quitar) desde el detalle del dueño.
- **Reutilizar la infra de 031 sin tocarla.** Se extraen a `src/modules/archivos` los helpers puros genéricos por entidad (constantes de tipos/tamaños, `extensionDe`, validadores de tamaño; y en UI el `PUT` a la URL firmada + ícono/formato de bytes) para que actividades los consuma. **La 031 no se modifica** (conserva su copia; su migración a la versión compartida queda como limpieza futura) para no tocar trabajo en curso.
- **`StoragePort` gana `urlPublica(path)`; el adaptador se parametriza por bucket.** Se compone una instancia privada (la existente) y una pública (actividades). El dominio sigue sin conocer Supabase.
- **Borrado consistente.** Quitar un archivo borra el objeto en Storage y luego la fila. Al eliminar la actividad, la cascada borra las filas `ArchivoActividad`; la limpieza de objetos en Storage se hace en el mismo flujo de borrado (no se delega a un job).
- **Transparencia sin datos personales.** Los DTOs públicos ganan solo `portadaUrl` (y adjuntos en el detalle): URLs de objetos, sin identidades. `assertSinDatosPersonales` sigue vigente.

## Alcance

**Incluye**

- **Modelo Prisma:**
  - Enum `TipoArchivoActividad { PRINCIPAL, ADJUNTO }`.
  - `model ArchivoActividad { id, actividadId → Actividad (onDelete: Cascade), tipo, path, nombreOriginal, contentType, tamanoBytes Int, createdAt }`, `@@index([actividadId])`.
  - Relación inversa `archivos ArchivoActividad[]` en `model Actividad`.
  - **Migración** `actividad_archivos`: crea enum y tabla, y añade el **índice único parcial** de `PRINCIPAL` vía SQL crudo.
- **Módulo de almacenamiento** (`src/modules/archivos`, extensión):
  - `domain/StoragePort.ts` gana `urlPublica(path): string`.
  - `SupabaseStorageAdapter` acepta el bucket por constructor (`getPublicUrl` para `urlPublica`).
  - Hogar compartido de reglas puras genéricas (`domain/reglasArchivos` del módulo archivos) y helpers de UI (`subirArchivo`, ícono/formato) reutilizables.
- **Dominio de actividades** (`src/modules/actividades/domain`) — puro:
  - Tipos `ArchivoActividad`, `TipoArchivoActividad`; `Actividad` gana `archivos: ArchivoActividad[]`.
  - `reglasArchivos.ts`: reusa las constantes/validadores compartidos y define `construirPath` / `esPathDeActividad` con convención `actividades/{actividadId}/{principal|adjuntos}/{uuid}.{ext}`.
- **Aplicación** (`src/modules/actividades/application`):
  - `deps.ts`: `ArchivoActividadDeps` + `cargarActividadDelDueno` (solo dueño; sin gate de estado).
  - `errors.ts`: `ArchivoInvalidoError`, `LimiteArchivosError`, `ArchivoNoEncontradoError`.
  - `prepararSubidaArchivo`: valida dueño, `tipo`, `contentType`, `tamanoBytes` y cupo; genera `path` y devuelve la URL firmada de subida.
  - `confirmarArchivo`: revalida y persiste `ArchivoActividad` (reemplaza la principal previa si existía, borrando su objeto).
  - `eliminarArchivo`: valida dueño; borra objeto y fila.
  - `urlsPublicasDeActividad`: mapea cada archivo a su URL pública (para detalles y transparencia).
- **Infraestructura** (`src/modules/actividades/infrastructure`): `PrismaActividadRepository` incluye `archivos` en el `select`/mapeo de `obtener`/`buscarPorId`; métodos `crearArchivo`, `eliminarArchivo`, `contarAdjuntos`, `obtenerArchivoPrincipal`, `buscarArchivoPorId`.
- **Composición** (`src/lib` + `@/shared/actividades`): servicios que inyectan el `StoragePort` público y el repositorio Prisma; server actions.
- **Presentación:**
  - Alta `/panel/actividades/nueva`: `NuevaActividadCliente` (orquesta) + `SelectorArchivosNueva` (recolecta con preview, sube tras crear).
  - Gestión en el detalle del dueño `/panel/actividades/[id]`: bloque imagen principal (dropzone single) + documentación (lista multi con progreso y quitar), en cualquier estado.
  - Server actions: `prepararSubidaArchivoAction`, `confirmarArchivoAction`, `eliminarArchivoAction` (`requireRol(ADMIN)` + dueño).
  - Lectura: portada + adjuntos en el detalle del colaborador `/actividades/[id]`.
  - **Rediseño transparencia (galería editorial con destacada):**
    - `/transparencia`: actividad destacada con portada a lo ancho (overlay de título/progreso) + grid de tarjetas con portada, badges y barra. Totales de impacto como fila de stats.
    - `/transparencia/[id]`: hero con portada, metas por recurso y galería de adjuntos imagen + documentos descargables.
    - DTOs `EnvioResumenPublico` y `DetallePublico` ganan `portadaUrl`; el detalle gana la lista de adjuntos públicos.
- **Config:**
  - `.env.example`: `SUPABASE_STORAGE_BUCKET_PUBLICO` (el host de Supabase ya está en `next.config` desde 031).
- **Tests (Vitest):**
  - Reglas puras: tamaños/tipos límite, cupo de adjuntos, `construirPath`/`esPathDeActividad`.
  - `prepararSubidaArchivo`: rechaza no-dueño, tipo/tamaño inválidos, adjunto nº 11; acepta caso válido y genera `path` correcto.
  - `confirmarArchivo`: reemplazo de principal borra la anterior; persiste metadatos.
  - `eliminarArchivo`: solo dueño; borra objeto y fila (con fake de `StoragePort`).
  - `obtener-resumen-publico` / `obtener-detalle-publico`: `portadaUrl`/adjuntos presentes y `assertSinDatosPersonales` sigue en verde.
- **Datos demo:** `pnpm db:seed:dev` carga una imagen principal y una adjunta por cada actividad demo cuando `SUPABASE_*` está configurado.

**No incluye**

- **Que el `COLABORADOR` o cualquiera que no sea el dueño suba o borre** archivos (solo lectura).
- **Previsualización embebida de PDF/doc** (se ofrecen como descarga; las imágenes sí se muestran).
- **Miniaturas/optimización server-side propia** más allá de `next/image`; sin `sharp`.
- **Antivirus/escaneo de contenido** de los archivos (se limita por tipo y tamaño).
- **Jobs de limpieza de huérfanos** en Storage (el borrado se hace en línea).
- **Portada en las tarjetas de `/actividades` (colaborador) y `/panel/actividades` (admin)** (fuera de alcance; el rediseño visual se limita a transparencia y a los detalles).
- **Moderación pública de las imágenes** más allá de que solo el dueño las sube.

## Criterios de aceptación

- [ ] El `ADMIN` dueño puede subir **una** imagen principal (`jpeg/png/webp`, ≤5 MB) a su actividad en **cualquier estado**; subir otra **reemplaza** la anterior y borra su objeto en Storage.
- [ ] El dueño puede adjuntar hasta **10** documentos (`imágenes + pdf + doc/docx`, ≤10 MB c/u) y quitar cualquiera.
- [ ] La subida funciona **al crear** (recolecta en el alta, sube tras obtener el `id`) y **después** desde el detalle del dueño.
- [ ] El sistema **rechaza en servidor**: actor no dueño, `contentType` fuera de la lista, tamaño excedido, o el adjunto número 11. Validado en test con fake del `StoragePort`.
- [ ] En base hay **como máximo una** fila `PRINCIPAL` por actividad (índice único parcial); la migración aplica limpia.
- [ ] La subida va **directo del navegador a Supabase** (no pasa por la función serverless), con URL firmada de subida generada por el servidor.
- [ ] `/transparencia` se muestra como **galería editorial**: actividad destacada con portada + grid de tarjetas con imagen y progreso; el detalle público muestra hero de portada, metas y galería de adjuntos + documentos, todo con **URL pública**.
- [ ] Los DTOs públicos exponen solo `portadaUrl`/adjuntos (sin datos personales); `assertSinDatosPersonales` sigue pasando.
- [ ] Al eliminar una actividad se borran sus filas `ArchivoActividad` (cascada) y sus objetos en Storage.
- [ ] Con Storage configurado, `pnpm db:seed:dev` deja cada actividad demo con dos imágenes válidas y puede reejecutarse sin duplicarlas.
- [ ] `pnpm test` cubre lo listado en verde; `pnpm lint` / `pnpm build` sin errores; `actividades/domain`, `actividades/application` y `archivos/domain` permanecen **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Secreto solo en servidor:** `SUPABASE_SERVICE_ROLE_KEY` nunca se expone al cliente. La subida directa usa una URL firmada de un solo uso emitida por el server action.
- **Bucket público:** los objetos son accesibles por URL a quien la tenga. Es intencional (transparencia pública). El `ADMIN` debe subir solo imágenes aptas para difusión; no se suben datos personales sensibles a este bucket por diseño.
- **Local dev sin Supabase:** quien no configure `SUPABASE_*` en `.env.local` no podrá subir archivos en local; el resto de la actividad y la transparencia (sin imágenes) siguen funcionando.
- **Huérfanos en Storage:** una subida directa que no llega a `confirmarArchivo` deja un objeto sin fila. Deuda menor conocida (sin job de limpieza).
- **Validación en dos lados:** el cliente valida para UX, pero la **fuente de verdad** es el server action (tipo, tamaño, cupo, dueño). Nunca confiar solo en el cliente.
- **Sin em-dash / en-dash** en textos visibles (constitución `tech-stack.md`).
- **Next 16:** leer `node_modules/next/dist/docs/` antes de tocar server actions/components (AGENTS.md). Reusar `requireRol`/guards (002/021/022).
- **Estilo visual:** dropzones, listas, galería y tarjetas siguen la constitución (hairlines, `lucide-react` `strokeWidth={1.5}`, tokens teal, títulos serif + números mono `numeric-tnum`, `--ease-out-emil`, `prefers-reduced-motion`). El rediseño de transparencia respeta `constitution/ui-guidelines.md`.
