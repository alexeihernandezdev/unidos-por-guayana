# Tech stack y convenciones

El proyecto usa una arquitectura: **Clean Architecture + Screaming Architecture**. La estructura de carpetas "grita" el dominio (actividades, aportes, usuarios), no el framework, y dentro de cada dominio se separan las capas (dominio → aplicación → infraestructura → presentación).

## Tecnologías

Instaladas hoy (ver `package.json`):

- **Lenguaje:** TypeScript estricto (`strict: true`).
- **Framework:** Next.js 16 (App Router, carpeta `src/app/`) con React 19 y React Compiler activado (`reactCompiler: true` en `next.config.ts`).
- **Estilos:** Tailwind CSS v4 (`@import "tailwindcss"` en `globals.css`).
- **Lint:** ESLint 9 (flat config) con `eslint-config-next` (core-web-vitals + typescript).
- **Librerías:** TanStack Query (provider en `src/app/providers.tsx`) / Shadcn (componentes en `src/shared/ui`, util `cn` en `src/shared/lib/utils.ts`) / React Hook Form / Luxon / Zustand.
- **Base de datos:** PostgreSQL con Prisma 7 (driver adapter `@prisma/adapter-pg`); cliente singleton en `src/lib/prisma.ts` y esquema en `prisma/schema.prisma` (sin modelos de dominio todavía).
- **Entorno local de BD:** Docker + Docker Compose — un contenedor de PostgreSQL para desarrollo, definido en `docker-compose.yml`. Evita instalar Postgres en la máquina y da un entorno reproducible; en producción la base vive en Supabase.
- **Tests:** Vitest (`vitest.config.ts`, entorno `jsdom`, alias `@/…`; `pnpm test`).
- **Gestor de paquetes:** **pnpm** (lockfile `pnpm-lock.yaml`). Instalar deps con `pnpm add [-D] <pkg>` y correr scripts con `pnpm <script>`. No usar `npm`/`yarn` (generan lockfiles divergentes y el node_modules estricto de pnpm difiere del plano de npm).

Pendiente de configurar más adelante:

- **Despliegue:** Vercel (app) / Supabase (base de datos).

> ⚠️ Esta versión de Next.js tiene cambios importantes respecto a lo habitual. Antes de escribir código, consulta la guía correspondiente en `node_modules/next/dist/docs/` y respeta los avisos de deprecación (ver `AGENTS.md`).

### Convenciones de la arquitectura

| Capa             | Responsabilidad                       | Puede importar de       |
| ---------------- | ------------------------------------- | ----------------------- |
| `domain`         | Entidades y contratos puros           | Nada externo            |
| `application`    | Casos de uso                          | `domain`                |
| `infrastructure` | Implementaciones concretas (DB, HTTP) | `domain`, `application` |
| `presentation`   | UI / Controllers                      | `application`, `domain` |

> Estos límites los **hace cumplir ESLint** (`eslint.config.mjs`): `import/no-restricted-paths` controla la dirección de dependencias entre capas, y `no-restricted-imports` mantiene `domain`/`application` puras (sin framework ni infraestructura) y desalienta las rutas relativas largas en favor del alias `@/…`. Las convenciones de naming se validan con `@typescript-eslint/naming-convention`.

## Archivos / módulos clave

_Mapa de dónde vive cada cosa. Lo que existe hoy es el andamiaje de Next; el resto es la estructura objetivo de Clean + Screaming Architecture._

Existe hoy:

- `src/app/` — App Router: rutas, `layout.tsx` y `page.tsx`. Capa de entrada/presentación.
- `src/app/globals.css` — estilos globales y tokens de Tailwind v4.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs` — configuración del proyecto.
- `public/` — activos estáticos.
- `docker-compose.yml` — contenedor de PostgreSQL para desarrollo local (a crear en la feature de configuración base).

Estructura objetivo (a crear conforme avancen las features):

- `src/modules/<dominio>/` — una carpeta por dominio (`actividades`, `aportes`, `usuarios`, `solicitudes`, `recursos`, `acopio`, `notificaciones`). Screaming Architecture.
  - `domain/` — entidades, reglas de negocio e interfaces de repositorio (sin dependencias del framework).
  - `application/` — casos de uso que orquestan el dominio.
  - `infrastructure/` — implementaciones concretas (repositorios Prisma, servicios externos).
  - `ui/` — componentes de React propios de la feature.
- `src/shared/` — código transversal reutilizable (componentes UI comunes, utilidades, tipos).
- `src/lib/` — infraestructura global (cliente de Prisma, configuración de DB, auth).
- `prisma/` — `schema.prisma` y migraciones (cuando se instale Prisma).

> Alias de imports: `@/*` → `./src/*` (definido en `tsconfig.json`).

## Comandos

- `pnpm dev` — arranca el entorno local (`next dev`).
- `pnpm build` — compila para producción (`next build`).
- `pnpm start` — sirve la build de producción (`next start`).
- `pnpm lint` — revisa el estilo (`eslint`).
- `pnpm test` — ejecuta los tests con Vitest (`pnpm test:watch` para el modo interactivo).
- `pnpm db:generate` — regenera el cliente de Prisma (`prisma generate`).
- `pnpm db:migrate` — aplica migraciones en desarrollo (`prisma migrate dev`).
- `pnpm db:migrate:deploy` — aplica migraciones pendientes en producción (`prisma migrate deploy`).
- `pnpm db:seed` — siembra datos iniciales (el `SUPERADMIN` raíz de confianza; ver feature 002 y 015).
- En Vercel, `pnpm build` corre `scripts/vercel-build.mjs`: generate → migrate deploy → seed → `next build`.
- `docker compose up -d` — levanta el contenedor de PostgreSQL para desarrollo local.
- `docker compose down` — detiene y elimina los contenedores (los datos persisten en el volumen).

## Modelo de datos / dominio

_Entidades centrales derivadas de la misión. Se documentan aquí las reglas no obvias; los campos definitivos vivirán en `prisma/schema.prisma`._

### Entidades principales

- **Usuario** — `rol` ∈ `SUPERADMIN` | `ADMIN` | `COLABORADOR` | `SOLICITANTE`. El rol controla los permisos: solo `ADMIN` puede crear/gestionar Actividades; solo `SUPERADMIN` puede aprobar cuentas `ADMIN`. `estadoVerificacion` ∈ `PENDIENTE` | `VERIFICADO` | `RECHAZADO`:
  - Para `ADMIN` la cuenta se crea por **registro público** en `PENDIENTE` y no puede operar hasta que un `SUPERADMIN` la pasa a `VERIFICADO` (o `RECHAZADO`).
  - Para `COLABORADOR` y `SOLICITANTE` el registro exige `cedula` y `telefono` obligatorios; su verificación la gestiona el `ADMIN` (módulo de verificación de usuarios).
  - El `SUPERADMIN` no se registra por la app: se siembra (`db:seed`) y es la raíz de confianza.
- **PerfilAdmin** — datos ampliados de una cuenta `ADMIN`, que funciona además como **centro de acopio**: `nombreCuenta`, ubicación por catálogo (`estadoId`/`municipioId`, ver **Estado**/**Municipio**), `telefono`, `correo` y `documento` (`tipoDocumento` ∈ `JURIDICO` | `NATURAL` + número). Se completa en el registro público y el `SUPERADMIN` lo revisa al aprobar. Un `ADMIN` puede tener uno o varios `PuntoAcopio` asociados.
- **Estado / Municipio** (catálogo de ubicación, feature 020) — división político-territorial de Venezuela: 24 `Estado` (entidades federales, `codigo` ISO 3166-2:VE) y ~335 `Municipio` (cada uno pertenece a un `Estado`). Se siembran con `db:seed` (idempotente por `codigo`) y son de solo lectura para la app. `Usuario` y `PerfilAdmin` referencian la ubicación por FK (`estadoId`/`municipioId`), en vez de guardar texto libre; el municipio se elige filtrado por el estado. Sustituyen a la antigua "parroquia" (texto libre).
- **Actividad** (antes `Ayuda`, renombrada en la feature 024; tabla `actividades`) — entidad central. Tiene `tipo` ∈ `ENVIO` | `JORNADA` | `EVENTO_SOCIAL` (determina cómo se nombra y presenta, y **qué secuencia de estados** usa; comparte el mismo modelo), `fecha` (inicio), `horaFin` opcional (fin de una jornada/evento), `sectorDestino`, `puntoAcopioId` opcional (un `PuntoAcopio` del mismo `ADMIN` dueño) y un `estado`. El ciclo de vida depende del `tipo`: `ENVIO` usa `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`; `JORNADA`/`EVENTO_SOCIAL` usan `RECOLECTANDO → LISTA → EN_CURSO → REALIZADA`. En base es un único enum `EstadoActividad` con la unión de ambas secuencias; la máquina de estados pura del dominio module qué transiciones valen según el `tipo`. Sus **metas de recursos** se definen mediante `MetaRecurso`. Solo la crea el `ADMIN`; el avance de estado lo decide el `ADMIN`.
- **Aporte** — lo registra un `COLABORADOR` y se asocia a una Actividad (FK `actividadId`) y a un `Recurso`. Tiene `cantidad` (en la unidad del recurso) y un `estado` ∈ `COMPROMETIDO` | `RECIBIDO`. Solo suma a la meta cuando está `RECIBIDO`. Opcionalmente referencia el `PuntoAcopio` de entrega. El pago nunca ocurre dentro de la app: cuando el `Recurso` es de categoría `MONETARIO`, el `Aporte` solo **registra** el monto (en su moneda) y el `ADMIN` lo marca `RECIBIDO` al confirmarlo por un canal externo (transferencia, PayPal, Zelle…).
- **Solicitud / Petición** — la crea un `SOLICITANTE`: pide ayuda para un `sector`, con `urgencia` y los recursos que necesita. Tiene `estado` (p. ej. `ABIERTA` | `ATENDIDA` | `CERRADA`). Alimenta la decisión del `ADMIN` sobre qué enviar.

### Catálogo y metas

- **Recurso** (catálogo) — referencia estable de qué se puede aportar: `nombre` (agua, medicinas, alimentos, camión, voluntario, donación en USD…), `unidad` (litros, cajas, unidades, vehículos, personas, USD/Bs) y `categoria` ∈ `SUMINISTRO` | `TRANSPORTE` | `PERSONAL` | `MONETARIO`. Aportes y metas se miden siempre contra un `Recurso`. Los recursos `MONETARIO` representan ayuda económica que se recibe **por fuera** de la app (la app no procesa el pago; ver `mission.md`). Un `Recurso` tiene `estadoAprobacion` ∈ `APROBADO` | `PROPUESTO` | `RECHAZADO`: el `ADMIN` crea recursos ya `APROBADO`; el `SOLICITANTE` puede **proponer** recursos (`PROPUESTO`, con `propuestoPor`) que el `ADMIN` aprueba o rechaza. Solo los `APROBADO` son seleccionables en metas y aportes.
- **MetaRecurso** — puente entre `Actividad` y `Recurso` (FK `actividadId`): `cantidadObjetivo` que la actividad necesita de ese recurso. El progreso de una meta = suma de aportes `RECIBIDO` de ese recurso ÷ `cantidadObjetivo`. Una Actividad tiene varias `MetaRecurso`.

### Logística y seguimiento

- **PuntoAcopio** — centro físico de entrega: `nombre`, `direccion`, `horarios` y qué recursos recibe. **Pertenece a un `ADMIN`** (`adminId`): un administrador puede gestionar uno o varios puntos. Sus datos de ubicación (`estadoId`/`municipioId`) heredan por defecto los del `PerfilAdmin`.
- **SeguimientoEvento** — historial de trazabilidad de una `Actividad`: cada cambio de `estado` con `fecha`, `nota` y `evidencia` opcional (foto/URL). Da la traza de origen a destino.
- **Notificacion** — dirigida a un `Usuario`: `tipo`, `mensaje`, `referencia` (p. ej. la Actividad relacionada) y `leida`.

> **Invariantes clave:** las cantidades de `Aporte`, `MetaRecurso` y `Recurso` comparten la `unidad` del recurso; un `Aporte` solo cuenta para el progreso cuando su `estado` es `RECIBIDO`; el ciclo de vida de una `Actividad` avanza en un solo sentido, con la secuencia según su `tipo` (`ENVIO`: `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`; `JORNADA`/`EVENTO_SOCIAL`: `RECOLECTANDO → LISTA → EN_CURSO → REALIZADA`) y cada transición registra un `SeguimientoEvento`; una cuenta `ADMIN` en `PENDIENTE` no puede crear ni gestionar nada hasta que un `SUPERADMIN` la pasa a `VERIFICADO`; solo un `Recurso` `APROBADO` puede usarse en metas y aportes.

## Convenciones

- **Idioma del contenido:** español (UI, textos y dominio). Código en inglés donde sea idiomático.
- **Formato de fechas:** español, día/mes/año. Nunca el orden anglosajón `MM/DD/AAAA` ni ISO (`AAAA-MM-DD`) en contenido visible al usuario. Dos formas válidas: numérica `DD/MM/AAAA` (p. ej. `24/06/2026`) para valores y datos tabulares, y larga en prosa (p. ej. `24 de junio de 2026`) cuando el texto corrido lo pida. En la UI, formatear con **Luxon** usando el locale `es-VE` (`DateTime.setLocale("es-VE")`, formato `dd/MM/yyyy`); guardar siempre en UTC en la BD y solo formatear a español al mostrar. Los formatos ISO se reservan para almacenamiento, intercambio de datos y el `value` de inputs nativos (`type="date"`), no como texto visible.
- **Arquitectura:** el dominio no depende de la infraestructura ni del framework; las dependencias apuntan hacia adentro (infraestructura → aplicación → dominio).
- **TypeScript estricto:** sin `any` implícitos; validar entradas en los límites (formularios, handlers, API).
- **Tests:** junto al archivo (`foo.ts` + `foo.test.ts`) una vez configurado Vitest.
- **Imports:** usar el alias `@/…` en lugar de rutas relativas largas.

### Convenciones de naming

| Elemento             | Convención                | Ejemplo                        |
| -------------------- | ------------------------- | ------------------------------ |
| Componentes          | PascalCase                | `UserCard.tsx`                 |
| Hooks                | camelCase + `use`         | `useAuthUser.ts`               |
| Variables            | camelCase                 | `isLoading`                    |
| Constantes globales  | SCREAMING_SNAKE           | `MAX_RETRIES`                  |
| Tipos/Interfaces     | PascalCase + `I` opcional | `UserProfile` / `IUserProfile` |
| Archivos CSS/módulos | kebab-case                | `user-card.module.css`         |
| Rutas API            | kebab-case                | `/api/user-profile`            |

> El casing de archivos y carpetas lo **hace cumplir ESLint** con `eslint-plugin-check-file`: los componentes propios de un módulo (`src/modules/*/ui/*.tsx`) van en PascalCase, los hooks `use*.ts` en camelCase y las carpetas de módulo en kebab-case. **Excepción:** los primitivos de Shadcn viven en `src/shared/ui` y siguen la convención de la librería (kebab-case: `button.tsx`, `dropdown-menu.tsx`), por lo que esa carpeta se valida como kebab-case. Convención: los barriles se llaman `index.ts`. El casing de `*.module.css` no se valida automáticamente (ESLint 9 no parsea CSS sin `@eslint/css`); mantenerlo en kebab-case a mano.

## Estilo visual

> **Layout de página del espacio logeado:** el marco de página (contenedor, encabezados,
> listados y tipografía de página) vive en `constitution/ui-guidelines.md` y se materializa en
> los componentes de `src/shared/ui/panel/`. No reescribir a mano `mx-auto flex … max-w-… p-…
> gap-…` ni encabezados/listados en los `page.tsx`: consumir esos componentes. Esta sección fija
> los tokens (color, tipografía, motion); la guía fija cómo se componen en una página.

### Tokens y fundamentos

- **Sistema de color / tokens:** Tailwind v4 con tokens en `globals.css` expuestos vía `@theme inline`. **Modo claro por defecto**, no se activa dark mode automáticamente por `prefers-color-scheme` del OS: los tokens dark están definidos pero gated bajo `:root[data-theme="dark"]` / `.dark` para un toggle explícito futuro. `<html>` fija `style={{ colorScheme: "light" }}` para que los controles nativos (scrollbars, form widgets) también respeten el modo claro. La paleta está **anclada al lugar** (no es monocromo neutral):
  - **`--primary`** teal/petróleo profundo (`oklch(0.47 0.108 194)` light, `oklch(0.72 0.12 192)` dark), color del agua y de la marca. Es la identidad: se usa como **fondo** en CTAs primarios, insignias, chips y trazos de identidad. El token de marca **`--brand`** comparte el mismo teal (`oklch(0.47 0.108 194)`).
  - **`--primary-ink`** (`oklch(0.38 0.10 194)` light, `oklch(0.85 0.09 192)` dark) es la variante del teal pensada para **texto** que necesita contraste WCAG AA sobre `--background`. Usar en marcadores numéricos, fechas destacadas y otros microtextos con carga de identidad.
  - **`--accent`** teal más profundo (`oklch(0.42 0.06 200)` light, `oklch(0.62 0.09 200)` dark), hacia el petróleo del Orinoco. Es la **capa de soporte**: separadores decorativos (p. ej. los `·` en la fecha del hero) y color de hover para links de navegación. Nota: `--ring` apunta al accent solo en **dark**; en **light** el ring es un gris neutro (`oklch(0.708 0 0)`).
  - **`--background` / `--foreground`** son off-white tintado hacia la hue de marca (200) y near-black frío (hue 260). No son pure white/black.
  - **Disciplina de uso:** el teal es a la vez identidad e interacción; aparece en momentos puntuales (CTAs, insignias, foco, hover), no como sprinkle. Todo lo demás en neutrales fríos.
- **Tipografías:** tres familias como techo, cargadas vía `next/font/google` en `src/app/layout.tsx`:
  - **`EB Garamond`** — serif de display para headings y momentos editoriales (variable `--font-serif`, alias Tailwind `font-serif`). Elegida por gravitas civil y por su encaje con la tradición tipográfica en español; evita clichés de AI slop (Fraunces / Instrument Serif están vetadas).
  - **`Geist Sans`** — cuerpo de texto y UI (variable `--font-geist-sans`, alias `font-sans`).
  - **`Geist Mono`** — solo para labels numéricos, códigos, contadores (variable `--font-geist-mono`, alias `font-mono`). Cuando se muestren números tabulares aplicar clase `numeric-tnum` (`font-feature-settings: 'tnum', 'lnum'`); para números en cuerpo editorial usar `numeric-oldstyle`.
- **Refinamientos disponibles** en `globals.css`:
  - `.focus-ring` — anillo de foco consistente basado en `--ring` con offset y radius derivados.
  - `.underline-sweep` — subrayado que barre desde la izquierda al hover/focus. Gated por `@media (hover: hover) and (pointer: fine)`. Sustituye al crossfade de opacidad en links de navegación.
- **Paleta:** un color de marca teal/petróleo (`--primary` = `--brand`) más un accent teal más profundo (Orinoco) sobre neutrales fríos. Ver la subsección "Sistema de color / tokens" más arriba para el uso disciplinado de cada token. No añadir nuevos colores de acento sin decisión explícita del equipo; el énfasis puntual se resuelve con peso tipográfico y jerarquía, no inventando colores.
- **Paleta semántica de estado** (decisión de equipo · panel admin): además del teal de marca, existe un set semántico **anclado a significado**, no decorativo, para superficies operativas donde el estado debe leerse de un vistazo (dashboard, listados con progreso):
  - **`--success` / `--success-ink`** verde (`oklch(0.58 0.13 155)` light) → completado, meta lograda al 100 %.
  - **`--warning` / `--warning-ink`** ámbar (`oklch(0.75 0.15 75)` light) → en preparación / requiere atención pronto (p. ej. recolectando, aportes por confirmar, urgencia media).
  - **`--primary` (teal)** → listo / disponible para el siguiente paso; **`--accent`** → en marcha / en tránsito.
  - **`--destructive` (rojo)** → urgente (urgencia alta).
  Las variantes `-ink` son las de **texto** (contraste AA verificado ≥ 4.5:1 sobre `--background` y sobre los washes tintados). Reglas de uso: (1) el color **acompaña** a ícono + etiqueta + número, nunca es el único portador del estado (WCAG); (2) no se inventan hues fuera de este set sin nueva decisión de equipo; (3) fuera de superficies operativas de estado, sigue rigiendo la disciplina teal de la marca. El mapa de clases vive en `src/modules/panel/ui/tonos.ts`.
- **Radio:** `--radius: 0.625rem` (10px) es la fuente única. Usar `rounded-md/lg/xl` en función de la escala derivada (`--radius-*` en `@theme inline`). No mezclar radios ad-hoc (`rounded-[24px]`, etc.).
- **Easing:** una sola curva compartida, `--ease-out-emil: cubic-bezier(0.23, 1, 0.32, 1)`, definida en `globals.css`. Cualquier animación de UI la usa; no proliferar variantes.

### Tipografía

- **Escala con ratio ≥ 1.25.** Jerarquía por peso (`font-semibold` / `font-bold` en headings) y por escala, no por color.
- **Body en `text-foreground` o `text-foreground/80`.** `text-muted-foreground` solo para labels pequeños, notas o metadatos, nunca para el cuerpo principal (WCAG AA).
- **Ancho de línea:** `max-w-[65ch]` en párrafos. Headings con `[text-wrap:balance]`, cuerpos con `[text-wrap:pretty]`.
- **Sin ALL-CAPS en cuerpos.** Reservado a etiquetas cortas (≤4 palabras). Los "eyebrows" uppercase-tracked (etiquetas pequeñas sobre cada heading) están **prohibidos como scaffolding**; usar máximo uno por cada 3 secciones, con criterio.
- **Cap tipográfico:** hero máximo `text-6xl` (60px) en desktop; `md:text-5xl`/`md:text-4xl` para headings de sección. No superar `clamp(..., 6rem)` en ningún display.

### Espaciado y layout

- **Escala rítmica en Tailwind:** usar pasos `2, 4, 6, 8, 12, 16, 20, 24, 32, 40`. No inventar valores intermedios (`py-14`, `mt-7`) a ojo.
- **Contenedor principal:** `max-w-6xl mx-auto`. Gutters `px-6 md:px-8`. Prosa dentro de sección: `max-w-3xl` o `max-w-[65ch]`.
- **Ritmo vertical entre secciones:** `py-16` móvil, `py-24` desktop por defecto. Hero cap `pt-24` en desktop (HERO TOP PADDING CAP). Secciones de clímax pueden subir a `py-32`.
- **Móvil primero.** Cada layout multi-columna declara su colapso explícito a una columna en `< md`. `min-h-[100dvh]` en vez de `h-screen`.
- **Sin cards por defecto.** Usar hairlines (`border-t border-border`), stacks con `space-y-*` o divisores. La card se reserva a cuando la elevación comunica jerarquía real.

### Restricciones duras de diseño

- **Prohibido em-dash (`—`) y en-dash (`–`) en todo texto visible al usuario.** Headlines, subheads, botones, metadata, alt, footer. Ni siquiera "con moderación". Usar coma, dos puntos, punto y coma, punto o paréntesis. **Única excepción:** el guion largo `—` como marcador de dato vacío en tablas y campos ("sin dato"), donde funciona como símbolo, no como texto.
- **Prohibido eyebrow uppercase-tracked** ("SOBRE", "PROCESO", "PRINCIPIOS") sobre cada sección. Cliché de AI slop.
- **Prohibida numeración de secciones tipo `01 / 02 / 03`** como scaffolding decorativo. Solo cuando la sección **es** una secuencia real (p. ej. "Tres formas de participar" en la landing) y el orden aporta información.
- **Prohibido `transition: all`.** Especificar propiedades (`transition-transform`, `transition-colors`, etc.). **Excepción heredada:** el primitivo Shadcn `src/shared/ui/button.tsx` conserva el `transition-all` de la librería; no replicar ese patrón en código propio.
- **Prohibido `scale(0)` en animaciones de entrada.** Nada aparece de la nada; empezar en `scale(0.95)` + `opacity: 0`.
- **Prohibido `ease-in` en animaciones de UI.** Siempre `ease-out` (o custom `--ease-out-emil`). **Excepción:** el drift ambiental de fondo (`ambient-drift` en `body::before`) usa `ease-in-out` por ser un movimiento atmosférico lento y en bucle, no una interacción de UI.
- **Prohibido animar `top`/`left`/`width`/`height`.** Solo `transform` y `opacity` para llegar a GPU.
- **Prohibido `<span>` con textos placeholder tipo logos de marcas inventadas o "Jane Doe" avatars.** Si se necesita placeholder de marca, generar un mark real o dejar hueco.
- **Prohibido gradient-text** (`background-clip: text`), side-stripe borders decorativos, glassmorphism como default.

### Motion

- **Frecuencia de uso define si se anima.** Acciones repetidas (nav, teclado) no se animan. Momentos raros (entrada de hero, feedback puntual) pueden llevar animación sutil.
- **Duración cap:** UI ≤ 300ms. Botón press 100-160ms. Marketing/explanatory puede alargarse.
- **`prefers-reduced-motion` es obligatorio** para cualquier animación con transform. Envolver en `@media (prefers-reduced-motion: no-preference)` o degradar a fade / instantáneo.
- **Hover states gated por dispositivo:** `@media (hover: hover) and (pointer: fine)`.
- **Botones interactivos:** feedback `:active` con `scale(0.97)` y transición explícita.
- **Popovers** (cuando existan) usan `transform-origin` del trigger, no `center`. Modales sí quedan `center`.

### Iconografía e imágenes

- **Iconos:** `lucide-react` es la librería única del proyecto (instalada en la feature 003). Todos los iconos con `strokeWidth={1.5}` para consistencia. Nada de SVG a mano ni de mezclar con otras familias.
- **Imágenes:** `next/image` cuando la fuente sea local o esté configurada en `next.config.ts`. Placeholders remotos (Picsum) llevan `unoptimized` y comentario `TODO` claro con la ruta de reemplazo.
- **Sin ilustraciones "sketchy" hechas a mano** (paths crudos, `feTurbulence`, doodles). Si no hay activo real, dejar hueco marcado con `TODO`. **Excepción:** el grano de papel `.editorial-grain` usa un `feTurbulence` fijo de baja opacidad (≈0.035) como **textura** de fondo, no como ilustración.

### Accesibilidad

- **Contraste WCAG AA** en todo texto (`≥ 4.5:1` cuerpo, `≥ 3:1` display ≥ 18px). Verificar cuando se usen tokens `--muted-foreground` sobre superficies tintadas.
- **Botones con `aria-*` cuando corresponda** y foco visible por defecto (los primitivos Shadcn ya lo traen).
- **Alt en imágenes.** Vacío `alt=""` para decorativas, descriptivo para las que aportan contenido.

## Límites duros

- No añadir dependencias sin avisar.
- Seguir siempre la arquitectura propuesta (Clean + Screaming); no meter lógica de negocio en `src/app/` ni en componentes de UI.
- No subir archivos `.env*` al repo. El único que se puede subir es `.env.example`.
- No procesar pagos dentro de la app: nada de pasarelas ni APIs de cobro, tarjetas o saldos. La ayuda monetaria se canaliza por fuera; la app solo muestra los medios externos y registra montos ya recibidos (ver `mission.md` → "Qué NO es").
- Antes de tocar APIs de Next.js, leer la guía en `node_modules/next/dist/docs/`.
