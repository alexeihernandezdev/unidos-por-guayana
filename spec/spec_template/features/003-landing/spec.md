# 003 · Landing

> Estado: **Hecho ✅** · Depende de (soft): `002 · Autenticación y roles` (rutas `/login`, `/registro`) · Roadmap: `constitution/roadmap.md`

## Qué hace

Entrega la **página de bienvenida pública** de la plataforma: la primera pantalla que ve
cualquiera al entrar (sin necesidad de iniciar sesión). Presenta el proyecto, explica qué busca
y su objetivo, e **invita a actuar** según quién llega:

- **Presenta el proyecto** — qué es "Unidos por Guayana", el problema logístico que resuelve y su
  motivación (la ayuda humanitaria que sale desde la región Guayana).
- **Explica cómo funciona** — en lenguaje llano, los tres roles y qué aporta cada uno
  (colaborar, solicitar ayuda, y el rol de gestión del administrador).
- **Invita a colaborar o solicitar ayuda** — llamadas a la acción claras que llevan a **registro**
  (como `COLABORADOR` o `SOLICITANTE`) y a **iniciar sesión**, apoyándose en la feature 002.
- **Refuerza la confianza** — comunica los principios de transparencia y trazabilidad; deja el
  punto de enganche hacia el futuro **tablero público** (feature 009), sin bloquear si aún no existe.

Es una feature de **presentación** (sin modelo de datos ni lógica de dominio nueva): compone
contenido estático y enlaces hacia flujos ya construidos.

## Por qué

`mission.md` lista la **página de bienvenida (landing)** como el primer módulo de cara al público:
es la puerta de entrada que presenta el proyecto e invita a participar. Sin ella, la app abre
directamente en pantallas de auth o vacías, sin explicar a quién llega qué es la plataforma ni
cómo ayudar. La landing convierte una visita en un registro (colaborador/solicitante) y da la
primera impresión de seriedad y transparencia sobre la que se apoya la captación de ayuda.

## Decisiones tomadas

- **Ruta:** la landing es la raíz `/` (`src/app/page.tsx`), sustituyendo el placeholder actual de
  Next. Es **pública** (accesible sin sesión); el middleware de la feature 002 no debe protegerla.
- **Sin dominio nuevo:** no añade modelos Prisma, casos de uso ni migraciones. El contenido es
  estático y los datos dinámicos (p. ej. totales recolectados) quedan **fuera** hasta que exista
  el tablero público (009).
- **Componentes en `src/modules/landing/ui`:** las secciones (hero, cómo funciona, CTA…) viven como
  componentes de la feature; `page.tsx` los compone y se mantiene fino.
- **CTAs hacia la feature 002:** "Quiero colaborar" y "Necesito ayuda" enlazan a `/registro`
  (indicando el rol sugerido) e "Iniciar sesión" a `/login`. Si un usuario ya tiene sesión, la
  landing puede ofrecer un acceso directo a su área en lugar de registro/login.
- **Renderizado estático primero:** la landing se **prerenderiza como estática** (SSG) y se sirve
  desde CDN. En `pnpm build` la ruta `/` debe salir como estática (`○`), **no** dinámica (`ƒ`). Para
  lograrlo, `page.tsx` **no** llama a `auth()`/`cookies()`/`headers()` ni consulta la base: es
  contenido fijo.
- **Sesión sin romper el estático:** la personalización "según sesión" (mostrar "Mi cuenta" en vez de
  registro/login) se resuelve en un **componente cliente** pequeño que hidrata tras la carga; el HTML
  prerenderizado no cambia. Nunca se lee la sesión en el server component de la landing.
- **SEO de primera clase:** metadatos completos (título, descripción, canonical), **Open Graph** y
  **Twitter Card** con imagen, `robots` y `sitemap`, **datos estructurados JSON-LD** (Organization) y
  HTML semántico. El idioma del documento debe ser `es` (hoy `layout.tsx` tiene `lang="en"`: corregir).

## Alcance

**Incluye**

- Página de bienvenida en la raíz `/` (`src/app/page.tsx`), **pública**, **estática** (SSG) y
  responsive (móvil primero), con soporte de modo claro/oscuro usando los tokens de `globals.css`.
- Secciones de contenido: **hero** (título, propósito en una frase y CTAs), **qué es el proyecto**,
  **cómo funciona / roles**, **principios** (transparencia y trazabilidad) y un **CTA de cierre**.
- Un **encabezado** con navegación mínima (logo/nombre + acceso a `Iniciar sesión`/`Registro`) y un
  **pie de página** con lo esencial (nombre del proyecto, nota de alcance).
- **Llamadas a la acción** que enlazan a los flujos de la feature 002:
  - "Quiero colaborar" → registro con rol sugerido `COLABORADOR`.
  - "Necesito ayuda" → registro con rol sugerido `SOLICITANTE`.
  - "Iniciar sesión" → `/login`.
- Comportamiento **según sesión** resuelto en **cliente** (componente `"use client"` que hidrata):
  si hay sesión activa, mostrar un acceso a su área en lugar de las CTAs de registro/login. La
  página en sí **no** lee la sesión en el servidor, para no perder el renderizado estático.
- Componentes de la feature en `src/modules/landing/ui` (PascalCase), reutilizando primitivos de
  Shadcn (`Button`, etc.) desde `src/shared/ui`.
- **SEO completo** (Next 16 metadata API y file conventions):
  - `metadata` con **título**, **descripción**, `metadataBase` y **canonical**.
  - **Open Graph** y **Twitter Card** (título, descripción e imagen social; `opengraph-image`).
  - `app/robots.ts` (permitir indexado, apuntar al sitemap) y `app/sitemap.ts` (incluye `/`).
  - **Datos estructurados JSON-LD** (`Organization`/`NonprofitOrganization` con nombre, url, logo).
  - **HTML semántico**: un solo `<h1>`, jerarquía de encabezados, landmarks (`header`/`main`/`footer`),
    `alt` descriptivos y texto de enlace significativo.
  - Documento en **`lang="es"`** (corregir `layout.tsx`, hoy `en`).
- **Renderizado estático**: la ruta `/` se prerenderiza en `build` (aparece como `○` en la salida de
  `next build`); sin llamadas a APIs de request (`cookies`/`headers`/`auth`) ni a la base.
- Textos en **español**, en tono claro y accesible (principio de "Simplicidad de uso").

**No incluye**

- **Datos en vivo** (totales recolectados, progreso de envíos, contadores): dependen del tablero
  público (feature 009) y del flujo central (004–007). Aquí no se consultan.
- El **tablero público de transparencia** en sí (feature 009); la landing solo deja el enganche
  hacia él (enlace visible cuando exista, o mención mientras tanto).
- Nuevos **modelos de datos**, casos de uso, migraciones o endpoints.
- Formularios de contacto, newsletter, blog o secciones de contenido gestionable (CMS).
- Internacionalización (i18n) / multi-idioma.
- Los flujos de **registro/login** propiamente dichos: los provee la feature 002; aquí solo se
  enlaza a ellos.

## Criterios de aceptación

- [ ] Al entrar a `/` **sin sesión** se muestra la landing (no redirige a login); la ruta es
      pública.
- [ ] La landing **presenta el proyecto** (qué es, qué busca y su objetivo) y **explica los roles**
      en lenguaje llano, coherente con `mission.md`.
- [ ] Existe una CTA **"Quiero colaborar"** que lleva a registro con rol sugerido `COLABORADOR`.
- [ ] Existe una CTA **"Necesito ayuda"** que lleva a registro con rol sugerido `SOLICITANTE`.
- [ ] Existe un acceso a **"Iniciar sesión"** que lleva a `/login`.
- [ ] Con **sesión activa**, la landing ofrece un acceso directo al área del usuario en lugar de las
      CTAs de registro/login.
- [ ] La página es **responsive** (usable en móvil) y respeta el **modo claro/oscuro** con los
      tokens de Tailwind existentes.
- [ ] La ruta `/` se **prerenderiza como estática**: en la salida de `pnpm build` aparece como `○`
      (Static), **no** como `ƒ` (Dynamic). `page.tsx` no usa `cookies`/`headers`/`auth`.
- [ ] La página define **metadatos** (título, descripción, `metadataBase`, canonical) y etiquetas
      **Open Graph** y **Twitter Card** con imagen social, mediante la API de metadata de Next 16.
- [ ] Existen `app/robots.ts` y `app/sitemap.ts`; el sitemap incluye `/` y robots referencia al sitemap.
- [ ] La página incluye **datos estructurados JSON-LD** (Organization) válidos.
- [ ] HTML **semántico**: un único `<h1>`, landmarks (`header`/`main`/`footer`) y el documento en
      **`lang="es"`**.
- [ ] Con **sesión activa**, la personalización (acceso a "Mi cuenta") ocurre en **cliente** sin
      convertir la ruta en dinámica.
- [ ] Las secciones se componen desde `src/modules/landing/ui`; `src/app/page.tsx` se mantiene fino
      y sin lógica de negocio.
- [ ] `pnpm lint` / `pnpm build` sin errores; no se introduce lógica de dominio en `src/app`
      ni en la UI (se respetan los límites de la constitución).

## Notas y riesgos

- **Next 16:** la raíz `/`, la composición de server/client components y la **API de metadata**
  cambian respecto a versiones previas — leer `node_modules/next/dist/docs/` antes de codificar
  (AGENTS.md). Las CTAs son enlaces (`Link`); mantener la página como **server component** salvo las
  partes interactivas.
- **Estático vs. sesión (importante):** leer la sesión en el servidor (`auth()`/`cookies()`) en la
  landing la volvería **dinámica** y perdería el prerenderizado. Por eso la personalización "según
  sesión" va en un **componente cliente** (hidrata tras la carga); `page.tsx` queda estático. Ojo:
  el `src/app/page.tsx` que dejó la feature 002 sí lee la sesión — esta feature lo **sustituye** por
  la landing estática.
- **`metadataBase` / URL del sitio:** para URLs absolutas de Open Graph, sitemap y canonical hace
  falta la URL pública del sitio (p. ej. `NEXT_PUBLIC_SITE_URL`, documentada en `.env.example`).
- **Imagen social (OG):** usar `opengraph-image` (estático en `public/` o generado). Optimizar peso.
- **`lang` del documento:** `layout.tsx` está en `lang="en"`; cambiar a `es` (afecta a toda la app,
  no solo a la landing) — es correcto para accesibilidad y SEO del contenido en español.
- **Dependencia de la feature 002:** las rutas `/login` y `/registro` y el helper de sesión provienen
  de la 002. Si aún no están, dejar las CTAs enlazando a esas rutas (que existirán) y degradar con
  elegancia el bloque "según sesión".
- **Enganche al tablero público (009):** aún no existe. Mostrar el enlace solo cuando la ruta exista,
  o presentarlo como "próximamente" para no dejar enlaces rotos.
- **Sin dependencias nuevas:** debería construirse con lo ya instalado (Tailwind v4, Shadcn). Si se
  valora una librería de iconos o animación, **avisar** antes (límite duro de la constitución).
- **Assets/imágenes:** cualquier activo (logo, ilustración) va en `public/`; optimizar para conexión
  limitada (principio de "Simplicidad de uso"). Evitar dependencias pesadas.
