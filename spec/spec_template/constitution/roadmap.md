# Roadmap

_Orden y estado de las features. Es la vista de "qué hay hecho, qué toca ahora y qué viene". Cada entrada apunta a su carpeta en `features/`. El orden respeta las dependencias: base → catálogo → flujo central → superficies → apoyo._

## Hecho ✅

_Features completadas, en orden de implementación._

1. **000 · Andamiaje inicial** — Proyecto Next.js 16 (App Router) con TypeScript, Tailwind v4 y ESLint (commit inicial).
2. **001 · Configuración base** — Instalados y configurados Prisma + PostgreSQL (Docker en dev, Supabase en prod), Vitest y las librerías elegidas (TanStack Query, Shadcn, React Hook Form, Zustand, Luxon); estructura de módulos de Clean + Screaming (`src/modules`, `src/shared`, `src/lib`, `prisma/`).
3. **003 · Landing** — Página de bienvenida pública en `/` con hero, cómo funciona, principios y CTA final. CTAs enlazan a `/registro?rol=COLABORADOR` y `/registro?rol=SOLICITANTE`. Componentes en `src/modules/landing/ui` (server components); animaciones CSS-native. Paleta ajustada a teal/petróleo (`--primary` = `--brand`), logo actualizado y fondo global con gradiente sutil animado (`ambient-drift`, respeta `prefers-reduced-motion`). `SiteHeader` integra la sesión: sin usuario muestra login/registro; con sesión, nombre + cerrar sesión (y "Panel" si `ADMIN`).

## Siguiente 🔜

_Lo próximo a abordar. Idealmente una sola feature "en curso" a la vez._

- **002 · Autenticación y roles** — Login y registro con control de acceso por rol (`ADMIN` / `COLABORADOR` / `SOLICITANTE`). En paralelo por otro colaborador.

## Backlog / ideas 💡

_Ordenado según dependencias. Cada uno se convierte en `features/NNN-…/` antes de tocar código._

**Base y flujo central**

4. **004 · Catálogo de recursos** — Gestión de `Recurso` (nombre, unidad, categoría); base sobre la que se miden metas y aportes.
5. **005 · Ayudas / Envío** — El `ADMIN` crea envíos con sus `MetaRecurso` (fecha, sector destino, metas por recurso).
6. **006 · Aportes** — El `COLABORADOR` aporta a una Ayuda contra un recurso; el aporte suma a la meta cuando se marca `RECIBIDO`.
7. **007 · Solicitudes de ayuda** — El `SOLICITANTE` crea y lista peticiones por sector, con urgencia y recursos necesarios.

**Superficies de gestión y transparencia**

8. **008 · Panel de administración** — Tablero del `ADMIN`: estado de envíos, progreso de metas, solicitudes abiertas y decisión de qué sale primero.
9. **009 · Tablero público de transparencia** — Vista abierta (sin login) con lo recolectado, progreso por envío y destino de cada ayuda.
10. **010 · Seguimiento del envío** — Historial de trazabilidad (`SeguimientoEvento`): transiciones de estado y evidencia de entrega.

**Módulos de apoyo**

11. **011 · Puntos de acopio** — Centros físicos de entrega (dirección, horarios, qué reciben).
12. **012 · Notificaciones** — Avisos a colaboradores sobre envíos que necesitan recursos o metas cumplidas.
13. **013 · Verificación de usuarios** — Validación de colaboradores y solicitantes (`estadoVerificacion`) para dar confianza.
14. **014 · Donaciones monetarias externas** — Mostrar medios externos para donar dinero (cuenta bancaria, PayPal, Zelle…) y permitir al `ADMIN` registrar manualmente montos recibidos por fuera (recursos `MONETARIO`) para reflejarlos en la transparencia. La app no procesa el pago.

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
