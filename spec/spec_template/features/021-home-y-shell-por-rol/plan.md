# 021 · Home y shell de navegación por rol — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas). Enmienda 002 (redirect post-login), 003 (cuándo se muestra el SiteHeader) y
> 008 (generaliza el shell del panel).

## Enfoque general

Orden:
**helper `homePorRol` (puro) → redirect en login/registro → AppShell compartido + nav por rol →
layouts/rutas que montan el shell y ocultan SiteHeader → `/inicio` por rol → tests → validación
visual**.

> ⚠️ Antes de tocar layouts, proxy o server actions de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md).

## 1. Modelo de datos y migración

- **Sin cambios de schema.** No hay tablas ni columnas nuevas.

## 2. Dominio / application — destino post-login

Ubicación sugerida: `src/modules/usuarios/domain/homePorRol.ts` (o
`src/modules/usuarios/application/homePorRol.ts` si se prefiere application puro sin entidad).

```ts
homePorRol(input: {
  rol: Rol;
  estadoVerificacion?: EstadoVerificacion; // relevante para ADMIN
}): string
```

Matriz:

| Rol | Condición | Path |
| --- | --- | --- |
| `SUPERADMIN` | — | `/superadmin/admins` |
| `ADMIN` | `VERIFICADO` | `/panel` |
| `ADMIN` | `PENDIENTE` / `RECHAZADO` / ausente | `/cuenta-admin` |
| `COLABORADOR` | — | `/inicio` |
| `SOLICITANTE` | — | `/inicio` |

- Función **pura** (sin Next, sin Prisma).
- Test Vitest con la matriz completa.
- El guard de `/completar-perfil` (017) sigue aplicándose en las rutas protegidas **después** del
  redirect; no hace falta que `homePorRol` conozca el perfil incompleto.

## 3. Enmienda login / registro (002)

- `src/app/(auth)/login/actions.ts`: dejar de hardcodear `redirectTo: "/"`.
  - Opción A (preferida si Auth.js permite callback dinámico): tras credenciales OK, resolver
    sesión/rol y `redirectTo: homePorRol(...)`.
  - Opción B: `redirectTo` a una ruta puente `/post-login` (server component) que lee sesión,
    calcula `homePorRol` y hace `redirect()`. Más simple si el action no tiene el rol a mano
    antes del redirect de Auth.js.
- Revisar registro: si crea sesión y redirige a `/`, alinear con el mismo puente o
  `homePorRol`.
- Documentar en comentarios que la landing ya no es el home autenticado.

## 4. Navegación unificada por rol

Consolidar en un módulo de UI de shell (p. ej. `src/modules/shell/` o
`src/modules/navegacion/`):

```
src/modules/shell/
├── ui/
│   ├── AppShell.tsx          # generaliza AdminShell
│   ├── Sidebar.tsx
│   ├── MobileSidebar.tsx
│   ├── SidebarNav.tsx        # reutilizar / adaptar el del admin
│   ├── VolverAlSitio.tsx     # Link a `/` con label accesible
│   └── navConfig.ts          # secciones + ítems + iconos POR ROL
└── (sin domain/infrastructure propios)
```

- Migrar `ADMIN_NAV` desde `modules/admin/ui/navConfig.ts` hacia `shell/ui/navConfig.ts`.
- Añadir configs para `COLABORADOR`, `SOLICITANTE`, `SUPERADMIN` (mismos destinos que hoy
  `navItemsPorRol`, con iconos y secciones).
- Deprecar o reducir `navItemsPorRol` del landing: el `SiteHeader` autenticado deja de ser el
  chrome principal; puede quedar vacío para sesión o solo usarse en rutas públicas.

Ítems sugeridos:

- **COLABORADOR:** Inicio (`/inicio`), Actividades (`/ayudas`), Mis aportes (`/mis-aportes`),
  Mi perfil (`/mi-perfil`).
- **SOLICITANTE:** Inicio (`/inicio`), Mis solicitudes (`/solicitudes`), Nueva solicitud,
  Proponer recurso, Mi perfil.
- **SUPERADMIN:** Aprobaciones (`/superadmin/admins`).
- **ADMIN:** conservar secciones actuales del panel (008/016).

## 5. AppShell y layouts

1. Extraer `AdminShell` → `AppShell` parametrizado por `sections` (nav del rol) + slot de sesión.
2. `(admin)/layout.tsx` sigue exigiendo `requireAdminVerificado` y monta `AppShell` con nav ADMIN.
3. Nuevo route group p. ej. `(app-shell)/` o layouts en `(app)/`, `superadmin/`, etc. que monten
   el mismo `AppShell` con la nav del rol.
4. Root layout (`src/app/layout.tsx`): ampliar `esRutaAdmin` a **`esRutaConShell`** — cualquier
   pathname de trabajo autenticado (lista o prefijos: `/panel`, `/inicio`, `/ayudas`,
   `/mis-aportes`, `/solicitudes`, `/mi-perfil`, `/superadmin`, `/cuenta-admin`). En esas rutas
   **no** renderizar `SiteHeader`.
5. **`/completar-perfil` y `(auth)/*`:** sin AppShell ni SiteHeader de trabajo (layout mínimo /
   auth). Evita distracción en el flujo obligatorio.
6. `proxy.ts`: asegurar que las nuevas rutas de shell que requieran sesión estén en
   `requiereSesion` (p. ej. `/inicio`, `/mi-perfil` si aún no lo están).

## 6. Página `/inicio`

- `src/app/(…)/inicio/page.tsx` — server component.
- `requireRol` que acepte `COLABORADOR | SOLICITANTE` (o dos guards + redirect si otro rol llega).
- UI: título + 2–4 atajos (`Link` / botones) según rol. Componentes en
  `src/modules/shell/ui/InicioColaborador.tsx` y `InicioSolicitante.tsx` (o un solo
  `InicioPorRol`).
- Sin queries agregadas nuevas en esta feature (opcional: saludo con `nombre` de sesión).

## 7. Botón «Volver al sitio»

- Componente `VolverAlSitio`: `Link href="/"` con icono + texto «Volver al sitio» (o «Ir a la
  página de inicio pública»).
- Visible en sidebar (desktop) y en el Sheet móvil del shell, cerca del wordmark o del pie de
  sesión — decisión de UI: **preferir debajo del wordmark** para que sea navegación, no acción
  destructiva (cerrar sesión se queda al pie).

## 8. Tests y validación

- Unit: `homePorRol` (matriz).
- Smoke manual: login con cada rol sembrado → destino correcto → sidebar visible → «Volver al
  sitio» → landing con SiteHeader → volver a entrar por login o por URL de home.
- `pnpm test`, `pnpm exec eslint src`, `pnpm build`.

## Orden de implementación sugerido

1. `homePorRol` + tests.
2. Puente o redirect en login.
3. Módulo `shell` (nav + AppShell + VolverAlSitio) migrando desde admin.
4. Layouts + ocultar SiteHeader.
5. `/inicio` para colaborador/solicitante.
6. Shell en superadmin y rutas `(app)`.
7. Limpieza de `navConfig` del landing / docs.

## Fuera de este plan

- Redirect automático `/` → home con sesión.
- Dashboards con métricas para colaborador/solicitante.
- Cambiar URLs de negocio existentes.
