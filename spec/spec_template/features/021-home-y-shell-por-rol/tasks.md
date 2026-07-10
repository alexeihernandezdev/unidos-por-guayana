# 021 · Home y shell de navegación por rol — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta
> `plan.md`. Enmienda 002, 003 y 008.

## 0. Preparación

- [ ] Leer guía Next.js 16 en `node_modules/next/dist/docs/` (layouts, redirect, proxy/headers).
- [ ] Repasar `AdminShell`, `SiteHeader`, `login/actions.ts`, `proxy.ts` y `navItemsPorRol`.
- [ ] Confirmar que no hacen falta dependencias nuevas.

## 1. Destino post-login (puro)

- [ ] Implementar `homePorRol({ rol, estadoVerificacion? })` en el módulo `usuarios`.
- [ ] Test Vitest con matriz: SUPERADMIN, ADMIN×estados, COLABORADOR, SOLICITANTE.
- [ ] Mantener la función pura (sin Next / Prisma / Auth.js).

## 2. Redirect en auth (enmienda 002)

- [ ] Cambiar `iniciarSesionAction` para no usar `redirectTo: "/"`.
- [ ] Implementar opción elegida en el plan (callback dinámico **o** ruta puente `/post-login`).
- [ ] Alinear registro / primer aterrizaje con sesión si hoy cae en `/`.
- [ ] Verificar que 017 (`/completar-perfil`) y 015 (`/cuenta-admin`) siguen ganando cuando aplica.

## 3. Módulo shell (UI compartida)

- [ ] Crear `src/modules/shell/ui/` con `AppShell`, `Sidebar`, `MobileSidebar`, `SidebarNav`,
      `VolverAlSitio`, `navConfig` por rol.
- [ ] Migrar nav/iconos del admin desde `modules/admin/ui` al shell (dejar re-exports finos si
      hace falta para no romper imports).
- [ ] Añadir nav COLABORADOR, SOLICITANTE y SUPERADMIN.
- [ ] Incluir enlace «Volver al sitio» → `/` (accesible, con label).

## 4. Layouts y chrome (enmienda 003 / 008)

- [ ] `(admin)/layout.tsx` usa `AppShell` con nav ADMIN (mismo look que hoy).
- [ ] Layout(s) para rutas de colaborador/solicitante (`/inicio`, `/ayudas`, `/mis-aportes`,
      `/solicitudes`, `/mi-perfil`) montan `AppShell` con nav del rol.
- [ ] `superadmin/layout.tsx` monta `AppShell` con nav SUPERADMIN.
- [ ] Root layout: ocultar `SiteHeader` en todos los pathnames con shell (no solo `/panel`).
- [ ] `/completar-perfil` y rutas `(auth)` sin AppShell de trabajo.
- [ ] `proxy.ts`: sesión requerida en `/inicio` (y `/mi-perfil` si falta).

## 5. Página `/inicio`

- [ ] Ruta server component `/inicio` solo para COLABORADOR / SOLICITANTE.
- [ ] UI de atajos por rol (sin métricas nuevas).
- [ ] Otros roles que entren a `/inicio` redirigen a su `homePorRol`.

## 6. Limpieza

- [ ] Reducir o adaptar `SiteHeader` / `navItemsPorRol` para que no dupliquen el sidebar en
      rutas de trabajo.
- [ ] Actualizar comentarios en `layout.tsx` / `proxy.ts` que asumen «solo admin tiene shell».

## 7. Validación

- [ ] `pnpm test` — `homePorRol` en verde.
- [ ] `pnpm exec eslint src` limpio en archivos tocados.
- [ ] `pnpm build` OK.
- [ ] Smoke manual por rol sembrado: login → home → sidebar → «Volver al sitio» → landing.

## 8. Cierre SDD

- [ ] Marcar criterios de aceptación en `spec.md`.
- [ ] Mover 021 a «Hecho» en `constitution/roadmap.md`.
- [ ] Revisar que `DOC/features/021-home-y-shell-por-rol.md` siga fiel a lo entregado.
- [ ] Actualizar `.agents/feature-queue/queue.json` y regenerar `NEXT_PROMPT.md` si aplica.
