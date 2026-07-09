# 003 · Landing — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

Es una feature de **presentación pura**: no hay dominio, aplicación ni infraestructura nueva. El
trabajo es **componer contenido y enlaces** en la raíz `/`, con componentes reutilizables en
`src/modules/landing/ui` y `page.tsx` como orquestador fino. Orden:
**contenido y estructura de secciones → componentes de UI → composición en `page.tsx` →
comportamiento según sesión → metadatos → responsive/tema → validación**.

> ⚠️ Antes de tocar la raíz `/`, la composición server/client o la API de metadata de Next 16, leer
> la guía en `node_modules/next/dist/docs/` (AGENTS.md). Esta versión trae cambios importantes.

## 1. Estructura del módulo

- Crear `src/modules/landing/ui/` con las secciones como componentes (PascalCase `*.tsx`):
  - `HeroSection` — título, propósito en una frase y CTAs principales.
  - `ComoFuncionaSection` — los tres roles y qué aporta cada uno (colaborar / solicitar / gestionar).
  - `PrincipiosSection` — transparencia y trazabilidad (enganche al futuro tablero público).
  - `CtaFinalSection` — cierre que reitera las llamadas a la acción.
  - `SiteHeader` / `SiteFooter` — encabezado con navegación mínima y pie con nombre + nota de alcance.
- La landing **no** necesita `domain` / `application` / `infrastructure`; solo `ui`.
- Barril `index.ts` si conviene para exportar las secciones.

## 2. Contenido

- Redactar los textos en **español**, claros y breves, derivados de `mission.md`
  (qué es, para quién, principios, qué NO es en el pie). Evitar jerga técnica.
- Definir el **propósito en una frase** para el hero (alineado con el "En una frase" del
  `DOC/resumen-general.md`).
- Mapear cada rol a su CTA: `COLABORADOR` → "Quiero colaborar", `SOLICITANTE` → "Necesito ayuda".

## 3. Componentes de UI

- Componer con primitivos de **Shadcn** desde `src/shared/ui` (`Button`, y los que hagan falta;
  añadirlos con la CLI de Shadcn a `src/shared` si faltan).
- Las CTAs son **enlaces** (`next/link`) a `/registro` (con el rol sugerido) y `/login`.
- Mantener los componentes **presentacionales** y sin lógica de negocio.

## 4. Composición en `page.tsx`

- Reescribir `src/app/page.tsx` (elimina el placeholder de Next) como **server component** que
  compone las secciones de `src/modules/landing/ui`.
- Mantenerlo fino: sin lógica; solo orden de secciones y layout general.
- Asegurar que la ruta es **pública** (el middleware de la feature 002 no debe cubrir `/`).

## 5. Comportamiento según sesión (en cliente, para no romper el estático)

- **No** leer la sesión en el server component de la landing: `auth()`/`cookies()` volverían la ruta
  dinámica. La página se mantiene estática.
- La personalización va en un **componente cliente** pequeño (p. ej. `AccesoUsuario` en
  `landing/ui`) que decide entre "Iniciar sesión / Registro" y "Mi cuenta":
  - Con Auth.js v5, usar `useSession()` de `next-auth/react` (requiere `SessionProvider`; montarlo
    solo alrededor de esa parte o en el header, no forzar dinámica la página), **o** una llamada
    ligera del cliente a `/api/auth/session`.
  - Estado por defecto (sin sesión / mientras carga): mostrar registro/login. Al hidratar, si hay
    sesión, cambiar a "Mi cuenta". Así el HTML prerenderizado no depende de la sesión.
- Fallback elegante si la feature 002 no estuviera: mostrar siempre registro/login.

## 6. SEO y metadatos

- **Metadata** (`export const metadata`) en `page.tsx` (y `layout.tsx` para lo global): `title`,
  `description`, `metadataBase` (desde `NEXT_PUBLIC_SITE_URL`), `alternates.canonical`.
- **Open Graph** y **Twitter Card** en `metadata.openGraph` / `metadata.twitter` (título, descripción,
  imagen). Imagen social vía `opengraph-image` (archivo en `app/` o asset en `public/`).
- **`app/robots.ts`** (permitir indexado, `sitemap`) y **`app/sitemap.ts`** (incluye `/`), usando las
  file conventions de metadata de Next 16.
- **JSON-LD** (`Organization`/`NonprofitOrganization`: `name`, `url`, `logo`) embebido con un
  `<script type="application/ld+json">` en un componente server (no usar `next/head`).
- **HTML semántico**: un solo `<h1>` en el hero, jerarquía correcta de encabezados, landmarks
  (`<header>`/`<main>`/`<footer>`), `alt` en imágenes y texto de enlace descriptivo.
- **Idioma**: cambiar `layout.tsx` a `lang="es"` (hoy `en`).

## 7. Estilo, responsive y tema

- **Tailwind v4** con los tokens de `globals.css` (`--background`, `--foreground`); no reintroducir
  `tailwind.config`.
- Diseño **móvil primero**, con layout que escale a escritorio (flex/grid).
- Respetar **modo claro/oscuro** (`prefers-color-scheme`) sin hardcodear colores fuera de los tokens.
- Optimizar activos (imágenes en `public/`, `next/image` si aplica) para conexión limitada.

## Decisiones

- **Presentación pura, sin dominio:** la landing no toca la base ni añade casos de uso; cualquier
  dato en vivo llega con el tablero público (009). Esto la mantiene simple y desplegable ya.
- **Estático por defecto (SSG):** el contenido es fijo; la página es un server component **sin** APIs
  de request, por lo que Next la **prerenderiza** (`○` en el build) y se sirve desde CDN. Solo las
  piezas interactivas (personalización según sesión) son `"use client"` e hidratan aparte. Es la
  decisión clave de la feature: máxima velocidad, cacheabilidad y SEO.
- **Componentes en el módulo, `page.tsx` fino:** respeta Screaming Architecture (la carpeta grita
  "landing") y evita meter maquetación pesada en `src/app`.
- **Enganche al tablero, no el tablero:** se deja el enlace/mención a transparencia sin implementarla,
  evitando enlaces rotos.

## Validación final

1. `pnpm dev` — `/` muestra la landing **sin** pedir login.
2. Comprobar las CTAs: "Quiero colaborar" → registro (`COLABORADOR`), "Necesito ayuda" → registro
   (`SOLICITANTE`), "Iniciar sesión" → `/login`.
3. Con sesión activa, la landing ofrece acceso al área del usuario en lugar de registro/login.
4. Verificar **responsive** (móvil/escritorio) y **modo claro/oscuro**.
5. Revisar el `<head>`: metadatos, canonical, **Open Graph**/**Twitter** y el `<script>` **JSON-LD**;
   comprobar `/robots.txt` y `/sitemap.xml`, y que el documento sea `lang="es"`.
6. `pnpm build`: confirmar que `/` figura como **`○` (Static)**, no `ƒ` (Dynamic).
7. `pnpm lint` / `pnpm build` sin errores.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `003 · Landing` a **Hecho ✅** y promover la siguiente
  feature (`004 · Catálogo de recursos`) a **Siguiente 🔜**.
- Verificar que `DOC/features/003-landing.md` refleja lo entregado.
