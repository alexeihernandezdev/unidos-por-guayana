# 003 · Landing — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.
>
> **Estado: completada ✅** (ver `constitution/roadmap.md`).

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (raíz `/`, composición
      server/client components y API de metadata).
- [x] Confirmar que las rutas `/login` y `/registro` y el helper de sesión de la feature 002 están
      disponibles (o dejar las CTAs enlazando a esas rutas y degradar el bloque "según sesión").

## 1. Estructura del módulo

- [x] Crear `src/modules/landing/ui/` para las secciones de la landing.
- [x] (Opcional) Añadir barril `index.ts` para exportar las secciones.

## 2. Contenido

- [x] Redactar textos en español (qué es, roles, principios) derivados de `mission.md`.
- [x] Definir el propósito en una frase para el hero (alineado con `DOC/resumen-general.md`).

## 3. Componentes de UI (`src/modules/landing/ui`)

- [x] `HeroSection` — título, propósito y CTAs principales.
- [x] `ComoFuncionaSection` — los tres roles y qué aporta cada uno.
- [x] `PrincipiosSection` — transparencia y trazabilidad (enganche al tablero futuro).
- [x] `CtaFinalSection` — cierre con las llamadas a la acción.
- [x] `SiteHeader` / `SiteFooter` — navegación mínima y pie con nombre + nota de alcance.
- [x] Reutilizar primitivos de Shadcn desde `src/shared/ui` (añadir `Button`, etc. si faltan).

## 4. Composición en `page.tsx`

- [x] Reescribir `src/app/page.tsx` (quitar el placeholder de Next) como server component que
      compone las secciones; mantenerlo fino y sin lógica de negocio.
- [x] Verificar que `/` es pública (no cubierta por el middleware de la feature 002).

## 5. Comportamiento según sesión (en cliente)

- [x] Componente **cliente** (p. ej. `AccesoUsuario`) que decide entre registro/login y "Mi cuenta"
      usando `useSession()` de `next-auth/react` (con `SessionProvider` acotado) o `/api/auth/session`.
      _Resuelto integrando la sesión en `SiteHeader` (server component async con `getUsuarioActual`),
      que muestra "Iniciar sesión / Crear cuenta" o el nombre del usuario + "Cerrar sesión" (y "Panel"
      si es ADMIN)._
- [x] Estado por defecto (sin sesión / mientras hidrata): mostrar registro/login.
- [x] **No** leer la sesión en `page.tsx` (`auth()`/`cookies()`) — rompería el estático.
- [x] Fallback elegante si la feature 002 no estuviera: mostrar siempre registro/login.

## 6. SEO y metadatos

- [x] `metadata` con `title`, `description`, `metadataBase` (`NEXT_PUBLIC_SITE_URL`) y canonical.
- [x] **Open Graph** y **Twitter Card** (título, descripción, imagen); imagen vía `opengraph-image`.
- [x] `app/robots.ts` (indexado + sitemap) y `app/sitemap.ts` (incluye `/`).
- [x] **JSON-LD** (`Organization`) embebido con `<script type="application/ld+json">`.
- [x] HTML **semántico**: un único `<h1>`, landmarks (`header`/`main`/`footer`), `alt` y enlaces
      descriptivos.
- [x] Cambiar `layout.tsx` a **`lang="es"`** (hoy `en`). Documentar `NEXT_PUBLIC_SITE_URL` en `.env.example`.

## 7. Estilo, responsive y tema

- [x] Diseño móvil primero que escale a escritorio (Tailwind v4, tokens de `globals.css`).
- [x] Respetar modo claro/oscuro sin hardcodear colores fuera de los tokens.
- [x] Optimizar activos (imágenes en `public/`, `next/image` si aplica) para conexión limitada.
- [x] Paleta ajustada a teal/petróleo (`--primary` = `--brand`) y logo (`public/logo-mark.svg`)
      actualizado a la nueva paleta.
- [x] Fondo global con gradiente teal sutil animado (`body::before` con `ambient-drift`,
      respeta `prefers-reduced-motion`).

## 8. Validación final

- [x] `pnpm dev`: `/` muestra la landing sin pedir login.
- [x] CTAs correctas: "Quiero colaborar" → registro (`COLABORADOR`), "Necesito ayuda" → registro
      (`SOLICITANTE`), "Iniciar sesión" → `/login`.
- [x] Con sesión activa, la landing ofrece acceso al área del usuario (en cliente).
- [x] Responsive (móvil/escritorio) y modo claro/oscuro verificados.
- [x] `<head>` con metadatos, canonical, Open Graph/Twitter y `<script>` JSON-LD; `/robots.txt` y
      `/sitemap.xml` responden; documento en `lang="es"`.
- [x] `pnpm build`: la ruta `/` figura como **`○` (Static)**, no `ƒ` (Dynamic).
- [x] `pnpm lint` / `pnpm build` sin errores.

## 9. Cierre

- [x] Revisar que no se introdujo lógica de dominio en `src/app` ni en la UI (límites de la
      constitución respetados).
- [x] Verificar que `DOC/features/003-landing.md` refleja lo entregado.
- [x] Mover `003 · Landing` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `004 · Catálogo de recursos` a **Siguiente 🔜**.
