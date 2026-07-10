# 016 · Perfil de administrador y centro de acopio

> Estado: **Pendiente** · Depende de: `015 · Rol SUPERADMIN y registro público de administradores` · Conecta con: `011 · Puntos de acopio` · Roadmap: `constitution/roadmap.md`

## Qué hace

Añade a cada cuenta `ADMIN` un **perfil ampliado** que la identifica como **centro de
acopio** de la red. Introduce la entidad `PerfilAdmin` en la base de datos y establece la
relación entre un administrador y sus `PuntoAcopio`:

- **Perfil del administrador (centro de acopio):** datos ampliados de la cuenta `ADMIN`:
  `nombreCuenta`, `estado` (del país), `parroquia`, `telefono`, `correo` y `documento`
  (`tipoDocumento` ∈ `JURIDICO` | `NATURAL` + número). El perfil es único por cuenta `ADMIN`.
- **Captura en el registro público:** el perfil se completa cuando la persona u organización se
  registra como administrador (flujo público introducido en la feature 015), y el `SUPERADMIN`
  lo revisa al aprobar o rechazar la cuenta.
- **Vista y edición del perfil:** el `ADMIN` aprobado puede ver y editar sus datos ampliados
  desde su área de gestión.
- **Relación admin a centro de acopio:** un `ADMIN` funciona como centro de acopio y puede tener
  uno o varios `PuntoAcopio` asociados por `adminId`. Los datos de ubicación de un `PuntoAcopio`
  (estado, parroquia) **heredan por defecto** los del `PerfilAdmin`.

## Por qué

`mission.md` describe al administrador no solo como quien gestiona ayudas, sino como un **centro
de acopio** con identidad propia dentro de la red: aporta el estado del país al que pertenece, su
parroquia, el nombre de la cuenta, teléfono, correo y documento de identidad (jurídico o natural).
Sin esos datos ampliados, el `SUPERADMIN` no tiene con qué **evaluar y dar confianza** a la cuenta
al aprobarla (feature 015), ni la plataforma puede ubicar los puntos de acopio de cada
administrador. Esta feature convierte al `ADMIN` en una entidad con identidad y ubicación
verificables, base sobre la que se apoyan los puntos de acopio (feature 011) y la transparencia.

## Decisiones tomadas

- **Módulo `src/modules/usuarios`:** `PerfilAdmin` es una extensión uno a uno de la entidad
  `Usuario` (rol `ADMIN`) y su ciclo de vida va atado al registro y la aprobación de la cuenta, que
  ya viven en `usuarios`. Se ubica aquí para no fragmentar el agregado de identidad de usuario. La
  relación con `PuntoAcopio` y el CRUD del acopio pertenecen al módulo `src/modules/acopio`
  (feature 011); aquí solo se declara el lado `adminId` y la herencia de ubicación por defecto.
- **Documento con tipo:** `documento` se modela como `tipoDocumento` (`JURIDICO` | `NATURAL`) más
  `numero`, para admitir tanto organizaciones (jurídico) como personas (natural) sin duplicar
  campos.
- **Perfil obligatorio para operar como admin:** una cuenta `ADMIN` sin `PerfilAdmin` completo no
  se considera lista para aprobación; el perfil se captura en el mismo acto del registro público.
- **Herencia de ubicación, no copia rígida:** el `PuntoAcopio` toma estado y parroquia del
  `PerfilAdmin` como valores por defecto, pero puede sobrescribirlos (el detalle es de la 011).

## Alcance

**Incluye**

- Modelo `PerfilAdmin` en Prisma: relación uno a uno con `Usuario` (`usuarioId` único, rol
  `ADMIN`), `nombreCuenta`, `estado`, `parroquia`, `telefono`, `correo`, `tipoDocumento`
  (`JURIDICO` | `NATURAL`), `numeroDocumento`, `createdAt`, `updatedAt`.
- Enum `TipoDocumento { JURIDICO NATURAL }` en el esquema.
- Relación `Usuario (ADMIN) 1 a N PuntoAcopio` mediante `adminId` (se declara el lado admin; el
  modelo `PuntoAcopio` completo es de la feature 011). La herencia por defecto de estado/parroquia
  se documenta como regla.
- **Migración** de Prisma que crea `PerfilAdmin`, su enum y la clave foránea `adminId` prevista
  para `PuntoAcopio`.
- Extensión del **registro público de administrador** (feature 015) para capturar y validar los
  campos del perfil en el mismo formulario.
- **Vista/edición del perfil** para el `ADMIN` aprobado (leer y actualizar sus datos ampliados).
- Presentación de los datos del perfil al `SUPERADMIN` en la **bandeja de aprobación** (feature
  015), para que decida con la información completa.
- Estructura en `src/modules/usuarios` (domain / application / infrastructure / ui) para
  `PerfilAdmin`.
- Tests (Vitest) de los casos de uso: crear perfil válido, rechazar documento sin tipo o sin
  número, y validar el correo/teléfono en el límite.

**No incluye**

- **CRUD de `PuntoAcopio`** (alta, edición, horarios, qué recibe): es la feature `011`. Aquí solo
  se establece la relación `adminId` y la herencia de ubicación por defecto.
- El **rol `SUPERADMIN` y el flujo de registro/aprobación** en sí: los aporta la feature `015`.
  Esta feature se **acopla** a ellos para capturar y mostrar el perfil, sin redefinirlos.
- Verificación externa del documento (no se valida contra un registro oficial; se captura y se
  revisa manualmente al aprobar).
- Gestión de varios perfiles por cuenta o cambio de rol de una cuenta ya creada.

## Criterios de aceptación

- [ ] Al **registrarse como administrador** (flujo público de la feature 015), la persona
      completa `nombreCuenta`, `estado`, `parroquia`, `telefono`, `correo`, `tipoDocumento`
      (`JURIDICO` o `NATURAL`) y número de documento, y queda guardado un `PerfilAdmin` asociado a
      la cuenta.
- [ ] El perfil es **único por cuenta `ADMIN`**: no se pueden crear dos `PerfilAdmin` para el
      mismo `Usuario` (validado en servidor).
- [ ] El **documento exige tipo y número**: un perfil con `tipoDocumento` distinto de `JURIDICO` o
      `NATURAL`, o sin número, se rechaza con un mensaje claro.
- [ ] El `SUPERADMIN` ve los **datos completos del perfil** en la bandeja de aprobación antes de
      aprobar o rechazar la cuenta.
- [ ] Un `ADMIN` aprobado puede **ver y editar** su perfil; los cambios quedan persistidos.
- [ ] La base refleja que un `ADMIN` puede tener **cero, uno o varios `PuntoAcopio`** por
      `adminId` (relación declarada), y un `PuntoAcopio` nuevo **hereda por defecto** el `estado` y
      la `parroquia` del `PerfilAdmin`.
- [ ] La **migración** crea `PerfilAdmin`, el enum `TipoDocumento` y la clave foránea `adminId`.
- [ ] `pnpm test` cubre: creación de perfil válido, rechazo de documento sin tipo/número y
      validación de correo/teléfono en el límite, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `usuarios/domain` y `usuarios/application`
      permanecen **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Dependencia de la feature 015:** el registro público de admin y la bandeja de aprobación del
  `SUPERADMIN` son requisito. Si 015 no está integrada, esta feature no puede capturar ni mostrar
  el perfil en su contexto real. Coordinar el orden de implementación (015 antes que 016).
- **Frontera con la feature 011:** aquí se declara el lado `adminId` de la relación y la regla de
  herencia de ubicación; el modelo y el CRUD de `PuntoAcopio` los completa la 011. Evitar duplicar
  ese alcance.
- **Estado y parroquia como texto vs. catálogo:** de momento se capturan como texto libre
  (estado/parroquia de Venezuela). Un catálogo cerrado de estados/parroquias queda fuera de esta
  feature; si se decide, es una mejora posterior.
- **Validación en el límite:** correo, teléfono y número de documento se validan en el formulario y
  en el servidor (posible `zod`, ya disponible). No se verifica el documento contra fuentes
  oficiales.
- **Fechas:** cualquier fecha visible (`createdAt` del perfil, si se muestra) se formatea en
  es-VE (`DD/MM/AAAA`) con Luxon; en la base se guarda en UTC.
- **Pureza de capas:** Prisma es infraestructura; el dominio solo define la entidad `PerfilAdmin`,
  el enum `TipoDocumento` y los contratos. ESLint hace cumplir la dirección de dependencias.
