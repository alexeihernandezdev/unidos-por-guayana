# 011 · Puntos de acopio

> Estado: **En curso** · Depende de: `016 · Perfil de administrador y centro de acopio` (y por transitividad `015`) y `020 · Catálogo de ubicación` · Roadmap: `constitution/roadmap.md`

> **Base ya disponible (feature 016).** El modelo `PuntoAcopio` existía como stub con la relación
> `adminId` (FK a `Usuario`, un admin tiene 0..N puntos) y su índice; esta feature lo completa
> (nombre, referencia, coordenadas, horarios, contacto y ubicación por catálogo) con un `ALTER TABLE`,
> sin re-crear la relación. `estadoId`/`municipioId` heredan del `PerfilAdmin` al crear como **valor
> efectivo** (se copian, no se referencian vivos).

## Qué hace

Introduce el **punto de acopio**: la **ubicación física** perteneciente a un `ADMIN` que funciona
como centro de acopio. Un **`PuntoAcopio`** es un lugar concreto (con `nombre`, `referencia`,
coordenadas `latitud`/`longitud`, `horarios`, `telefono`, `correo?` y ubicación por catálogo) que
**pertenece a un `ADMIN`**. Un administrador puede tener uno o varios puntos.

- **Gestión de puntos (solo el `ADMIN` dueño):** crear, editar, **listar** y **archivar/activar** sus
  puntos. Cada `ADMIN` administra únicamente los suyos.
- **Pertenencia a un administrador:** cada `PuntoAcopio` referencia a su `ADMIN` (`adminId`, relación
  declarada en 016). Un administrador puede tener uno o varios puntos.
- **Ubicación por catálogo (feature 020):** cada punto guarda `estadoId`/`municipioId` (FK al catálogo
  de estados/municipios de Venezuela). Se heredan del `PerfilAdmin` al crear y el `ADMIN` puede
  **sobrescribirlos** si el punto está en otra ubicación.
- **Coordenadas en el mapa:** el `ADMIN` marca la ubicación exacta en un mapa (Leaflet) al crear/editar
  el punto; se guardan `latitud`/`longitud` como `Decimal(9,6)`. `referencia` (texto) complementa el
  mapa para orientar a quien va a llegar.
- **Contacto propio del punto:** cada punto declara su `telefono` (con flag `telefonoEsWhatsApp`,
  `true` por defecto) y opcionalmente un `correo`.
- **Visibilidad:** el listado y detalle del punto son accesibles al `ADMIN` dueño; su exposición
  pública (transparencia, colaboradores) queda como iteración futura.

## Por qué

`mission.md` describe los **puntos de acopio** como las ubicaciones físicas de la red: cada punto
pertenece a un administrador y el `ADMIN` funciona como centro de acopio pudiendo tener uno o varios
puntos. `tech-stack.md` define la entidad `PuntoAcopio` con `nombre`, `referencia`, coordenadas,
horarios, contacto y ubicación por catálogo. Sin esta feature no hay forma de que un admin declare
dónde está físicamente su(s) sede(s), y las decisiones del cliente ("un admin puede tener varios
centros", "el SUPERADMIN también puede ser centro") se apoyan sobre este modelo.

**Nota:** en esta feature un punto de acopio es **solo una ubicación**. Los aportes siguen ligados a
Ayudas (envíos/jornadas/eventos), no a puntos; no se declara "qué recibe" un punto ni se selecciona
punto al registrar un aporte.

## Decisiones tomadas

- **Módulo `src/modules/acopio`.** La entidad y el CRUD de `PuntoAcopio` viven en su propio dominio de
  acopio. `PerfilAdmin` (identidad del admin) queda en `usuarios`; aquí solo se consume el lado
  `adminId` y la ubicación heredada.
- **Cada punto pertenece a un `ADMIN` dueño.** La escritura (crear/editar/archivar) está protegida por
  rol **y por propiedad**: un `ADMIN` solo gestiona los puntos cuyo `adminId` es el suyo, validado en
  servidor. No basta con el rol.
- **Archivar en vez de borrar.** Un `activo Boolean @default(true)` soft-archive. Un punto archivado no
  se ofrece por defecto pero se conserva.
- **Herencia de ubicación como valor efectivo.** Al crear, `estadoId`/`municipioId` toman por defecto
  los del `PerfilAdmin`, pero el `ADMIN` puede sobrescribirlos. Se guarda el valor efectivo del punto
  (no se referencia vivo al perfil), para no romperse si el perfil cambia después.
- **Ubicación por catálogo (feature 020).** `estadoId`/`municipioId` son FK al catálogo, no texto
  libre. El servidor valida coherencia estado↔municipio.
- **Mapa con Leaflet + OpenStreetMap.** El cliente pinta un mapa con `react-leaflet` sobre tiles de
  OpenStreetMap (sin API key, gratis). El `ADMIN` marca el punto exacto y se guardan `latitud` y
  `longitud` como `Decimal(9,6)` (~10 cm de precisión). `react-leaflet` y `leaflet` son la primera
  dependencia nueva declarada en esta feature (aviso conforme AGENTS.md).
- **`referencia` textual además del mapa.** El mapa da la posición exacta, pero un texto orientativo
  ("Casa amarilla frente al abasto Los Andes") ayuda a que el colaborador la encuentre. Se guarda como
  campo obligatorio.
- **Contacto propio del punto.** `telefono` obligatorio con flag `telefonoEsWhatsApp` (`true` por
  defecto, coherente con el uso real en Venezuela); `correo` opcional. Complementa (no reemplaza) el
  contacto del `PerfilAdmin`.
- **Unicidad de nombre por admin.** `@@unique([adminId, nombre])`: dos puntos del mismo admin no pueden
  compartir nombre, para evitar confusión en listados.
- **`horarios` como texto libre estructurado.** Sin modelar calendario por franja en esta etapa.
- **No hay N a N con `Recurso`.** Los puntos son ubicaciones, no catálogos de "qué recibe". Los aportes
  se hacen a Ayudas, no a puntos.
- **No se toca el modelo `Aporte`.** No se añade `puntoAcopioId` al aporte en esta feature.

## Alcance

**Incluye**

- Modelo `PuntoAcopio` completo en Prisma: `nombre`, `referencia`, `latitud`/`longitud`
  `Decimal(9,6)`, `horarios`, `telefono`, `telefonoEsWhatsApp` (default `true`), `correo?`,
  `estadoId`/`municipioId` (FK al catálogo 020), `adminId` (FK a `Usuario` ADMIN, ya declarado en 016),
  `activo Boolean @default(true)`, timestamps. `@@unique([adminId, nombre])` e índices por
  `adminId`/`estadoId`/`municipioId`. **Migración** correspondiente.
- Relaciones inversas añadidas en `Estado.puntosAcopio` y `Municipio.puntosAcopio`.
- Capa de dominio: entidad `PuntoAcopio`, contrato `PuntoAcopioRepository`, contrato/puerto para leer
  `estadoId`/`municipioId` del `PerfilAdmin`, y reglas puras (campos no vacíos tras trim, coordenadas
  en rango válido, coherencia estado↔municipio, `perteneceA` para propiedad, `aplicarHerenciaUbicacion`).
- Casos de uso (aplicación): **crear** (aplicando herencia de ubicación), **listar** (los del `ADMIN`
  dueño, con filtro por estado activo/archivado), **editar**, **archivar/activar**, todo con
  **comprobación de propiedad** (`adminId`) y validación de que `municipioId` pertenezca a `estadoId`.
- Infraestructura: `PrismaPuntoAcopioRepository` y adaptador para leer ubicación del `PerfilAdmin`.
- Presentación **solo-`ADMIN` dueño** bajo el área de administración: **listado** de sus puntos,
  **alta** y **edición** con `PuntoAcopioForm` (React Hook Form) con selector dependiente
  estado→municipio (reutilizando el patrón de 020), **mapa Leaflet** para marcar la posición exacta y
  acción de **archivar/activar**. Gated con `requireRol(ADMIN)` (feature 002) más comprobación de
  propiedad.
- Validación en el límite (servidor) con `zod`; mensajes claros de error.
- Tests (Vitest) de los casos de uso: herencia de ubicación al crear, sobrescritura de ubicación,
  rechazo por falta de propiedad (`adminId` ajeno), archivar/activar, filtro por estado, validación
  de coordenadas y de coherencia estado↔municipio.

**No incluye**

- **`PerfilAdmin` y la relación `adminId`** en sí: los aporta la feature 016.
- **El registro/aprobación de cuentas `ADMIN`** (features 015/016).
- **N a N con `Recurso`** ("qué recibe"): fuera de alcance. Un punto es solo ubicación.
- **Modificar el modelo `Aporte`** ni añadirle `puntoAcopioId`: los aportes van a Ayudas.
- **Exposición pública** del punto (transparencia, listado abierto a colaboradores): queda como
  iteración futura.
- **Borrado físico** de puntos (solo archivar).
- **Reserva de cupos, agenda por franjas, ruteo o geocercas.**

## Criterios de aceptación

- [ ] Un `ADMIN` aprobado puede **crear** un punto con `nombre`, `referencia`, coordenadas, `horarios`,
      `telefono` y bandera WhatsApp; queda guardado, asociado a su `adminId`, y aparece en su listado.
- [ ] Al crear un punto sin sobrescribir la ubicación, `estadoId` y `municipioId` **heredan** los del
      `PerfilAdmin` del `ADMIN` dueño; si se indican, **prevalecen** los del formulario.
- [ ] El sistema **rechaza** guardar un punto con `nombre`, `referencia`, `horarios` o `telefono`
      vacíos, con coordenadas fuera de rango, con `estadoId`/`municipioId` inexistentes, o con un
      `municipioId` que no pertenece al `estadoId` elegido; con mensaje claro.
- [ ] El sistema **rechaza** dos puntos del mismo admin con el mismo `nombre`
      (`@@unique([adminId, nombre])`).
- [ ] Un `ADMIN` solo puede **ver, editar y archivar** los puntos cuyo `adminId` es el suyo; intentar
      operar sobre un punto ajeno se **rechaza** en servidor (comprobación de propiedad).
- [ ] El `ADMIN` puede **archivar** un punto (queda `activo = false`) y **reactivarlo**; los archivados
      no se ofrecen por defecto pero se conservan.
- [ ] El **listado** muestra los puntos del `ADMIN` con su estado (activo/archivado) y permite filtrar
      por estado.
- [ ] La UI incluye un **mapa Leaflet** para marcar/editar la posición del punto; al guardar, se
      persisten `latitud` y `longitud`.
- [ ] Un usuario **no-`ADMIN`** (o sin sesión) **no** puede acceder a la gestión de puntos (protegido
      en servidor; redirige/bloquea).
- [ ] La **migración** añade las nuevas columnas a `puntos_acopio` y los índices/FK sin errores.
- [ ] `pnpm test` cubre: herencia y sobrescritura de ubicación, rechazo por `adminId` ajeno,
      archivar/activar, filtros del listado, coordenadas y coherencia estado↔municipio, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `acopio/domain` y `acopio/application` permanecen
      **puras** (sin framework ni Prisma ni Leaflet).

## Notas y riesgos

- **Dependencia de 016 y 020:** la relación `adminId` y la ubicación por catálogo se apoyan en esas
  features. Ambas están integradas ("Hecho ✅").
- **Frontera con 006:** esta feature no toca el modelo `Aporte` ni añade selector de punto al aportar.
  Los aportes siguen ligados a Ayudas.
- **Dependencias nuevas:** `leaflet` + `react-leaflet` (mapa cliente) y sus tipos. Tiles servidos por
  OpenStreetMap (sin API key). Es la primera dependencia nueva declarada en esta feature; aviso
  conforme AGENTS.md.
- **Leaflet en Next 16 (App Router):** Leaflet toca `window` en tiempo de render; el componente del
  mapa debe ser `"use client"` y cargarse con `next/dynamic({ ssr: false })` o equivalente. Leer la
  guía en `node_modules/next/dist/docs/` antes de codificar.
- **Comprobación de propiedad, no solo de rol:** el filtro por `adminId` se aplica en servidor tanto
  al leer como al escribir; un `ADMIN` no debe poder inferir ni tocar puntos de otro centro de acopio.
- **Coherencia estado↔municipio:** el servidor valida que `municipioId` pertenezca a `estadoId`
  (reutilizar la validación de 020 si existe, o replicarla en `acopio/application`).
- **Precisión de coordenadas:** `Decimal(9,6)` da ~10 cm y evita ambigüedades de floats. `latitud` en
  `[-90, 90]`, `longitud` en `[-180, 180]`, validados en dominio.
- **Pureza de capas:** Prisma es infraestructura; Leaflet es UI. El dominio solo define `PuntoAcopio`
  y los contratos. ESLint hace cumplir la dirección de dependencias.
- **Fechas:** `createdAt`/`updatedAt` se formatean en es-VE (`DD/MM/AAAA`) con Luxon; en base UTC.
- **Base local (Windows):** `docker compose up -d` levanta Postgres en `:5435`. En la VM Cursor Cloud
  Postgres corre nativo en `:5432` (ver AGENTS.md).
