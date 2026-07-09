# Unidos por Guayana

Plataforma para coordinar **ayudas, aportes y solicitudes** hacia Guayana. Construida con
Next.js 16 (App Router), React 19, Prisma 7 + PostgreSQL y Auth.js v5, siguiendo una
arquitectura **Clean + Screaming** (el detalle vive en `spec/`).

## Requisitos

- **Node.js** 20+ (recomendado 22).
- **pnpm** 10+ — este proyecto usa pnpm, **no** npm ni yarn (`npm i -g pnpm`).
- **Docker** + Docker Compose (para la base de datos de desarrollo).

## Puesta en marcha desde cero

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear el archivo de entorno a partir de la plantilla
cp .env.example .env        # en Windows/PowerShell: copy .env.example .env

# 3. Ajustar .env (ver "Variables de entorno" más abajo):
#    - AUTH_SECRET  → genera uno con:  openssl rand -base64 32
#    - ADMIN_EMAIL / ADMIN_PASSWORD  → credenciales del admin inicial

# 4. Levantar la base de datos (PostgreSQL en el puerto 5435 del host)
docker compose up -d

# 5. Aplicar las migraciones
pnpm db:migrate

# 6. Sembrar el usuario ADMIN inicial
pnpm db:seed

# 7. Arrancar la app en desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). Puedes **registrarte** como Colaborador o
Solicitante, o **iniciar sesión** con el ADMIN sembrado en el paso 6.

## Variables de entorno

Se configuran en `.env` (nunca se sube al repo; la plantilla es `.env.example`).

| Variable                                   | Para qué sirve                                                        |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `POSTGRES_USER` / `PASSWORD` / `DB`        | Credenciales del contenedor de PostgreSQL (`docker-compose.yml`).    |
| `DATABASE_URL`                             | Cadena de conexión de Prisma (dev: `localhost:5435`).                |
| `AUTH_SECRET`                              | Secreto para firmar los JWT de sesión (`openssl rand -base64 32`).   |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `NOMBRE`| Credenciales del ADMIN inicial que crea `pnpm db:seed`.              |

> El puerto de la base se publica en el **5435** del host (mapea al 5432 del contenedor) para no
> chocar con otro PostgreSQL que use el 5432. Cámbialo en `docker-compose.yml` y `.env` si lo
> necesitas.

## Comandos

| Comando            | Qué hace                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `pnpm dev`         | Arranca el entorno local (`next dev`) en el puerto 3000.           |
| `pnpm build`       | Compila para producción (`next build`).                            |
| `pnpm start`       | Sirve la build de producción (`next start`).                       |
| `pnpm lint`        | Revisa el estilo y los límites de capas (`eslint`).               |
| `pnpm test`        | Ejecuta los tests con Vitest (`pnpm test:watch` para el modo watch).|
| `pnpm db:migrate`  | Aplica migraciones en desarrollo (`prisma migrate dev`).           |
| `pnpm db:generate` | Regenera el cliente de Prisma (`prisma generate`).                 |
| `pnpm db:seed`     | Siembra datos iniciales (ADMIN).                                    |

Base de datos:

```bash
docker compose up -d     # levantar PostgreSQL
docker compose down      # detener (los datos persisten en el volumen pgdata)
```

## Estructura

```
src/
├── app/                 # App Router: rutas, layouts, route handlers (presentación)
├── modules/<dominio>/   # Screaming Architecture — una carpeta por dominio (p. ej. usuarios/)
│   ├── domain/          #   entidades y contratos puros (sin framework)
│   ├── application/     #   casos de uso
│   ├── infrastructure/  #   implementaciones concretas (Prisma, hashing…)
│   └── ui/              #   componentes de React de la feature
├── shared/              # código transversal reutilizable
├── lib/                 # infraestructura global (cliente Prisma, config de Auth.js)
└── proxy.ts             # protección de rutas (en Next 16 el antiguo "middleware")

prisma/                  # schema, migraciones y seed
spec/                    # documentación técnica (constitución + features, SDD)
DOC/                     # documentación de cliente en lenguaje llano
```

Los límites entre capas los **hace cumplir ESLint** (ver `eslint.config.mjs` y
`spec/constitution/tech-stack.md`).

## Documentación

- `spec/constitution/` — misión, tech-stack y roadmap (las reglas estables del proyecto).
- `spec/features/NNN-…/` — spec, plan y tareas de cada feature.
- `DOC/` — resúmenes para el cliente en lenguaje llano.

## Despliegue

App en **Vercel** y base de datos en **Supabase**. Configura las mismas variables de entorno en
el proveedor (con la `DATABASE_URL` de Supabase y un `AUTH_SECRET` propio de producción).
