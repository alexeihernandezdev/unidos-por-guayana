# 013 · Verificación de usuarios

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles`, `017 · Datos de contacto obligatorios (colaborador y solicitante)` · Relacionada con: `015 · Rol SUPERADMIN y registro público de administradores` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce la **verificación de `COLABORADOR` y `SOLICITANTE`** a cargo del `ADMIN`. Reutiliza el campo
`estadoVerificacion` ∈ `PENDIENTE` | `VERIFICADO` | `RECHAZADO` que ya vive en `Usuario` (definido en
`tech-stack.md`), pero aplicado **solo** a estos dos roles: el `ADMIN` revisa los datos de contacto y
documento de quien quiere aportar o pedir ayuda, y decide si le da el visto bueno. Da confianza sobre
**quién aporta camiones o transporte** y sobre **quién pide ayuda**, sin frenar el flujo existente.

- **Estado por defecto en el registro**: al registrarse, un `COLABORADOR` o `SOLICITANTE` queda en
  `estadoVerificacion = PENDIENTE`. Puede iniciar sesión y usar la plataforma con el alcance de un
  usuario pendiente (ver "Qué habilita estar VERIFICADO"), pero aún no goza de la confianza plena.
- **Bandeja de revisión del `ADMIN`**: panel donde el `ADMIN` lista las cuentas `COLABORADOR` y
  `SOLICITANTE` en `PENDIENTE`, con filtros por rol y estado. Cada fila muestra los **datos de
  contacto** (cédula y teléfono, de la feature 017), el rol y la fecha de registro.
- **Detalle y decisión**: el `ADMIN` abre el detalle de una cuenta, revisa sus datos y **aprueba**
  (`VERIFICADO`) o **rechaza** (`RECHAZADO`). El rechazo puede llevar un `motivo` opcional para dejar
  traza de por qué no se aprobó.
- **Distintivo de verificado**: una cuenta `VERIFICADO` se muestra con un distintivo (badge) en las
  superficies donde su identidad importa: junto al autor de un aporte de transporte y junto al autor de
  una solicitud de ayuda. Da una señal visible de confianza sin bloquear a nadie.
- **Sin bloqueo duro del flujo existente**: a diferencia del `ADMIN` (que en `PENDIENTE` no puede
  operar, ver 015), un `COLABORADOR` o `SOLICITANTE` en `PENDIENTE` **sí** puede usar la plataforma;
  la verificación aporta confianza y puede habilitar acciones de mayor sensibilidad, pero no rompe el
  camino básico ya entregado en 006 y 007.

## Por qué

`mission.md` describe la **Verificación de usuarios** como un módulo de apoyo que "da confianza
validando dos flujos": el `SUPERADMIN` verifica a los `ADMIN` (feature 015) y el `ADMIN` valida a
`COLABORADOR` y `SOLICITANTE`, "en especial quien aporta camiones o pide ayuda". Esta feature 013
implementa **solo el segundo flujo**. Sin ella, cualquiera que se registre puede ofrecer un camión o
pedir ayuda sin que nadie confirme que sus datos son reales; el riesgo de solicitudes falsas o de
aportes de transporte que no se materializan queda sin filtro (riesgo ya anotado en la spec de 007).
La verificación es la pieza que sube la confianza de la red antes de mover recursos reales.

## Decisiones tomadas

- **Reutiliza `estadoVerificacion`, no crea un campo nuevo.** El mismo enum
  `PENDIENTE | VERIFICADO | RECHAZADO` que 015 usa para `ADMIN` sirve para `COLABORADOR` y
  `SOLICITANTE`. Lo que cambia es **quién** aprueba (el `ADMIN`, no el `SUPERADMIN`) y **qué** implica
  el estado (confianza y distintivo, no bloqueo total de operar).
- **Límite de alcance explícito frente a 015.** La verificación de cuentas `ADMIN` la cubre 015 (el
  `SUPERADMIN` aprueba admins y su `PENDIENTE` **sí** bloquea toda operación). Aquí se trata **solo**
  de `COLABORADOR` y `SOLICITANTE`, aprobados por el `ADMIN`. Ambas features comparten el campo pero
  no la autoridad ni las consecuencias; no se duplica la bandeja del superadmin.
- **`PENDIENTE` no bloquea el flujo básico.** Un `COLABORADOR` puede comprometer aportes y un
  `SOLICITANTE` puede crear solicitudes estando `PENDIENTE`; así no se rompe lo entregado en 006 y
  007. La verificación habilita el **distintivo de confianza** y sirve de base para límites futuros
  (ver "Notas y riesgos"), pero el MVP no introduce un bloqueo duro sobre estos dos roles.
- **Consume los datos de la 017 como insumo a verificar.** La cédula y el teléfono obligatorios que
  introduce la feature 017 son justamente lo que el `ADMIN` revisa. Sin la 017, la bandeja no tendría
  datos de contacto sólidos que validar; por eso 013 depende de 017.
- **Máquina de estados de verificación como dominio puro.** Las transiciones válidas
  (`PENDIENTE → VERIFICADO`, `PENDIENTE → RECHAZADO`, y re-revisión desde `RECHAZADO → VERIFICADO`)
  viven en `usuarios/domain` sin dependencias de framework ni Prisma, reutilizables por el flujo del
  `ADMIN` (013) y compatibles con el del `SUPERADMIN` (015).
- **Rechazo con `motivo` opcional.** Deja traza de por qué no se aprobó una cuenta, útil para soporte;
  no se fuerza para no frenar la operación.
- **`VERIFICADO` y `RECHAZADO` no son terminales absolutos.** El `ADMIN` puede reconsiderar una cuenta
  `RECHAZADO` y pasarla a `VERIFICADO` (una persona corrige sus datos). No se contempla revertir un
  `VERIFICADO` a `PENDIENTE` en este MVP; degradar una cuenta ya verificada, si hiciera falta, entra
  como caso de uso propio.
- **Módulo `src/modules/usuarios/`** (ya existente desde 002). No se crea un módulo nuevo: la
  verificación es parte del dominio de usuarios.

## Alcance

**Incluye**

- Modelo Prisma (sobre lo ya existente en `Usuario`):
  - Asegurar el campo `estadoVerificacion EstadoVerificacion @default(PENDIENTE)` y el
    `enum EstadoVerificacion { PENDIENTE VERIFICADO RECHAZADO }` (si 015 ya lo introdujo, esta feature
    lo **reutiliza**; si no, lo añade con su **migración**).
  - Campos de traza en `Usuario`: `verificadoPor` (relación opcional al `ADMIN` que decidió),
    `verificadoEn DateTime?` y `motivoRechazo String?`.
  - **Migración** correspondiente (aditiva, sin pérdida de datos).
- Dominio (`usuarios/domain`): enum `EstadoVerificacion` (const-object + unión, mismos valores que
  Prisma), **máquina de estados** pura de verificación:
  - `puedeVerificar(estado)` (desde `PENDIENTE` o `RECHAZADO`).
  - `puedeRechazar(estado)` (desde `PENDIENTE`).
  - `esVerificado(estado)` → helper para la UI y los guards.
  - Regla de dominio que restringe la verificación por `ADMIN` a los roles `COLABORADOR` y
    `SOLICITANTE` (no aplica a `ADMIN` ni `SUPERADMIN`).
- Casos de uso (`usuarios/application`), puros, solo dependen de `domain`:
  - `listarPendientesDeVerificacion(deps, filtro?)`: cuentas `COLABORADOR`/`SOLICITANTE` con filtros
    por rol y estado (por defecto `PENDIENTE`).
  - `obtenerCuentaAVerificar(deps, id)`: detalle con datos de contacto (cédula, teléfono) y documento.
  - `verificarUsuario(deps, usuarioId, adminId)`: valida rol objetivo y transición; pasa a
    `VERIFICADO`, registra `verificadoPor` y `verificadoEn`.
  - `rechazarUsuario(deps, usuarioId, adminId, motivo?)`: valida rol y transición; pasa a `RECHAZADO`
    con `motivoRechazo`.
  - Errores de aplicación: `UsuarioNoEncontradoError`, `RolNoVerificableError` (si el objetivo es
    `ADMIN`/`SUPERADMIN`), `TransicionVerificacionInvalidaError`, `NoAutorizadoError`.
- Infraestructura (`usuarios/infrastructure`): ampliar `PrismaUsuarioRepository` con
  `listarPorRolYEstado(filtro)`, `buscarPorId` (con datos de verificación) y
  `cambiarEstadoVerificacion(id, estado, adminId, motivo?)`.
- Presentación (bajo `/(admin)/panel/…`):
  - `/(admin)/panel/verificaciones`: **bandeja** con filtros por rol (`COLABORADOR` | `SOLICITANTE`)
    y estado; muestra cédula, teléfono, rol y fecha de registro (formato `DD/MM/AAAA`, Luxon `es-VE`).
  - `/(admin)/panel/verificaciones/[id]`: **detalle** con datos de contacto y documento, y acciones
    **verificar** y **rechazar** (con `motivo` opcional).
  - Server actions con `zod`, `requireRol(ADMIN)` (y `requireAdminVerificado` de 015 cuando exista) y
    `revalidatePath`.
  - **Distintivo de verificado** (`VerificadoBadge`) reutilizable, mostrado junto al autor de un aporte
    de transporte (006) y al autor de una solicitud (007).
- Tests (Vitest): máquina de estados (transiciones válidas e inválidas); `verificarUsuario` y
  `rechazarUsuario` (rol válido/ inválido, transición válida/ inválida, traza `verificadoPor`/`motivo`);
  que un `COLABORADOR`/`SOLICITANTE` nace en `PENDIENTE`; que la bandeja y las acciones exigen
  `requireRol(ADMIN)`.

**No incluye**

- **Verificación de cuentas `ADMIN`** por el `SUPERADMIN`: es la feature `015` (bandeja del superadmin,
  bloqueo duro del `ADMIN` no verificado). Aquí se comparte el campo `estadoVerificacion`, no el flujo.
- **Introducir `cedula` y `telefono`** en el registro de colaborador y solicitante: eso lo aporta la
  feature `017`. Esta 013 los **consume** como dato a verificar; si 017 aún no está, la bandeja muestra
  los datos base disponibles.
- **Bloqueo duro** de `COLABORADOR`/`SOLICITANTE` en `PENDIENTE` (no pueden aportar ni solicitar). El
  MVP mantiene el flujo abierto; los límites por estado quedan como decisión futura documentada.
- **Verificación documental automática** (OCR de cédula, cruce con registros oficiales, terceros): la
  revisión es manual y a criterio del `ADMIN`.
- **Notificar** al usuario cuando su cuenta se aprueba o rechaza: llega con la feature
  `012 · Notificaciones`.
- **Adjuntar documentos** (foto de cédula, etc.) subidos por el usuario: no hay carga de archivos en
  este MVP; el `ADMIN` valida con los datos de texto (cédula, teléfono, documento).
- **Historial de verificaciones** o auditoría más allá de `verificadoPor` / `verificadoEn` /
  `motivoRechazo`.

## Criterios de aceptación

- [ ] Un `COLABORADOR` o `SOLICITANTE` recién registrado queda con
      `estadoVerificacion = PENDIENTE` (verificado en servidor, no solo en la UI).
- [ ] El `ADMIN` accede a una **bandeja** en `/(admin)/panel/verificaciones` que lista las cuentas
      `COLABORADOR` y `SOLICITANTE`, con filtros por rol y estado (por defecto `PENDIENTE`).
- [ ] En el **detalle** de una cuenta, el `ADMIN` ve los **datos de contacto** (cédula y teléfono) y el
      documento, y las fechas se muestran en formato `DD/MM/AAAA` (Luxon, locale `es-VE`).
- [ ] El `ADMIN` puede **verificar** una cuenta `PENDIENTE`: pasa a `VERIFICADO` y queda registrado
      `verificadoPor` (el admin) y `verificadoEn`.
- [ ] El `ADMIN` puede **rechazar** una cuenta `PENDIENTE`: pasa a `RECHAZADO`, con `motivoRechazo`
      opcional guardado.
- [ ] El `ADMIN` puede **re-verificar** una cuenta `RECHAZADO` (pasa a `VERIFICADO`); no puede aplicar
      transiciones inválidas (validado en servidor).
- [ ] El sistema **rechaza** intentar verificar o rechazar una cuenta cuyo rol sea `ADMIN` o
      `SUPERADMIN` (esas las gestiona 015): devuelve `RolNoVerificableError`.
- [ ] Una cuenta `VERIFICADO` muestra un **distintivo de verificado** junto al autor de sus aportes de
      transporte (006) y de sus solicitudes (007).
- [ ] Un `COLABORADOR`/`SOLICITANTE` en `PENDIENTE` **sigue pudiendo** usar el flujo básico ya
      entregado (aportar en 006, solicitar en 007): la verificación no lo bloquea.
- [ ] La **bandeja y las acciones** exigen `requireRol(ADMIN)`; un `COLABORADOR`, `SOLICITANTE` o
      visitante no accede.
- [ ] La **migración** (si aplica) añade los campos de traza y reutiliza el enum sin pérdida de datos.
- [ ] `pnpm test` cubre: estado inicial `PENDIENTE`, transiciones válidas/inválidas, rol no verificable,
      traza de verificación y rechazo, y el guard de rol, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `usuarios/domain` y `usuarios/application` permanecen
      **puras** (sin framework ni Auth.js/Prisma).

## Notas y riesgos

- **Dependencias:** ninguna nueva. Zod/RHF/Prisma/Auth.js/Luxon ya están. Reutiliza `requireRol` de
  002 y, cuando exista, `requireAdminVerificado` de 015 (un `ADMIN` no verificado no debería poder
  verificar a otros).
- **Reutilización del campo `estadoVerificacion`:** coordinar con 015 para que el enum y el campo se
  definan **una sola vez** en `Usuario`. Si 015 se implementa antes, 013 solo añade los campos de traza
  (`verificadoPor`, `verificadoEn`, `motivoRechazo`) y los casos de uso del `ADMIN`. Documentar en la
  migración qué introduce cada feature para no colisionar.
- **Insumo de la 017:** la calidad de la verificación depende de que cédula y teléfono existan y sean
  obligatorios (017). Si 013 se aborda antes que 017, la bandeja mostrará solo los datos base de 002 y
  el criterio del `ADMIN` será más débil; preferible entregar 017 antes.
- **No bloquear el flujo:** el mayor riesgo es acoplar la verificación a acciones ya entregadas (006,
  007) y romperlas. Mantener `PENDIENTE` como estado plenamente operativo para estos dos roles; si en
  el futuro se decide limitar (por ejemplo, exigir `VERIFICADO` para aportar transporte o para que una
  solicitud sea visible en el tablero público), hacerlo como caso de uso explícito y opcional, no como
  bloqueo silencioso.
- **Distinción visible frente a 015:** cuidar que la UI del `ADMIN` (013) y la del `SUPERADMIN` (015)
  no se confundan: son bandejas distintas, con roles objetivo y autoridad distintos, aunque compartan
  el vocabulario de estados.
- **Sesión y estado fresco:** como en 015, el `estadoVerificacion` puede cambiar con la sesión abierta.
  Para el distintivo basta leer el estado al renderizar; si en el futuro habilita acciones sensibles,
  leer de la base en cada acción y no confiar solo en la sesión.
- **Next 16:** cualquier ajuste a proxy (antes middleware), route handlers o server actions se hace
  leyendo antes la guía en `node_modules/next/dist/docs/` (AGENTS.md).
- **Pureza de capas:** el enum, la máquina de estados y la regla de "roles verificables por el `ADMIN`"
  son dominio; el guard de Next, Auth.js y Prisma son infraestructura. ESLint hace cumplir la
  dirección de dependencias.
