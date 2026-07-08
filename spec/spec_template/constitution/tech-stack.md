# Tech stack y convenciones

El proyecto usa una arquitectura: **Clean Architecture + Screaming Architecture**. La estructura de carpetas "grita" el dominio (ayudas, aportes, usuarios), no el framework, y dentro de cada dominio se separan las capas (dominio → aplicación → infraestructura → presentación).

## Tecnologías

Instaladas hoy (ver `package.json`):

- **Lenguaje:** TypeScript estricto (`strict: true`).
- **Framework:** Next.js 16 (App Router, carpeta `src/app/`) con React 19 y React Compiler activado (`reactCompiler: true` en `next.config.ts`).
- **Estilos:** Tailwind CSS v4 (`@import "tailwindcss"` en `globals.css`).
- **Lint:** ESLint 9 (flat config) con `eslint-config-next` (core-web-vitals + typescript).

Elegidas pero **aún pendientes de instalar/configurar**:

- **Librerias:** TanStack Query / Shadcn / React Hook Form / Luxon / Zustand
- **Base de datos:** PostgreSQL con Prisma.
- **Tests:** Vitest.
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

Estructura objetivo (a crear conforme avancen las features):

- `src/modules/<dominio>/` — una carpeta por dominio (`ayudas`, `aportes`, `usuarios`, `solicitudes`, `recursos`, `acopio`, `notificaciones`). Screaming Architecture.
  - `domain/` — entidades, reglas de negocio e interfaces de repositorio (sin dependencias del framework).
  - `application/` — casos de uso que orquestan el dominio.
  - `infrastructure/` — implementaciones concretas (repositorios Prisma, servicios externos).
  - `ui/` — componentes de React propios de la feature.
- `src/shared/` — código transversal reutilizable (componentes UI comunes, utilidades, tipos).
- `src/lib/` — infraestructura global (cliente de Prisma, configuración de DB, auth).
- `prisma/` — `schema.prisma` y migraciones (cuando se instale Prisma).

> Alias de imports: `@/*` → `./src/*` (definido en `tsconfig.json`).

## Comandos

- `npm run dev` — arranca el entorno local (`next dev`).
- `npm run build` — compila para producción (`next build`).
- `npm run start` — sirve la build de producción (`next start`).
- `npm run lint` — revisa el estilo (`eslint`).
- _Test: pendiente — se añadirá `npm run test` (Vitest) al configurarlo._

## Modelo de datos / dominio

_Entidades centrales derivadas de la misión. Se documentan aquí las reglas no obvias; los campos definitivos vivirán en `prisma/schema.prisma`._

### Entidades principales

- **Usuario** — `rol` ∈ `ADMIN` | `COLABORADOR` | `SOLICITANTE`. El rol controla los permisos: solo `ADMIN` puede crear/gestionar Ayudas. `estadoVerificacion` ∈ `PENDIENTE` | `VERIFICADO` | `RECHAZADO` (módulo de verificación de usuarios).
- **Ayuda / Envío** — entidad central. Tiene `fecha` (de salida), `sectorDestino` y un `estado` ∈ `RECOLECTANDO` | `LISTO` | `EN_TRANSITO` | `ENTREGADO`. Sus **metas de recursos** se definen mediante `MetaRecurso`. Solo la crea el `ADMIN`; el paso a `LISTO` lo decide el `ADMIN` (normalmente cuando las metas se cumplen).
- **Aporte** — lo registra un `COLABORADOR` y se asocia a una Ayuda y a un `Recurso`. Tiene `cantidad` (en la unidad del recurso) y un `estado` ∈ `COMPROMETIDO` | `RECIBIDO`. Solo suma a la meta cuando está `RECIBIDO`. Opcionalmente referencia el `PuntoAcopio` de entrega. No maneja dinero.
- **Solicitud / Petición** — la crea un `SOLICITANTE`: pide ayuda para un `sector`, con `urgencia` y los recursos que necesita. Tiene `estado` (p. ej. `ABIERTA` | `ATENDIDA` | `CERRADA`). Alimenta la decisión del `ADMIN` sobre qué enviar.

### Catálogo y metas

- **Recurso** (catálogo) — referencia estable de qué se puede aportar: `nombre` (agua, medicinas, alimentos, camión, voluntario…), `unidad` (litros, cajas, unidades, vehículos, personas) y `categoria` ∈ `SUMINISTRO` | `TRANSPORTE` | `PERSONAL`. Aportes y metas se miden siempre contra un `Recurso`.
- **MetaRecurso** — puente entre `Ayuda` y `Recurso`: `cantidadObjetivo` que el envío necesita de ese recurso. El progreso de una meta = suma de aportes `RECIBIDO` de ese recurso ÷ `cantidadObjetivo`. Una Ayuda tiene varias `MetaRecurso`.

### Logística y seguimiento

- **PuntoAcopio** — centro físico de entrega: `nombre`, `direccion`, `horarios` y qué recursos recibe.
- **SeguimientoEvento** — historial de trazabilidad de una `Ayuda`: cada cambio de `estado` con `fecha`, `nota` y `evidencia` opcional (foto/URL). Da la traza de origen a destino.
- **Notificacion** — dirigida a un `Usuario`: `tipo`, `mensaje`, `referencia` (p. ej. la Ayuda relacionada) y `leida`.

> **Invariantes clave:** las cantidades de `Aporte`, `MetaRecurso` y `Recurso` comparten la `unidad` del recurso; un `Aporte` solo cuenta para el progreso cuando su `estado` es `RECIBIDO`; el ciclo de vida de una `Ayuda` avanza en un solo sentido (`RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`) y cada transición registra un `SeguimientoEvento`.

## Convenciones

- **Idioma del contenido:** español (UI, textos y dominio). Código en inglés donde sea idiomático.
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

> El casing de archivos y carpetas lo **hace cumplir ESLint** con `eslint-plugin-check-file`: componentes `*.tsx` en PascalCase, hooks `use*.ts` en camelCase y carpetas de módulo en kebab-case. Convención: los barriles se llaman `index.ts`. El casing de `*.module.css` no se valida automáticamente (ESLint 9 no parsea CSS sin `@eslint/css`); mantenerlo en kebab-case a mano.

## Estilo visual

- **Sistema de color / tokens:** Tailwind v4 con tokens en `globals.css` (`--background`, `--foreground`, expuestos vía `@theme inline`). Soporte de modo claro/oscuro con `prefers-color-scheme`.
- **Tipografías:** Geist Sans y Geist Mono (`--font-geist-sans` / `--font-geist-mono`).
- **Layout:** responsive con utilidades de Tailwind; diseño usable en móvil y con conexión limitada (ver principio de "Simplicidad de uso" en `mission.md`).

## Límites duros

- No añadir dependencias sin avisar.
- Seguir siempre la arquitectura propuesta (Clean + Screaming); no meter lógica de negocio en `src/app/` ni en componentes de UI.
- No subir archivos `.env*` al repo. El único que se puede subir es `.env.example`.
- No procesar pagos ni donaciones monetarias (ver `mission.md` → "Qué NO es").
- Antes de tocar APIs de Next.js, leer la guía en `node_modules/next/dist/docs/`.
