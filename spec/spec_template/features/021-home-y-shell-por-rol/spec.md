# 021 · Home y shell de navegación por rol

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles`, `003 · Landing`, `008 · Panel de administración`, `015 · SUPERADMIN` · Enmienda: `002` (redirect post-login), `003` (chrome del SiteHeader), `008` (shell del panel se generaliza) · Roadmap: `constitution/roadmap.md`

## Qué hace

Tras iniciar sesión, **cada usuario deja de quedarse en la landing** y entra a su **panel de
funcionalidades** (home por rol). En esas rutas de trabajo, **todos los roles autenticados** ven un
**sidebar** con la navegación de su rol (no el navbar público de la landing) y un **botón claro
para volver al sitio público** (`/`).

Concretamente:

- **Redirección post-login** — el login ya no usa `redirectTo: "/"`. Según el rol (y el estado de
  verificación del `ADMIN`) se envía al home correspondiente.
- **Home por rol** — superficie de entrada con accesos a las funciones que ya existen:
  - `SUPERADMIN` → bandeja de aprobaciones (`/superadmin` o `/superadmin/admins`).
  - `ADMIN` verificado → panel existente (`/panel`).
  - `ADMIN` pendiente/rechazado → `/cuenta-admin` (sin cambiar el flujo de 015).
  - `COLABORADOR` → `/inicio` con atajos a actividades, mis aportes y perfil.
  - `SOLICITANTE` → `/inicio` con atajos a solicitudes, proponer recurso y perfil.
- **Shell con sidebar para todos** — las rutas de trabajo autenticadas (panel, inicio,
  aportes, solicitudes, superadmin, perfil, etc.) usan un **AppShell** compartido (sidebar +
  main), generalizando el patrón actual de `AdminShell`. El `SiteHeader` de la landing **no** se
  muestra en esas rutas.
- **Botón «Volver al sitio»** — en el sidebar (y en el menú móvil del shell) hay un enlace/botón
  de navegación hacia `/` (landing pública), para quien quiera volver al contenido de bienvenida
  sin cerrar sesión.

Los guards existentes (`completar-perfil`, `requireAdminVerificado`, `requireRol`) **siguen
teniendo prioridad** sobre el home: si el perfil está incompleto o el admin no está verificado, se
redirige primero a esas pantallas.

## Por qué

Hoy el login deja al usuario en `/` con el navbar de la landing. El `ADMIN` ya tiene un shell con
sidebar en `/panel/*`, pero `COLABORADOR`, `SOLICITANTE` y `SUPERADMIN` siguen navegando como si
estuvieran en el sitio público. Eso rompe la expectativa de «entrar a mi espacio de trabajo» y
hace menos visible qué puede hacer cada rol. El cliente pide que, al iniciar sesión, cada uno
llegue a su panel y que la navegación de trabajo sea un sidebar con salida clara a la landing.

## Decisiones tomadas

- **Un solo patrón de chrome autenticado.** Se generaliza el shell del admin (`AdminShell` →
  `AppShell` o equivalente en un módulo compartido de UI de navegación). El sidebar recibe la
  config de nav **por rol**; no se inventa un navbar distinto por rol encima de la landing.
- **Landing sigue pública.** `/` no exige sesión. Un usuario autenticado **puede** visitarla vía el
  botón «Volver al sitio». No se fuerza un redirect automático de `/` → home en esta feature
  (evita sorprender a quien quiere leer la landing estando logueado); el cambio crítico es el
  **destino del login** y el chrome de las rutas de trabajo.
- **Home ligero para colaborador y solicitante.** `/inicio` es agregación/navegación (atajos +
  copy breve), no un dashboard con métricas nuevas. El panel rico del admin (008) no se duplica.
- **Reutilizar destinos existentes.** Los ítems del sidebar reutilizan las rutas ya protegidas
  (`/ayudas`, `/mis-aportes`, `/solicitudes`, `/panel/*`, `/superadmin/admins`, `/mi-perfil`). No
  se mueven módulos de dominio; solo se cambia presentación y routing de entrada.
- **Unificar configs de nav.** Hoy hay `navItemsPorRol` (navbar landing) y `ADMIN_NAV` (sidebar
  admin). Esta feature consolida la fuente de verdad de navegación autenticada (por rol, con
  iconos/secciones) y deja el `SiteHeader` solo para visitante / rutas públicas (auth, landing).
- **Sin dependencias nuevas.** Reutiliza Sheet/sidebar ya usados en el panel admin.
- **Enmienda acotada a 002/003/008.** No cambia reglas de negocio de aportes, solicitudes ni
  panel; solo redirect, layout y home de entrada.

## Alcance

**Incluye**

- Helper puro `homePorRol(rol, estadoVerificacion?)` → path de destino post-login (y reutilizable
  desde registro si aplica).
- Cambio de `iniciarSesionAction` (y registro si hoy redirige a `/`) para usar ese destino.
- Ruta `/inicio` (server component) para `COLABORADOR` y `SOLICITANTE`: contenido distinto por
  rol, con atajos a sus funciones.
- Generalización del shell:
  - Sidebar + topbar móvil + cluster de sesión + cerrar sesión.
  - Botón/enlace **«Volver al sitio»** → `/`.
  - Nav por rol (secciones + ítems + iconos).
- Layout(s) de App Router que envuelvan las rutas de trabajo autenticadas con el shell y **oculten**
  el `SiteHeader` (ampliar la lógica actual de `x-pathname` / root layout más allá de `/panel`).
- Aplicar el mismo shell a `SUPERADMIN` (`/superadmin/*`) y a las rutas de colaborador/solicitante
  que hoy solo tienen navbar.
- Tests unitarios de `homePorRol` (matriz de roles / estados de admin).
- Actualizar `DOC/` de cliente y criterios de aceptación.

**No incluye**

- Nuevas métricas o casos de uso de negocio en `/inicio` (solo navegación/atajos).
- Rediseño visual profundo de la landing o del panel 008.
- Mover físicamente las rutas de negocio (`/ayudas` → otra URL); solo chrome y home.
- Forzar redirect de `/` → home cuando hay sesión (queda como mejora opcional posterior).
- Notificaciones, verificación de colaboradores/solicitantes, ni cambios de permisos.

## Criterios de aceptación

- [ ] Tras login con credenciales válidas, el usuario **no** permanece en la landing: llega a su
      home por rol (`/panel`, `/inicio`, `/superadmin/admins` o `/cuenta-admin` según corresponda).
- [ ] Un `ADMIN` pendiente/rechazado sigue yendo a `/cuenta-admin`; uno verificado a `/panel`.
- [ ] Si aplica el guard de perfil incompleto (017), el destino efectivo es `/completar-perfil`
      **antes** del home.
- [ ] En rutas de trabajo autenticadas, el usuario ve un **sidebar** (desktop) / menú lateral
      (móvil) con los ítems de su rol; **no** ve el `SiteHeader` de la landing.
- [ ] El sidebar incluye un control **«Volver al sitio»** (o equivalente) que navega a `/`.
- [ ] `COLABORADOR` y `SOLICITANTE` tienen `/inicio` con atajos a sus funciones principales.
- [ ] `SUPERADMIN` opera bajo el mismo patrón de shell (sidebar + volver al sitio).
- [ ] Visitante sin sesión en `/` sigue viendo la landing con `SiteHeader` (login/registro).
- [ ] `pnpm test` cubre `homePorRol` (matriz de roles) — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores nuevos en el alcance de esta feature.

## Notas y riesgos

- **Doble chrome:** hay que listar con cuidado qué pathnames ocultan el `SiteHeader` y montan el
  shell (incluir `/inicio`, `/ayudas`, `/mis-aportes`, `/solicitudes`, `/mi-perfil`,
  `/completar-perfil`?, `/superadmin`, `/panel`, `/cuenta-admin`). Decidir si
  `/completar-perfil` usa shell mínimo o layout de auth; preferir **layout simple sin sidebar**
  para completar perfil (flujo obligatorio, menos distracción) y documentarlo en el plan.
- **Registro:** si el registro hoy redirige a `/` o a login, alinear el primer aterrizaje post-
  sesión con `homePorRol` cuando quede sesión abierta.
- **A11y:** el botón «Volver al sitio» debe ser un enlace semántico (`Link`), no solo un icono
  sin etiqueta.
- **Enmienda 008:** el `AdminShell` actual se convierte en consumidor del shell compartido; no
  romper el look del panel admin (misma identidad visual).
