# 033 · Imágenes y documentación en actividades — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, pureza de
> capas, convenciones y límites duros). De adentro hacia afuera: dominio → aplicación → infraestructura →
> composición → presentación → tests. Reutiliza la infraestructura de la 031.

## Enfoque general

Segunda feature de archivos de usuario; reaprovecha `src/modules/archivos` (031). Tres partes:

1. **Extensión de la infra de almacenamiento** — `StoragePort` gana `urlPublica(path)`; `SupabaseStorageAdapter`
   se parametriza por bucket; se compone una instancia pública (nuevo `SUPABASE_STORAGE_BUCKET_PUBLICO`) además
   de la privada. Se extraen helpers puros compartidos (tipos/tamaños, `PUT`, ícono/formato) al módulo archivos.
2. **Archivos en actividades** — modelo `ArchivoActividad` (`PRINCIPAL` | `ADJUNTO`), casos de uso
   `prepararSubidaArchivo` / `confirmarArchivo` / `eliminarArchivo` / `urlsPublicasDeActividad`, y UI de gestión
   (alta con subida diferida + detalle del dueño). Gate: solo dueño, cualquier estado.
3. **Rediseño de transparencia** — DTOs públicos ganan `portadaUrl` (+ adjuntos en el detalle); `/transparencia`
   pasa a galería editorial con destacada y `/transparencia/[id]` a hero + galería.

Flujo de subida (idéntico a 031): cliente valida → `prepararSubidaArchivoAction` valida (dueño, tipo, tamaño,
cupo) y devuelve URL firmada → navegador sube **directo** a Supabase → `confirmarArchivoAction` persiste la
fila. Lectura por **URL pública** (`getPublicUrl`), sin firmar.

Orden: **config → migración → módulo `archivos` (urlPublica + adaptador por bucket + helpers compartidos) →
dominio actividades (tipos + reglas) → aplicación (+tests) → infraestructura (repo Prisma) → composición →
presentación (alta + detalle dueño + detalle colaborador) → transparencia (DTOs + UI) → validación**.

> ⚠️ Antes de tocar server actions / server components de Next 16, leer `node_modules/next/dist/docs/`
> (AGENTS.md). La protección por rol reutiliza `requireRol(ADMIN)` (002/021) y la propiedad `adminId` (022).

## 1. Configuración

- `.env.example`: `SUPABASE_STORAGE_BUCKET_PUBLICO`. (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ya existen.)
- `next.config.ts`: el host `*.supabase.co` ya está en `images.remotePatterns` (031). Verificar que el path
  de objeto público (`/storage/v1/object/public/**`) también matchea; añadirlo si hace falta.

## 2. Modelo de datos y migración

- `prisma/schema.prisma`:
  - `enum TipoArchivoActividad { PRINCIPAL ADJUNTO }`.
  - `model ArchivoActividad { id, actividadId, actividad (onDelete: Cascade), tipo, path, nombreOriginal, contentType, tamanoBytes Int, createdAt, @@index([actividadId]) }`.
  - `model Actividad`: relación inversa `archivos ArchivoActividad[]`.
- Migración `actividad_archivos` (`pnpm db:migrate --name actividad_archivos`, Docker arriba, puerto 5435):
  crea enum + tabla y el **índice único parcial**:
  `CREATE UNIQUE INDEX "archivos_actividad_principal_unico" ON "archivos_actividad"("actividadId") WHERE "tipo" = 'PRINCIPAL';`
- `pnpm db:generate`.

## 3. Módulo `archivos` (`src/modules/archivos`) — extensión

- `domain/StoragePort.ts`: añadir `urlPublica(path: string): string`.
- `infrastructure/SupabaseStorageAdapter.ts`: aceptar el nombre de bucket (o la env a leer) por constructor;
  implementar `urlPublica` con `storage.from(bucket).getPublicUrl(path).data.publicUrl`.
- `application/fakes.ts`: el `FakeStorage` implementa `urlPublica` (p. ej. `https://fake/{bucket}/{path}`).
- **Helpers compartidos** (nuevos, para no duplicar en actividades):
  - `domain/reglasArchivos.ts` (módulo archivos): constantes genéricas `MB`, `MAX_ADJUNTOS`,
    `MAX_BYTES_PRINCIPAL`, `MAX_BYTES_ADJUNTO`, `TIPOS_IMAGEN`, `TIPOS_DOCUMENTO`, `TIPOS_ADJUNTO`,
    `extensionDe`, `esTamanoValido`, `esImagenPrincipalValida`, `esAdjuntoValido`, `puedeAgregarAdjunto`.
  - `ui/` (módulo archivos): `subirArchivoDirecto` (PUT a URL firmada) y `archivos.ts`
    (`ACCEPT_IMAGEN`, `ACCEPT_ADJUNTO`, `formatearTamano`, `iconoDeContentType`).
- **La 031 no se toca:** mantiene su propia copia en `solicitudes/domain` y `solicitudes/ui`.

## 4. Dominio `actividades` (`src/modules/actividades/domain`) — puro

- `ArchivoActividad.ts`: `TipoArchivoActividad`, tipo `ArchivoActividad`, `NuevoArchivoActividad`.
- `Actividad.ts`: `Actividad` gana `archivos: ArchivoActividad[]` (vacío en listados ligeros).
- `reglasArchivos.ts` (puro): reexporta/usa las constantes compartidas de `archivos/domain` y define
  `construirPath(actividadId, tipo, uuid, contentType)` y `esPathDeActividad(path, actividadId, tipo)`
  con la convención `actividades/{actividadId}/{principal|adjuntos}/{uuid}.{ext}`.
- Barril `domain/index.ts` exporta lo nuevo.

## 5. Aplicación (`src/modules/actividades/application`)

- `deps.ts`: `ArchivoActividadDeps` (repositorio + `storage: StoragePort`) y `cargarActividadDelDueno`
  (carga por id, verifica `esDueño`; **sin** gate de estado). Añadir `storage` al `ActividadDeps` general.
- `errors.ts`: `ArchivoInvalidoError`, `LimiteArchivosError`, `ArchivoNoEncontradoError`.
- `prepararSubidaArchivo(deps, input, actorId)`: carga y valida dueño; valida tipo/tamaño según `tipo`;
  valida cupo (principal siempre reemplaza; adjunto `< MAX_ADJUNTOS`); genera `uuid` + `path`; devuelve
  `{ path, url }`.
- `confirmarArchivo(deps, input, actorId)`: revalida dueño + tipo/tamaño; si `PRINCIPAL` y ya existe, borra
  el objeto anterior y su fila; persiste `ArchivoActividad`.
- `eliminarArchivo(deps, archivoId, actorId)`: valida dueño; borra objeto (StoragePort) + fila.
- `urlsPublicasDeActividad(deps, actividad)`: mapea archivos a `{ ...archivo, url }` con `urlPublica`.
- `uuid` con `crypto.randomUUID()` (inyectable en tests si hace falta).

## 6. Infraestructura (`src/modules/actividades/infrastructure`)

- `ActividadRepository` (dominio) declara: `crearArchivo`, `eliminarArchivo(id)`, `contarAdjuntos(actividadId)`,
  `obtenerArchivoPrincipal(actividadId)`, `buscarArchivoPorId(id)`.
- `PrismaActividadRepository`: el `include`/`select` de `obtener` y `buscarPorId` gana
  `archivos: { orderBy: { createdAt: "asc" } }`; el mapeo incluye `archivos`; implementa los métodos nuevos.

## 7. Composición (`src/lib/actividades.ts` + `@/shared/actividades`)

- Instanciar `SupabaseStorageAdapter` con el bucket público y añadirlo a `deps`.
- Exponer `prepararSubidaArchivoServicio`, `confirmarArchivoServicio`, `eliminarArchivoServicio`,
  `urlsPublicasDeActividadServicio`.
- Transparencia: los servicios `obtenerResumenPublicoServicio` / `obtenerDetallePublicoServicio` resuelven
  `portadaUrl` (y adjuntos en el detalle) vía el `StoragePort` público.

## 8. Presentación

- Server actions en `(admin)/panel/actividades/actions.ts`: `prepararSubidaArchivoAction`,
  `confirmarArchivoAction`, `eliminarArchivoAction` (`requireRol(ADMIN)` + dueño; Zod para inputs; traducción
  de errores de dominio).
- **Alta** `/panel/actividades/nueva`: `NuevaActividadCliente` (client) orquesta `ActividadForm` +
  `SelectorArchivosNueva`; al devolver el `id`, sube portada y adjuntos en secuencia con `subirArchivoDirecto`.
- **Detalle dueño** `/panel/actividades/[id]`: sub-componente `ArchivosActividad` (client) con dropzone de
  portada (preview) y lista de adjuntos (progreso, quitar). Disponible en cualquier estado. Sube directo a
  Supabase vía URL firmada.
- **Detalle colaborador** `/actividades/[id]`: `ArchivosActividadVista` (server) resuelve
  `urlsPublicasDeActividadServicio` y renderiza portada (`next/image`) + lista de adjuntos descargables.
- **Transparencia** (`src/modules/transparencia/ui`):
  - `TarjetaEnvioPublico`: portada como cover (4:3) con overlay de badges + barra.
  - Nuevo `EnvioDestacado`: portada a lo ancho con overlay de título/progreso (la actividad más reciente
    o de mayor impacto con portada).
  - `ListaEnviosPublicos` / `ResumenTransparencia`: layout de galería editorial (destacada + grid).
  - `DetalleEnvioPublico`: hero de portada + `GaleriaAdjuntos` (imágenes) + lista de documentos.
  - Ajustar `TotalesImpacto` como fila de stats grande.

## 9. Tests (Vitest)

- `archivos/domain/reglasArchivos.test.ts`: límites de tamaño/tipo, cupo, extensiones (si no cubierto ya).
- `actividades/domain/reglasArchivos.test.ts`: `construirPath`, `esPathDeActividad`.
- `prepararSubidaArchivo.test.ts`: rechaza no-dueño, tipo/tamaño inválidos, adjunto nº 11; acepta válido.
- `confirmarArchivo.test.ts`: reemplazo de principal borra la anterior (objeto + fila); persiste metadatos.
- `eliminarArchivo.test.ts`: solo dueño; borra objeto y fila.
- `obtener-resumen-publico.test.ts` / `obtener-detalle-publico.test.ts`: `portadaUrl`/adjuntos presentes y
  `assertSinDatosPersonales` en verde.
- Fakes: ampliar `FakeStorage` (`urlPublica`) y el fake de `ActividadRepository` (métodos de archivos).

## 10. Validación

- `pnpm test`, `pnpm lint`, `pnpm build`. Comprobar que `actividades/domain`, `actividades/application` y
  `archivos/domain` quedan puras. La subida real requiere `SUPABASE_*`; en local sin ellas, el resto funciona.

## 11. Datos demo

- `prisma/seed-dev.ts` reutiliza imágenes de `public/assets`, asigna de forma determinista una `PRINCIPAL`
  y una `ADJUNTO` a cada actividad demo y sube los objetos al bucket público con `upsert` (ids/paths estables
  para que reejecutar el seed actualice en vez de duplicar).
- Sin `SUPABASE_*`, se omite solo esta parte con un aviso; configuración parcial se trata como error.
