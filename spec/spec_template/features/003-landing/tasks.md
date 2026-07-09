# 003 · Landing — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (raíz `/`, composición
      server/client components y API de metadata).
- [ ] Confirmar que las rutas `/login` y `/registro` y el helper de sesión de la feature 002 están
      disponibles (o dejar las CTAs enlazando a esas rutas y degradar el bloque "según sesión").

## 1. Estructura del módulo

- [ ] Crear `src/modules/landing/ui/` para las secciones de la landing.
- [ ] (Opcional) Añadir barril `index.ts` para exportar las secciones.

## 2. Contenido

- [ ] Redactar textos en español (qué es, roles, principios) derivados de `mission.md`.
- [ ] Definir el propósito en una frase para el hero (alineado con `DOC/resumen-general.md`).

## 3. Componentes de UI (`src/modules/landing/ui`)

- [ ] `HeroSection` — título, propósito y CTAs principales.
- [ ] `ComoFuncionaSection` — los tres roles y qué aporta cada uno.
- [ ] `PrincipiosSection` — transparencia y trazabilidad (enganche al tablero futuro).
- [ ] `CtaFinalSection` — cierre con las llamadas a la acción.
- [ ] `SiteHeader` / `SiteFooter` — navegación mínima y pie con nombre + nota de alcance.
- [ ] Reutilizar primitivos de Shadcn desde `src/shared/ui` (añadir `Button`, etc. si faltan).

## 4. Composición en `page.tsx`

- [ ] Reescribir `src/app/page.tsx` (quitar el placeholder de Next) como server component que
      compone las secciones; mantenerlo fino y sin lógica de negocio.
- [ ] Verificar que `/` es pública (no cubierta por el middleware de la feature 002).

## 5. Comportamiento según sesión (en cliente)

- [ ] Componente **cliente** (p. ej. `AccesoUsuario`) que decide entre registro/login y "Mi cuenta"
      usando `useSession()` de `next-auth/react` (con `SessionProvider` acotado) o `/api/auth/session`.
- [ ] Estado por defecto (sin sesión / mientras hidrata): mostrar registro/login.
- [ ] **No** leer la sesión en `page.tsx` (`auth()`/`cookies()`) — rompería el estático.
- [ ] Fallback elegante si la feature 002 no estuviera: mostrar siempre registro/login.

## 6. SEO y metadatos

- [ ] `metadata` con `title`, `description`, `metadataBase` (`NEXT_PUBLIC_SITE_URL`) y canonical.
- [ ] **Open Graph** y **Twitter Card** (título, descripción, imagen); imagen vía `opengraph-image`.
- [ ] `app/robots.ts` (indexado + sitemap) y `app/sitemap.ts` (incluye `/`).
- [ ] **JSON-LD** (`Organization`) embebido con `<script type="application/ld+json">`.
- [ ] HTML **semántico**: un único `<h1>`, landmarks (`header`/`main`/`footer`), `alt` y enlaces
      descriptivos.
- [ ] Cambiar `layout.tsx` a **`lang="es"`** (hoy `en`). Documentar `NEXT_PUBLIC_SITE_URL` en `.env.example`.

## 7. Estilo, responsive y tema

- [ ] Diseño móvil primero que escale a escritorio (Tailwind v4, tokens de `globals.css`).
- [ ] Respetar modo claro/oscuro sin hardcodear colores fuera de los tokens.
- [ ] Optimizar activos (imágenes en `public/`, `next/image` si aplica) para conexión limitada.

## 8. Validación final

- [ ] `pnpm dev`: `/` muestra la landing sin pedir login.
- [ ] CTAs correctas: "Quiero colaborar" → registro (`COLABORADOR`), "Necesito ayuda" → registro
      (`SOLICITANTE`), "Iniciar sesión" → `/login`.
- [ ] Con sesión activa, la landing ofrece acceso al área del usuario (en cliente).
- [ ] Responsive (móvil/escritorio) y modo claro/oscuro verificados.
- [ ] `<head>` con metadatos, canonical, Open Graph/Twitter y `<script>` JSON-LD; `/robots.txt` y
      `/sitemap.xml` responden; documento en `lang="es"`.
- [ ] `pnpm build`: la ruta `/` figura como **`○` (Static)**, no `ƒ` (Dynamic).
- [ ] `pnpm lint` / `pnpm build` sin errores.

## 9. Cierre

- [ ] Revisar que no se introdujo lógica de dominio en `src/app` ni en la UI (límites de la
      constitución respetados).
- [ ] Verificar que `DOC/features/003-landing.md` refleja lo entregado.
- [ ] Mover `003 · Landing` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `004 · Catálogo de recursos` a **Siguiente 🔜**.
