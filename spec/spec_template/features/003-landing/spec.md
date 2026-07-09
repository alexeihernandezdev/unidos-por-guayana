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

## Alcance

**Incluye**

- Página de bienvenida en la raíz `/` (`src/app/page.tsx`), **pública** y responsive
  (móvil primero), con soporte de modo claro/oscuro usando los tokens de `globals.css`.
- Secciones de contenido: **hero** (título, propósito en una frase y CTAs), **qué es el proyecto**,
  **cómo funciona / roles**, **principios** (transparencia y trazabilidad) y un **CTA de cierre**.
- Un **encabezado** con navegación mínima (logo/nombre + acceso a `Iniciar sesión`/`Registro`) y un
  **pie de página** con lo esencial (nombre del proyecto, nota de alcance).
- **Llamadas a la acción** que enlazan a los flujos de la feature 002:
  - "Quiero colaborar" → registro con rol sugerido `COLABORADOR`.
  - "Necesito ayuda" → registro con rol sugerido `SOLICITANTE`.
  - "Iniciar sesión" → `/login`.
- Comportamiento **según sesión**: si hay sesión activa, mostrar un acceso a su área en lugar de
  las CTAs de registro/login (usando el helper de sesión de la feature 002).
- Componentes de la feature en `src/modules/landing/ui` (PascalCase), reutilizando primitivos de
  Shadcn (`Button`, etc.) desde `src/shared/ui`.
- Metadatos básicos de la página (título y descripción para SEO/redes) vía la API de metadata de
  Next 16.
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
- [ ] La página define **metadatos** (título y descripción) mediante la API de metadata de Next 16.
- [ ] Las secciones se componen desde `src/modules/landing/ui`; `src/app/page.tsx` se mantiene fino
      y sin lógica de negocio.
- [ ] `npm run lint` / `npm run build` sin errores; no se introduce lógica de dominio en `src/app`
      ni en la UI (se respetan los límites de la constitución).

## Notas y riesgos

- **Next 16:** la raíz `/`, la composición de server/client components y la **API de metadata**
  cambian respecto a versiones previas — leer `node_modules/next/dist/docs/` antes de codificar
  (AGENTS.md). Las CTAs son enlaces (`Link`); mantener la página como **server component** salvo las
  partes interactivas.
- **Dependencia de la feature 002:** las rutas `/login` y `/registro` y el helper de sesión provienen
  de la 002. Si aún no están, dejar las CTAs enlazando a esas rutas (que existirán) y degradar con
  elegancia el bloque "según sesión".
- **Enganche al tablero público (009):** aún no existe. Mostrar el enlace solo cuando la ruta exista,
  o presentarlo como "próximamente" para no dejar enlaces rotos.
- **Sin dependencias nuevas:** debería construirse con lo ya instalado (Tailwind v4, Shadcn). Si se
  valora una librería de iconos o animación, **avisar** antes (límite duro de la constitución).
- **Assets/imágenes:** cualquier activo (logo, ilustración) va en `public/`; optimizar para conexión
  limitada (principio de "Simplicidad de uso"). Evitar dependencias pesadas.
