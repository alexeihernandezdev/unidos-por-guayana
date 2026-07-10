# 011 · Puntos de acopio

> Estado: **Pendiente** · Depende de: `016 · Perfil de administrador y centro de acopio` (y por transitividad `015`) · Conecta con: `006 · Aportes` · Roadmap: `constitution/roadmap.md`

> **Base ya disponible (feature 016).** El modelo `PuntoAcopio` existe como stub con la relación
> `adminId` (FK a `Usuario`, un admin tiene 0..N puntos) y su índice; esta feature lo completa
> (nombre, dirección, horarios, qué recibe…) con un `ALTER TABLE`, sin re-crear la relación. La
> función de dominio `ubicacionPorDefecto(perfilAdmin)` (en `src/modules/usuarios/domain/PerfilAdmin.ts`)
> devuelve el `estado`/`parroquia` del `PerfilAdmin` para prellenar la ubicación de un punto nuevo.

## Qué hace

Introduce el **punto de acopio**: el **centro físico de entrega** al que un colaborador puede
llevar lo que aporta. Un **`PuntoAcopio`** es un lugar concreto (con `nombre`, `direccion`,
`horarios` y la lista de recursos que recibe) que **pertenece a un `ADMIN`**. El administrador ya
funciona como centro de acopio (feature 016); esta feature le permite gestionar sus puntos y
materializa el **catálogo de puntos seleccionables** al registrar un `Aporte`.

- **Gestión de puntos de acopio (solo el `ADMIN` dueño):** crear, editar, **listar** y
  **archivar/activar** sus puntos. Cada `ADMIN` administra únicamente los suyos.
- **Pertenencia a un administrador:** cada `PuntoAcopio` referencia a su `ADMIN` (`adminId`,
  relación declarada en la feature 016). Un administrador puede tener uno o varios puntos.
- **Ubicación heredada por defecto:** el `estado` y la `parroquia` de un punto **heredan** los del
  `PerfilAdmin` (feature 016) al crearse, y el `ADMIN` puede **sobrescribirlos** si el punto está en
  otra ubicación.
- **Qué recursos recibe:** cada punto declara qué tipos de recurso admite (referencia al catálogo
  de la feature 004), para orientar al colaborador sobre dónde entregar cada cosa.
- **Catálogo de puntos para el aporte:** el modelo `Aporte` ya referencia opcionalmente el
  `PuntoAcopio` de entrega (feature 006); aquí se expone la lista de puntos **activos** seleccionables
  al registrar un aporte.

## Por qué

`mission.md` describe los **puntos de acopio** como los centros físicos de entrega de la red, y
precisa que **cada punto pertenece a un administrador**: el `ADMIN` funciona como centro de acopio y
puede tener uno o varios puntos. `tech-stack.md` define la entidad `PuntoAcopio` (`nombre`,
`direccion`, `horarios`, qué recibe, `adminId`, ubicación heredada del `PerfilAdmin`) y el `Aporte`
ya la referencia opcionalmente. Sin esta feature, esa referencia queda sin catálogo real: no hay
dónde elegir el punto de entrega. Materializar los puntos da al colaborador una respuesta clara a
"¿a dónde llevo lo que aporto y en qué horario?", y a la transparencia futura, el destino físico de
cada aporte.

## Decisiones tomadas

- **Módulo `src/modules/acopio`.** La entidad y el CRUD de `PuntoAcopio` viven en su propio dominio
  de acopio, como anticipa la feature 016. `PerfilAdmin` (identidad del admin) queda en `usuarios`;
  aquí solo se consume el lado `adminId` y la ubicación heredada.
- **Cada punto pertenece a un `ADMIN` dueño.** La escritura (crear/editar/archivar) está protegida
  por rol **y por propiedad**: un `ADMIN` solo gestiona los puntos cuyo `adminId` es el suyo, validado
  en servidor. No basta con el rol.
- **Archivar en vez de borrar.** Los puntos pueden estar referenciados por aportes (feature 006); un
  borrado dejaría aportes huérfanos. Se usa un campo `activo` (soft-archive): un punto archivado deja
  de ofrecerse para nuevos aportes, pero se conserva para el histórico. No hay borrado físico.
- **Herencia de ubicación, no copia rígida.** Al crear un punto, `estado` y `parroquia` toman por
  defecto los del `PerfilAdmin`, pero el `ADMIN` puede sobrescribirlos. Se guarda el valor efectivo
  del punto (para no romperse si el perfil cambia después).
- **Qué recibe: referencia al catálogo (feature 004).** Los recursos que admite un punto se declaran
  contra `Recurso` existentes y activos, no como texto libre, para coherencia con metas y aportes.
- **`horarios` como texto libre estructurado.** Los horarios varían mucho (días, franjas); se
  capturan como texto (validado no vacío) sin modelar un calendario cerrado en esta etapa.

## Alcance

**Incluye**

- Modelo `PuntoAcopio` en Prisma: `nombre`, `direccion`, `horarios`, `estado`, `parroquia`,
  `adminId` (FK a la cuenta `ADMIN`, relación de la feature 016), `activo` (por defecto `true`),
  timestamps. Relación N a N con `Recurso` (qué recibe) mediante tabla puente. **Migración**
  correspondiente.
- Capa de dominio: entidad `PuntoAcopio`, contrato `PuntoAcopioRepository` y las reglas puras
  (`nombre`/`direccion`/`horarios` no vacíos, `estado`/`parroquia` no vacíos tras aplicar la herencia,
  pertenencia a un `adminId`).
- Casos de uso (aplicación): **crear** (aplicando herencia de ubicación del `PerfilAdmin` si no se
  sobrescribe), **listar** (los del `ADMIN` dueño, con filtro solo-activos; y un listado de puntos
  activos para el aporte), **editar**, **archivar/activar**, todo con **comprobación de propiedad**
  (`adminId`).
- Infraestructura: `PrismaPuntoAcopioRepository`.
- Presentación **solo-`ADMIN` dueño** bajo el área de administración: **listado** de sus puntos,
  **alta** y **edición** mediante formularios (React Hook Form) con `estado`/`parroquia`
  prellenados desde el perfil, selección de qué recursos recibe, y acción de **archivar/activar**.
  Gated con `requireRol(ADMIN)` (feature 002) más comprobación de propiedad.
- Exposición del **catálogo de puntos activos** de un administrador para que el formulario de
  `Aporte` (feature 006) permita elegir el `PuntoAcopio` de entrega (referencia opcional ya existente
  en el modelo).
- Validación en el límite (servidor) con `zod`; mensajes claros de error.
- Tests (Vitest) de los casos de uso: herencia de ubicación al crear, sobrescritura de ubicación,
  rechazo por falta de propiedad (`adminId` ajeno), archivar/activar y filtro solo-activos.

**No incluye**

- **`PerfilAdmin` y la relación `adminId`** en sí: los aporta la feature 016. Aquí se consume el
  lado `adminId` y la herencia de ubicación; no se redefine el perfil.
- **El registro/aprobación de cuentas `ADMIN`** (features 015/016): un punto de acopio solo lo crea
  un `ADMIN` ya aprobado.
- **Modificar el modelo `Aporte`**: la referencia opcional `PuntoAcopio` ya existe (feature 006);
  aquí solo se **alimenta** el selector. Cambios en el flujo de aporte quedan fuera.
- **Borrado físico** de puntos (solo archivar).
- **Mapa/geolocalización** (coordenadas, mapa interactivo), reserva de cupos o agenda de horarios por
  franja: quedan como mejoras posteriores.
- Gestión de puntos por roles distintos del `ADMIN` dueño (el `SUPERADMIN` no gestiona puntos del día
  a día).

## Criterios de aceptación

- [ ] Un `ADMIN` aprobado puede **crear** un punto con `nombre`, `direccion`, `horarios` y los
      recursos que recibe; queda guardado, asociado a su `adminId`, y aparece en su listado.
- [ ] Al crear un punto sin indicar ubicación, `estado` y `parroquia` **heredan** los del
      `PerfilAdmin` del `ADMIN` dueño; si se indican, **prevalecen** los del formulario.
- [ ] El sistema **rechaza** guardar un punto con `nombre`, `direccion` u `horarios` vacíos, o con
      `estado`/`parroquia` vacíos tras la herencia, con un mensaje claro.
- [ ] Un `ADMIN` solo puede **ver, editar y archivar** los puntos cuyo `adminId` es el suyo; intentar
      operar sobre un punto ajeno se **rechaza** en servidor (comprobación de propiedad).
- [ ] El `ADMIN` puede **archivar** un punto (queda `activo = false`) y **reactivarlo**; los
      archivados no se ofrecen por defecto pero se conservan.
- [ ] El **listado** muestra los puntos del `ADMIN` con su estado (activo/archivado) y permite filtrar
      por estado.
- [ ] Un punto declara **qué recursos recibe** eligiendo del catálogo de recursos activos (feature
      004); no se aceptan recursos inexistentes o archivados.
- [ ] El formulario de **`Aporte`** (feature 006) ofrece elegir un `PuntoAcopio` **activo** como
      punto de entrega (referencia opcional), poblado desde este catálogo.
- [ ] Un usuario **no-`ADMIN`** (o sin sesión) **no** puede acceder a la gestión de puntos
      (protegido en servidor; redirige/bloquea).
- [ ] La **migración** crea la tabla `puntos_acopio`, la tabla puente con `recursos` y la FK
      `adminId` sin errores.
- [ ] `pnpm test` cubre: herencia y sobrescritura de ubicación, rechazo por `adminId` ajeno,
      archivar/activar y filtro solo-activos, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `acopio/domain` y `acopio/application` permanecen
      **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Dependencia de la feature 016:** la relación `adminId` y la herencia de ubicación se apoyan en
  `PerfilAdmin`. Si 016 no está integrada, esta feature no tiene de dónde heredar `estado`/`parroquia`
  ni a qué `ADMIN` atar el punto. Coordinar el orden (016 antes que 011).
- **Frontera con la feature 016:** aquí se completa el modelo `PuntoAcopio` y su CRUD; el lado
  `adminId` y la regla de herencia se **declararon** en 016. Evitar duplicar la definición de la
  relación; consumirla.
- **Frontera con la feature 006:** la referencia opcional `Aporte → PuntoAcopio` ya existe. Esta
  feature solo **alimenta** el selector de puntos activos; no cambia el ciclo de vida del aporte.
- **Dependencias:** no debería hacer falta ninguna nueva (`zod`, RHF, Prisma y Auth.js ya están). Si
  se valorara una tabla de datos (data-table), un mapa o una librería nueva, **avisar** antes (límite
  duro).
- **Next 16:** route handlers, server actions y server components cambian respecto a versiones
  previas, leer `node_modules/next/dist/docs/` antes de codificar (AGENTS.md). La gestión vive bajo
  la protección por rol de la feature 002 (`requireRol`, `proxy.ts`).
- **Comprobación de propiedad, no solo de rol:** el filtro por `adminId` se aplica en servidor tanto
  al leer como al escribir; un `ADMIN` no debe poder inferir ni tocar puntos de otro centro de acopio.
- **Estado y parroquia como texto vs. catálogo:** de momento texto libre (heredado del perfil). Un
  catálogo cerrado de estados/parroquias es una mejora posterior compartida con la 016.
- **Pureza de capas:** Prisma es infraestructura; el dominio solo define `PuntoAcopio` y los
  contratos. ESLint hace cumplir la dirección de dependencias.
- **Fechas:** cualquier fecha visible (`createdAt` del punto, si se muestra) se formatea en es-VE
  (`DD/MM/AAAA`) con Luxon; en la base se guarda en UTC.
