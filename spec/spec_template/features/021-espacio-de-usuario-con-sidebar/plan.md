# 021 · Espacio del usuario logeado (sidebar) y navbar solo público — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros). **Sin dependencias npm nuevas.**

## Enfoque general

Es una feature de **chrome/navegación**, no de dominio. El trabajo es, en orden:

1. **Generalizar** el shell con sidebar de 008 para que sea reutilizable por rol.
2. **Config de navegación por rol** (`navSectionsPorRol`) como única fuente de verdad del sidebar.
3. **Route group con layout** para las superficies autenticadas no-admin, moviendo las rutas sueltas dentro.
4. **Condicionar el navbar** a "sin sesión" en el `RootLayout`.
5. **Despacho post-login por rol** (`rutaInicioPorRol`) + ajuste del login y affordance "Ir a mi panel".
6. Tests de las piezas puras + validación manual de cada rol.

> ⚠️ Antes de tocar layouts, route groups o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La autorización reutiliza 002/015 sin cambios.

## 1. Modelo de datos y migración

- **Sin cambios.** No hay tablas, enums ni columnas nuevas. No hay migración.

## 2. Generalizar el shell con sidebar (a partir de 008)

Componentes fuente (a promover/parametrizar): `src/modules/admin/ui/{Sidebar,SidebarNav,MobileSidebar,AdminShell,navConfig}.tsx`.

- **Ubicación del shell genérico:** capa compartida de UI, p. ej. `src/shared/ui/app-shell/` (o un módulo de navegación `src/modules/navegacion/ui/`). Elegir una que **no** acople "admin" ↔ "usuario". _Recomendado:_ `src/shared/ui/app-shell/` porque es chrome transversal a roles.
  - `AppShell({ secciones, homeHref, ariaLabel, children })` — server component: lee la sesión con `getUsuarioActual`, renderiza `AppSidebar` (desktop) + topbar móvil con `MobileSidebar` + `<main>`. Es la versión parametrizada de `AdminShell`.
  - `AppSidebar({ secciones, homeHref, ariaLabel, usuario })` — versión de `Sidebar` sin `ADMIN_NAV`/`/panel` hardcodeados.
  - `SidebarNav` ya recibe `sections`; moverlo aquí tal cual (o dejarlo y reexportar). Ampliar el mapa `IconoNav`/`ICONOS` con los iconos que falten.
  - `MobileSidebar` recibe el slot de sesión como hoy; parametrizar `homeHref`/`ariaLabel` si los usa.
- **Cluster de sesión** (nombre/email + `cerrarSesionAction`) se mantiene compartido dentro del shell.
- **`AdminShell` pasa a ser un wrapper delgado** que llama a `AppShell` con `ADMIN_NAV`, `homeHref="/panel"`, `ariaLabel="Panel de administración"`. El aspecto del panel de admin **no debe cambiar** (mismas clases).

## 3. Config de navegación por rol (única fuente de verdad)

- Crear `navSectionsPorRol(rol): AdminNavSection[]` (renombrar el tipo a algo neutral, p. ej. `NavSection`/`NavItem` del shell) en el módulo del shell:
  - `ADMIN`: las secciones actuales de `ADMIN_NAV` (Operación / Catálogo / Mi cuenta).
  - `SUPERADMIN`: sección "Aprobaciones" → `/superadmin/admins` (exact).
  - `COLABORADOR`:
    - Operación: **Actividades** `/ayudas` (exact), **Mis aportes** `/mis-aportes` (exact).
    - Mi cuenta: **Mi perfil** `/mi-perfil` (exact).
  - `SOLICITANTE`:
    - Operación: **Mis solicitudes** `/solicitudes` (exact), **Nueva solicitud** `/solicitudes/nueva` (exact), **Proponer recurso** `/solicitudes/proponer-recurso` (exact).
    - Mi cuenta: **Mi perfil** `/mi-perfil` (exact).
- **Convergencia con `navItemsPorRol` (landing):** los destinos deben coincidir con los ya definidos en `src/modules/landing/ui/navConfig.ts`. Reutilizar/derivar para no divergir. Como el navbar ya no se muestra a roles logeados, `navItemsPorRol` deja de usarse para ADMIN/COLABORADOR/SOLICITANTE/SUPERADMIN; evaluar limpiar o basar `navSectionsPorRol` en ella.
- Ampliar `IconoNav` con los iconos nuevos (p. ej. `aportes`, `misSolicitudes`, `nuevaSolicitud`, `proponer`) y su mapeo lucide en `SidebarNav` (client).

## 4. Route group con layout para el espacio de usuario

- Crear (o reutilizar) el route group `(app)` con `src/app/(app)/layout.tsx`:
  - `const usuario = await requireRol(Rol.COLABORADOR, Rol.SOLICITANTE)` (o el guard que aplique; ver 002/017 y `requireRol` en `src/shared/auth/session.ts`, que ya redirige a `/completar-perfil` cuando falta perfil).
  - Renderiza `<AppShell secciones={navSectionsPorRol(usuario.rol)} homeHref={rutaInicioPorRol(usuario.rol)} ariaLabel="Tu espacio">{children}</AppShell>`.
- **Mover al grupo** las rutas hoy sueltas, **sin cambiar URLs** (route group entre paréntesis no afecta el path):
  - `src/app/ayudas/**` → `src/app/(app)/ayudas/**`.
  - `src/app/mis-aportes/**` → `src/app/(app)/mis-aportes/**`.
  - `src/app/mi-perfil/**` → `src/app/(app)/mi-perfil/**`.
  - `src/app/(app)/solicitudes/**` ya está en el grupo; queda igual.
  - Revisar `aportes/actions.ts` (en `src/app/aportes`) y otros server actions referenciados por estas rutas: mover o reapuntar imports si hace falta.
- **Onboarding sin sidebar:** `/(auth)/*`, `/completar-perfil`, `/cuenta-admin` **no** entran en el grupo con shell. Se mantienen con marco mínimo (solo "Cerrar sesión" donde aplique).
- **Verificar `proxy.ts`:** los prefijos protegidos (`/ayudas`, `/mis-aportes`, `/solicitudes`, `/panel`, `/superadmin`, `/cuenta-admin`) no cambian, así que la protección por prefijo sigue válida. Confirmar tras mover.

## 5. Navbar condicionado a sesión

- En `src/app/layout.tsx`:
  - Sustituir la condición `pathname.startsWith("/panel")` por presencia de sesión:
    `const usuario = await getUsuarioActual(); … {!usuario && <SiteHeader />}`.
  - Ya no hace falta leer `x-pathname` para decidir el navbar (mantener el header si otras piezas lo usan; si no, se puede simplificar `proxy.ts`, pero **no** eliminarlo si algo depende de `x-pathname`).
- El `SiteHeader` público mantiene su comportamiento actual para visitantes (wordmark + CTAs de auth).

## 6. Despacho post-login por rol

- Crear `rutaInicioPorRol(rol: Rol): string` (pura) junto a la config de navegación o en `shared/auth`:
  - `ADMIN → "/panel"`, `SUPERADMIN → "/superadmin/admins"`, `COLABORADOR → "/ayudas"`, `SOLICITANTE → "/solicitudes"`.
- **Login:** en `src/app/(auth)/login/actions.ts`, `signIn("credentials", …)` usa `redirectTo`. Como el destino depende del rol (que se conoce tras autenticar), opciones:
  - (a) `redirectTo` a un **despachador** `/inicio` (server component que lee la sesión y hace `redirect(rutaInicioPorRol(rol))`). Sencillo y robusto.
  - (b) Resolver el usuario por email antes de `signIn` para calcular el destino. Más frágil; preferir (a).
  - _Recomendado:_ (a) con una ruta `/inicio` mínima.
- **Affordance "Ir a mi panel":** componente pequeño (client o server) que, si hay sesión, muestra un enlace a `rutaInicioPorRol(rol)`. Colocarlo en las páginas públicas (`/`, `/transparencia`) o en su layout, visible solo con sesión. No es el navbar completo.

## 7. Tests (Vitest)

- `rutaInicioPorRol`: destino correcto para los cuatro roles.
- `navSectionsPorRol`: cada rol devuelve sus secciones/ítems esperados (labels + hrefs), y roles distintos no se solapan.
- Ambas son funciones puras (sin framework), fáciles de testear en `application`/`domain` del módulo del shell o en `shared`.

## Decisiones

- **Chrome por sesión, no por ruta.** El marco lo decide "hay sesión o no", más simple y coherente que enumerar prefijos.
- **Un solo shell parametrizado** para todos los roles; admin deja de tener shell propio (pasa a ser config).
- **Rutas de negocio intactas**; solo se envuelven en un layout nuevo vía route group (URLs iguales).
- **Despacho por rol mediante `/inicio`** para no acoplar el login al rol antes de autenticar.
- **Sin dependencias nuevas**; se reutilizan `lucide-react`, `Sheet` (shadcn) y utilidades ya presentes.

## Validación final

1. `docker compose up -d` (o el Postgres nativo del VM; ver AGENTS.md) y usuarios sembrados de cada rol (`db:seed`).
2. `pnpm test` (nuevas piezas puras en verde).
3. `pnpm lint` (`pnpm exec eslint src`) / `pnpm build` sin errores.
4. `pnpm dev`, y por cada rol:
   - Login → aterriza en el espacio correcto.
   - Sidebar con la navegación esperada; ítem activo correcto al navegar; versión móvil (hamburguesa/`Sheet`) funcional.
   - Navbar **ausente** en cualquier ruta estando logeado, incluidas `/` y `/transparencia`; en esas dos, aparece la affordance "Ir a mi panel".
   - Sin sesión: navbar presente en páginas públicas; login/registro sin sidebar.
   - Panel de admin (008) idéntico al de antes.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `021` a **Hecho ✅**.
- Generar/actualizar `DOC/features/021-espacio-de-usuario-con-sidebar.md` con lo entregado.
