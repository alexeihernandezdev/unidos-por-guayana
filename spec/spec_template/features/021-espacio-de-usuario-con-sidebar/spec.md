# 021 · Espacio del usuario logeado (sidebar) y navbar solo público

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles`, `003 · Landing`, `008 · Panel de administración` (patrón de shell con sidebar) · Roadmap: `constitution/roadmap.md`
>
> _Feature de **experiencia y navegación**: no introduce entidades ni lógica de dominio nuevas. Reorganiza el "chrome" (marco de navegación) de la app según haya o no sesión, y unifica el patrón de shell con sidebar para todos los roles logeados._

## Qué hace

Cuando un usuario **inicia sesión**, deja de navegar con el navbar global (`SiteHeader`) y pasa a un **espacio propio con sidebar**, del mismo estilo que el panel del `ADMIN` (feature 008). El objetivo es que todo usuario autenticado tenga una superficie de trabajo consistente y sin el navbar público.

Concretamente:

- **El navbar global (`SiteHeader`) solo se muestra a visitantes sin sesión.** En cuanto hay sesión iniciada (cualquier rol), el navbar desaparece **en toda la app**, incluidas páginas públicas como la landing (`/`) y transparencia (`/transparencia`). _(Decisión del cliente: "quitar el navbar cuando se está logeado", ámbito global.)_
- **Cada rol logeado tiene un shell con sidebar** (`COLABORADOR`, `SOLICITANTE`, y también `ADMIN` y `SUPERADMIN`, que hoy usan navbar o un contenedor sin sidebar). El sidebar reutiliza el look & feel del panel de admin (wordmark con línea ocre, secciones, ítem activo con borde ocre, cluster de sesión al pie, versión móvil con `Sheet`).
- **La navegación de cada sidebar depende del rol** y reutiliza las **rutas ya existentes** (no se crean pantallas de negocio nuevas):
  - `COLABORADOR`: **Actividades** (`/ayudas`), **Mis aportes** (`/mis-aportes`), **Mi perfil** (`/mi-perfil`).
  - `SOLICITANTE`: **Mis solicitudes** (`/solicitudes`), **Nueva solicitud** (`/solicitudes/nueva`), **Proponer recurso** (`/solicitudes/proponer-recurso`), **Mi perfil** (`/mi-perfil`).
  - `ADMIN`: la navegación actual del panel (008), sin cambios de destino.
  - `SUPERADMIN`: **Aprobaciones** (`/superadmin/admins`).
- **Tras iniciar sesión, el usuario aterriza en su espacio** (no en `/`): un despachador por rol lleva a `COLABORADOR → /ayudas`, `SOLICITANTE → /solicitudes`, `ADMIN → /panel`, `SUPERADMIN → /superadmin/admins`.
- **El shell de admin (008) se generaliza**, no se duplica: los componentes de sidebar/shell pasan a ser reutilizables por parámetro (secciones de navegación + destino del wordmark + etiqueta accesible), y el panel de admin sigue viéndose igual.

## Por qué

Hoy la experiencia logeada es **incoherente por rol**: el `ADMIN` ya disfruta de un shell con sidebar (008) mientras que `COLABORADOR` y `SOLICITANTE` navegan con el navbar público (`SiteHeader` + `navItemsPorRol`), que mezcla identidad "de visitante" (CTAs de "Iniciar sesión / Crear cuenta" desaparecen, pero el marco sigue siendo el mismo) con navegación de trabajo. Unificar todos los roles bajo el mismo patrón de sidebar:

- Da una **superficie de trabajo estable** a cada usuario (menú lateral persistente, sesión siempre visible, versión móvil con hamburguesa).
- **Separa con claridad "descubrir" (público, con navbar) de "operar" (logeado, con sidebar)**, alineado con `mission.md` (la app es una herramienta de coordinación, no un sitio de marketing una vez dentro).
- **Reaprovecha** el trabajo de diseño de 008 en lugar de mantener dos sistemas de navegación en paralelo.

## Decisiones tomadas

- **Ámbito del navbar: se oculta siempre que haya sesión.** El `RootLayout` decide por **presencia de sesión** (no por prefijo de ruta como hoy). Un usuario logeado no ve `SiteHeader` en ninguna ruta. _(Sustituye la condición actual `pathname.startsWith("/panel")`.)_
- **Todos los roles logeados usan el mismo patrón de shell con sidebar**, incluido `SUPERADMIN` (que hoy dependía del navbar para su único enlace "Aprobaciones"): al quitar el navbar globalmente, `SUPERADMIN` quedaría sin navegación, así que se le da también su sidebar. Es coste bajo (una sección con un ítem + cerrar sesión).
- **No se duplica el shell de admin: se generaliza.** Los componentes de 008 (`Sidebar`, `SidebarNav`, `MobileSidebar`, shell) se promueven a un shell **parametrizable** (recibe `secciones`, `homeHref`, `ariaLabel` y el cluster de sesión). El panel de admin lo consume con su config; el nuevo espacio de usuario lo consume con la suya. El aspecto visual del panel de admin **no cambia**.
- **Reutilización de rutas existentes.** El espacio de `COLABORADOR`/`SOLICITANTE` **no** crea páginas de negocio nuevas: enlaza a `/ayudas`, `/mis-aportes`, `/solicitudes`, `/solicitudes/nueva`, `/solicitudes/proponer-recurso`, `/mi-perfil`, que ya existen. Lo nuevo es **el marco (layout + sidebar)** que las envuelve.
- **Consolidación de rutas bajo un route group con layout compartido.** Para que un único `layout.tsx` pueda envolver esas rutas con el shell, las superficies autenticadas no-admin se agrupan bajo un route group (p. ej. `(app)`), **sin cambiar sus URLs** (los route groups no afectan la URL). Las que hoy viven sueltas (`/ayudas`, `/mis-aportes`, `/mi-perfil`) se mueven dentro del grupo.
- **Despacho post-login por rol.** El login deja de redirigir a `/` fijo. Se introduce una función pura `rutaInicioPorRol(rol)` y un punto de entrada que redirige al espacio correcto. `/` y `/transparencia` siguen siendo públicas y accesibles, pero sin navbar cuando hay sesión.
- **Páginas de onboarding sin sidebar (foco).** `/(auth)/*`, `/completar-perfil` y `/cuenta-admin` son flujos de entrada/gate: se mantienen **sin sidebar** (marco mínimo con solo "Cerrar sesión" donde aplique), para no distraer del único paso pendiente.
- **Sin cambios de datos, dominio ni permisos.** La autorización sigue siendo la de 002/015 (`requireRol`, `proxy.ts`, `requireAdminVerificado`). Esta feature solo cambia el **chrome** y el destino post-login.

## Alcance

**Incluye**

- **Navbar condicionado a sesión:** `RootLayout` (`src/app/layout.tsx`) muestra `SiteHeader` **solo** cuando no hay usuario en sesión.
- **Shell reutilizable con sidebar** a partir de los componentes de 008:
  - Generalizar `Sidebar`, `SidebarNav`, `MobileSidebar` y el shell para aceptar `secciones`, `homeHref` y `ariaLabel` por props (hoy `SidebarNav` ya recibe `sections`; `Sidebar`/shell tienen `ADMIN_NAV` y `/panel` hardcodeados).
  - El cluster de sesión (nombre/email + "Cerrar sesión", ya presente en 008) se mantiene compartido.
- **Config de navegación por rol** (`navSectionsPorRol(rol)`), con las secciones descritas arriba para `COLABORADOR`, `SOLICITANTE`, `ADMIN` y `SUPERADMIN`. Reutiliza los destinos de `navItemsPorRol` (landing) para no divergir.
- **Iconos del sidebar** ampliados según haga falta (p. ej. actividades, aportes, solicitudes, perfil) en el mapa `IconoNav`.
- **Route group con layout** para las superficies autenticadas no-admin (p. ej. `(app)/layout.tsx`) que renderiza el shell del usuario con `navSectionsPorRol(rol)`; **mover** las rutas sueltas (`/ayudas`, `/mis-aportes`, `/mi-perfil`) al grupo conservando sus URLs.
- **Layout del `SUPERADMIN`** actualizado para usar el mismo shell (con su sección "Aprobaciones").
- **Despacho post-login por rol:** `rutaInicioPorRol(rol)` (pura, testeable) + ajuste de `iniciarSesionAction` / punto de entrada autenticado para aterrizar en el espacio correcto.
- **Affordance mínima "Ir a mi panel"** en páginas públicas (`/`, `/transparencia`) para usuarios con sesión, para no dejarlos sin salida al ocultar el navbar (ver Notas y riesgos).
- Tests (Vitest) de las piezas puras: `navSectionsPorRol` y `rutaInicioPorRol`.

**No incluye**

- **Nuevas pantallas de negocio** para colaborador/solicitante (no hay dashboard con métricas propias como el de admin en 008; el espacio es el marco + las rutas existentes). Un "resumen" para no-admin es una feature aparte.
- **Cambios en la lógica de negocio** de ayudas, aportes, solicitudes o perfiles.
- **Cambios de permisos o de modelo de datos.**
- **Rediseño visual** del panel de admin: se generaliza el código, pero su aspecto se conserva.
- **Personalización** del sidebar por usuario, colapsado persistente, temas, etc.
- **Notificaciones** o badges en el sidebar (fuera del MVP).

## Criterios de aceptación

- [ ] Un **visitante sin sesión** ve el navbar global (`SiteHeader`) en las páginas públicas (`/`, `/transparencia`), como hoy.
- [ ] Un **usuario con sesión** (cualquier rol) **no** ve el navbar global en ninguna ruta, incluidas `/` y `/transparencia`.
- [ ] Tras **iniciar sesión**, el usuario aterriza en su espacio según rol: `COLABORADOR → /ayudas`, `SOLICITANTE → /solicitudes`, `ADMIN → /panel`, `SUPERADMIN → /superadmin/admins`.
- [ ] `COLABORADOR` y `SOLICITANTE` navegan dentro de un **shell con sidebar** con el mismo estilo que el panel de admin (wordmark con línea ocre, ítem activo con borde ocre + fondo tenue, cluster de sesión al pie, versión móvil con hamburguesa/`Sheet`).
- [ ] El sidebar muestra la navegación correcta por rol (colaborador: Actividades / Mis aportes / Mi perfil; solicitante: Mis solicitudes / Nueva solicitud / Proponer recurso / Mi perfil) y marca el ítem activo por ruta.
- [ ] Las **URLs existentes no cambian** (`/ayudas`, `/mis-aportes`, `/solicitudes`, `/mi-perfil`, etc. siguen respondiendo igual); solo cambia el marco que las envuelve.
- [ ] El **panel de admin (008) se ve igual** que antes (la generalización del shell no altera su aspecto ni su navegación).
- [ ] `SUPERADMIN` conserva acceso a "Aprobaciones" mediante su sidebar (no depende ya del navbar).
- [ ] Las páginas de onboarding (`/login`, `/registro`, `/completar-perfil`, `/cuenta-admin`) se muestran **sin sidebar**, con opción de cerrar sesión donde corresponda.
- [ ] `pnpm test` cubre `navSectionsPorRol` (secciones correctas por rol) y `rutaInicioPorRol` (destino correcto por rol) — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; la capa reutilizada del shell no introduce imports de `infrastructure` en `ui`.

## Notas y riesgos

- **Callejón sin salida en páginas públicas.** Al ocultar el navbar siempre que hay sesión, un usuario logeado que visite `/` o `/transparencia` se quedaría **sin ninguna navegación** (esas páginas no tienen sidebar). Mitigación adoptada: una **affordance mínima "Ir a mi panel"** (un enlace discreto, no el navbar completo) visible en páginas públicas cuando hay sesión, que usa `rutaInicioPorRol`. _Alternativa evaluada:_ redirigir automáticamente al panel a los usuarios logeados que entren a `/` — se descarta para no impedir que un logeado consulte la landing/transparencia a propósito. Confirmar con el cliente si prefiere el redirect duro.
- **Reorganización de rutas = riesgo de regresión.** Mover `/ayudas`, `/mis-aportes`, `/mi-perfil` a un route group `(app)` no cambia URLs, pero hay que revisar imports relativos, `generateMetadata`, y que `proxy.ts` (que protege por prefijo de URL) siga cubriendo esas rutas (los prefijos `/ayudas`, `/mis-aportes`, `/solicitudes` no cambian, así que debería seguir igual). Validar navegando cada ruta.
- **Generalización del shell de admin sin regresiones visuales.** El shell de 008 (`src/modules/admin/ui/*`) es el patrón a promover. Al parametrizarlo, mantener exactamente las mismas clases/eststructura para que el panel de admin no cambie de aspecto. Ubicación sugerida del shell genérico: capa compartida (`src/shared/ui/…`) o un módulo de navegación propio, evitando que el módulo de admin dependa de uno "de usuario" o viceversa (definir en `plan.md`).
- **`SUPERADMIN` con sidebar de un solo ítem.** Es intencionalmente mínimo; no inflar con enlaces que no existen. Su layout actual (`src/app/superadmin/layout.tsx`) pasa de contenedor centrado a shell con sidebar.
- **Fuente de verdad de la navegación.** Hoy conviven `ADMIN_NAV` (admin) y `navItemsPorRol` (navbar landing). Esta feature debe **converger** en una sola config por rol para el sidebar (`navSectionsPorRol`) y evitar que las dos listas se desincronicen. Si el navbar público deja de usar `navItemsPorRol` para roles logeados (porque ya no se muestra), evaluar si esa función queda solo para… nada, y limpiarla o reutilizarla como base de `navSectionsPorRol`.
- **Rendimiento del `RootLayout`.** Pasar a decidir el navbar por sesión implica leer la sesión en el layout raíz (`getUsuarioActual`), algo que ya hacen `SiteHeader` y `Sidebar`. Reutilizar la misma lectura para no duplicar consultas; medir si hace falta.
- **Next 16:** antes de tocar layouts, route groups y server components, leer la guía en `node_modules/next/dist/docs/` (AGENTS.md). Los route groups y layouts anidados tienen semántica propia en el App Router.
