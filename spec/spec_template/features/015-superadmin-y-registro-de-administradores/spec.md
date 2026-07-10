# 015 · Rol SUPERADMIN y registro público de administradores

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles` · Enmienda: `002` · Base de: `016 · Perfil de administrador y centro de acopio` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce el rol **`SUPERADMIN`** como raíz de confianza del sistema y convierte el registro de
**`ADMIN`** en un flujo **público con aprobación**. Es un cambio al modelo base que enmienda la
feature 002 (donde el `ADMIN` se sembraba y no existía el `SUPERADMIN`):

- **Nuevo rol `SUPERADMIN`**: se añade a `Usuario.rol`
  (`SUPERADMIN` | `ADMIN` | `COLABORADOR` | `SOLICITANTE`). No se registra por la app: se **siembra**
  con `pnpm db:seed` y es la única autoridad que aprueba cuentas `ADMIN`.
- **Registro público de `ADMIN`**: cualquiera puede darse de alta como administrador. La cuenta se
  crea con `estadoVerificacion = PENDIENTE` y **no puede operar** (no crea ni gestiona Ayudas,
  recursos, aportes, etc.) hasta que un `SUPERADMIN` la pasa a `VERIFICADO` (o `RECHAZADO`).
- **Bandeja de aprobación del superadmin**: panel donde el `SUPERADMIN` lista las cuentas `ADMIN`
  en `PENDIENTE` y las aprueba (`VERIFICADO`) o las rechaza (`RECHAZADO`).
- **Bloqueo por estado**: un `ADMIN` en `PENDIENTE` o `RECHAZADO` queda impedido de ejecutar
  cualquier acción de administración; solo un `ADMIN` en `VERIFICADO` opera con normalidad.

## Por qué

`mission.md` define ahora **cuatro** tipos de usuario y una cadena de confianza: el `SUPERADMIN` es
la autoridad máxima cuyo único cometido es verificar y aprobar (o rechazar) las cuentas de
administrador, que pasan a registrarse de forma pública. Esto abre la red a nuevos centros de acopio
sin sacrificar la confianza: cualquiera puede postularse como administrador, pero solo opera tras el
visto bueno del superadmin. La feature 002 resolvía el acceso con un `ADMIN` sembrado y cerrado; el
cliente pidió abrir ese registro (revisión de alcance del roadmap), y esta feature implementa ese
cambio en el modelo base sobre el que se apoyan todas las acciones de administración.

## Decisiones tomadas

- **Raíz de confianza sembrada:** el `SUPERADMIN` no es auto-registrable ni promovible desde la app.
  Se crea (o actualiza) por `pnpm db:seed`, con credenciales por variables de entorno. El seed de la
  002 deja de sembrar un `ADMIN` y pasa a sembrar el `SUPERADMIN`.
- **Registro de `ADMIN` público y en `PENDIENTE`:** se elimina el rechazo del rol `ADMIN` en el
  registro de la 002. Ahora `ADMIN` es auto-registrable, pero la cuenta nace en `PENDIENTE` y sin
  capacidad de operar.
- **Enforcement en el límite y en aplicación:** el bloqueo de un `ADMIN` no `VERIFICADO` se aplica
  tanto en las rutas/acciones (guard de servidor) como en los casos de uso, no solo en la UI.
- **Verificación de `ADMIN` a cargo del `SUPERADMIN`:** la verificación de `COLABORADOR` y
  `SOLICITANTE` sigue siendo responsabilidad del `ADMIN` (feature 013) y queda fuera de aquí.

## Alcance

**Incluye**

- Ampliar el enum `Rol` de Prisma con `SUPERADMIN` y su **migración** correspondiente.
- Actualizar la regla de dominio de roles auto-registrables: `ADMIN`, `COLABORADOR` y `SOLICITANTE`
  son auto-registrables; `SUPERADMIN` **no**.
- Que el registro cree las cuentas `ADMIN` con `estadoVerificacion = PENDIENTE`.
- Caso de uso para que el `SUPERADMIN` **apruebe** (`VERIFICADO`) o **rechace** (`RECHAZADO`) una
  cuenta `ADMIN` en `PENDIENTE`, con las transiciones válidas como dominio puro.
- **Bandeja del superadmin**: ruta protegida solo-`SUPERADMIN` que lista cuentas `ADMIN` pendientes
  y expone las acciones aprobar/rechazar.
- **Enforcement**: guard de servidor y comprobación en los casos de uso de administración que
  bloquean a un `ADMIN` en `PENDIENTE` o `RECHAZADO`; helper `requireAdminVerificado()` (o similar).
- Actualizar el **seed** de la 002: sembrar el `SUPERADMIN` (raíz de confianza) en lugar del `ADMIN`.
- Tests (Vitest) de: el registro admite `ADMIN` y lo crea en `PENDIENTE`; el registro rechaza
  `SUPERADMIN`; las transiciones de aprobación/rechazo son válidas; un `ADMIN` no `VERIFICADO` no
  puede ejecutar una acción de administración.

**No incluye**

- **Datos ampliados del `PerfilAdmin`** (`nombreCuenta`, `estado`, `parroquia`, `telefono`, `correo`,
  `documento` con `tipoDocumento`) y su función de centro de acopio: es la feature `016`, que depende
  de esta. Aquí el registro público de `ADMIN` recoge solo los datos base de la 002 (email,
  contraseña, nombre).
- **Verificación de `COLABORADOR` y `SOLICITANTE`** por el `ADMIN`: es la feature `013`.
- **Datos de contacto obligatorios** (cédula/teléfono) de colaborador y solicitante: feature `017`.
- Recuperación de contraseña, verificación de email, OAuth (siguen fuera, como en la 002).
- Notificar por correo al `ADMIN` cuando su cuenta se aprueba o rechaza (se puede añadir con la
  feature `012 · Notificaciones`).

## Criterios de aceptación

- [ ] El enum `Rol` incluye `SUPERADMIN` y la **migración** aplica sin pérdida de datos existentes.
- [ ] Una persona puede **registrarse como `ADMIN`** de forma pública y la cuenta queda creada con
      `estadoVerificacion = PENDIENTE`.
- [ ] El registro **rechaza** cualquier intento de auto-asignarse `SUPERADMIN` (validado en servidor,
      no solo en el formulario).
- [ ] Un `ADMIN` en `PENDIENTE` **no puede** crear ni gestionar Ayudas, recursos ni aportes: la
      ruta/acción de administración se bloquea (demostrado con una acción de ejemplo).
- [ ] Un `ADMIN` en `RECHAZADO` queda igualmente **bloqueado** de las acciones de administración.
- [ ] El `SUPERADMIN` accede a una **bandeja** que lista las cuentas `ADMIN` en `PENDIENTE`.
- [ ] Desde la bandeja, el `SUPERADMIN` **aprueba** una cuenta (pasa a `VERIFICADO`) y, tras ello, ese
      `ADMIN` **sí puede** operar.
- [ ] Desde la bandeja, el `SUPERADMIN` **rechaza** una cuenta (pasa a `RECHAZADO`) y ese `ADMIN`
      sigue **sin poder** operar.
- [ ] La **bandeja del superadmin** no es accesible por `ADMIN`, `COLABORADOR` ni `SOLICITANTE`.
- [ ] El **seed** (`pnpm db:seed`) deja un `SUPERADMIN` inicial que puede iniciar sesión y aprobar
      cuentas; ya no siembra un `ADMIN`.
- [ ] `pnpm test` cubre: registro admite `ADMIN` en `PENDIENTE`, registro rechaza `SUPERADMIN`,
      transiciones de aprobación/rechazo válidas, y bloqueo de `ADMIN` no `VERIFICADO`, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `usuarios/domain` y `usuarios/application` permanecen
      **puras** (sin framework ni Auth.js/Prisma).

## Notas y riesgos

- **Enmienda a la 002:** hay que revisar y ajustar lo que la 002 dejó: el enum `Rol`, la regla de
  roles auto-registrables (antes rechazaba `ADMIN`), el `authorize`/sesión (el rol viaja igual, ahora
  con un valor más) y, sobre todo, el **seed** (pasa de `ADMIN` a `SUPERADMIN`). Documentar el cambio
  para no dejar el seed de la 002 en un estado inconsistente.
- **Migración de datos:** ampliar un enum en PostgreSQL es aditivo y no destructivo; aun así, si ya
  existiera un `ADMIN` sembrado por la 002, decidir si se migra a `SUPERADMIN` o se recrea por seed.
- **Enforcement consistente:** el bloqueo del `ADMIN` no `VERIFICADO` debe vivir en un solo punto de
  verdad reutilizable (helper de servidor + comprobación en los casos de uso), para que ninguna
  acción de administración futura (features 004, 005, 006…) lo olvide.
- **Sesión y estado fresco:** el `estadoVerificacion` puede cambiar mientras el `ADMIN` tiene sesión
  abierta. Decidir si se lee de la sesión (rápido, pero puede quedar obsoleto tras la aprobación) o de
  la base en cada acción sensible (siempre fresco). Preferir base para las acciones de administración.
- **Dependencia de la 016:** esta feature es la **base** del perfil ampliado de administrador; no
  duplicar aquí los campos del `PerfilAdmin`. Solo se deja el registro público y el ciclo de
  aprobación; los datos de centro de acopio los añade la 016.
- **Next 16:** cualquier ajuste a proxy (antes middleware), route handlers o server actions se hace
  leyendo antes la guía en `node_modules/next/dist/docs/` (AGENTS.md).
- **Pureza de capas:** el rol, el enum, las reglas de transición y la de auto-registro son dominio; el
  guard de Next, Auth.js y Prisma son infraestructura. ESLint hace cumplir esta dirección.
