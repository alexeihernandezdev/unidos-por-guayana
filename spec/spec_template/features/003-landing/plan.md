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

## 5. Comportamiento según sesión

- Leer el usuario actual con el helper de servidor de la feature 002 (`getUsuarioActual()` o
  equivalente) desde el server component.
- Si hay sesión: mostrar un acceso directo al área del usuario (o a su panel según rol) en lugar de
  las CTAs de registro/login. Si no hay sesión: mostrar registro/login.
- Degradar con elegancia si el helper aún no existe (fallback: mostrar siempre registro/login).

## 6. Metadatos

- Exportar `metadata` (o `generateMetadata`) desde `page.tsx`/`layout.tsx` con **título** y
  **descripción** de la landing (SEO y previsualización en redes), según la API de Next 16.

## 7. Estilo, responsive y tema

- **Tailwind v4** con los tokens de `globals.css` (`--background`, `--foreground`); no reintroducir
  `tailwind.config`.
- Diseño **móvil primero**, con layout que escale a escritorio (flex/grid).
- Respetar **modo claro/oscuro** (`prefers-color-scheme`) sin hardcodear colores fuera de los tokens.
- Optimizar activos (imágenes en `public/`, `next/image` si aplica) para conexión limitada.

## Decisiones

- **Presentación pura, sin dominio:** la landing no toca la base ni añade casos de uso; cualquier
  dato en vivo llega con el tablero público (009). Esto la mantiene simple y desplegable ya.
- **Server component por defecto:** el contenido es estático; solo se interactúa vía enlaces, así que
  no se necesita `"use client"` en la página (mejor rendimiento y menos JS).
- **Componentes en el módulo, `page.tsx` fino:** respeta Screaming Architecture (la carpeta grita
  "landing") y evita meter maquetación pesada en `src/app`.
- **Enganche al tablero, no el tablero:** se deja el enlace/mención a transparencia sin implementarla,
  evitando enlaces rotos.

## Validación final

1. `npm run dev` — `/` muestra la landing **sin** pedir login.
2. Comprobar las CTAs: "Quiero colaborar" → registro (`COLABORADOR`), "Necesito ayuda" → registro
   (`SOLICITANTE`), "Iniciar sesión" → `/login`.
3. Con sesión activa, la landing ofrece acceso al área del usuario en lugar de registro/login.
4. Verificar **responsive** (móvil/escritorio) y **modo claro/oscuro**.
5. Revisar los **metadatos** (título/descripción) en el `<head>`.
6. `npm run lint` / `npm run build` sin errores.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `003 · Landing` a **Hecho ✅** y promover la siguiente
  feature (`004 · Catálogo de recursos`) a **Siguiente 🔜**.
- Verificar que `DOC/features/003-landing.md` refleja lo entregado.
