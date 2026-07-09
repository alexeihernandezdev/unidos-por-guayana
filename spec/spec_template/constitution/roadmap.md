# Roadmap

_Orden y estado de las features. Es la vista de "qué hay hecho, qué toca ahora y qué viene". Cada entrada apunta a su carpeta en `features/`. El orden respeta las dependencias: base → catálogo → flujo central → superficies → apoyo._

## Hecho ✅

_Features completadas, en orden de implementación._

1. **000 · Andamiaje inicial** — Proyecto Next.js 16 (App Router) con TypeScript, Tailwind v4 y ESLint (commit inicial).
2. **001 · Configuración base** — Instalados y configurados Prisma + PostgreSQL (Docker en dev, Supabase en prod), Vitest y las librerías elegidas (TanStack Query, Shadcn, React Hook Form, Zustand, Luxon); estructura de módulos de Clean + Screaming (`src/modules`, `src/shared`, `src/lib`, `prisma/`).
3. **002 · Autenticación y roles** — Login y registro con control de acceso por rol (`ADMIN` / `COLABORADOR` / `SOLICITANTE`).
4. **003 · Landing** — Página de bienvenida pública en `/` (estática y con SEO): hero, cómo funciona, principios y CTA final; CTAs a `/registro?rol=COLABORADOR` y `/registro?rol=SOLICITANTE`. Componentes en `src/modules/landing/ui`.
5. **004 · Catálogo de recursos** — Gestión de `Recurso` (nombre, unidad, categoría) solo para `ADMIN`: alta, edición y archivar/activar en `/panel/recursos`. Módulo `src/modules/recursos` (Clean + Screaming); base sobre la que se miden metas y aportes.
6. **005 · Ayudas / Envío** — El `ADMIN` crea envíos con sus `MetaRecurso` (título, fecha, sector destino, metas por recurso) en `/panel/ayudas`: alta, listado con filtro por estado, detalle, edición de cabecera/metas solo en `RECOLECTANDO` y avance de estado por la secuencia `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`. Módulo `src/modules/ayudas` (Clean + Screaming) con la máquina de estados como dominio puro.
7. **007 · Solicitudes de ayuda** — El `SOLICITANTE` crea y gestiona peticiones por sector, urgencia y recursos necesarios en `/solicitudes`; el `ADMIN` las lista con filtros y marca atendida o cierra en `/panel/solicitudes`. Módulo `src/modules/solicitudes` (Clean + Screaming) con máquina de estados pura.

## Siguiente 🔜

_Lo próximo a abordar. Idealmente una sola feature "en curso" a la vez._

8. **006 · Aportes** — El `COLABORADOR` aporta a una Ayuda contra un recurso; el aporte suma a la meta cuando se marca `RECIBIDO`.

## Backlog / ideas 💡

_Ordenado según dependencias. Cada uno se convierte en `features/NNN-…/` antes de tocar código._

**Base y flujo central**

9. **008 · Panel de administración** — Tablero del `ADMIN`: estado de envíos, progreso de metas, solicitudes abiertas y decisión de qué sale primero.
10. **009 · Tablero público de transparencia** — Vista abierta (sin login) con lo recolectado, progreso por envío y destino de cada ayuda.
11. **010 · Seguimiento del envío** — Historial de trazabilidad (`SeguimientoEvento`): transiciones de estado y evidencia de entrega.

**Módulos de apoyo**

12. **011 · Puntos de acopio** — Centros físicos de entrega (dirección, horarios, qué reciben).
13. **012 · Notificaciones** — Avisos a colaboradores sobre envíos que necesitan recursos o metas cumplidas.
14. **013 · Verificación de usuarios** — Validación de colaboradores y solicitantes (`estadoVerificacion`) para dar confianza.
15. **014 · Donaciones monetarias externas** — Mostrar medios externos para donar dinero (cuenta bancaria, PayPal, Zelle…) y permitir al `ADMIN` registrar manualmente montos recibidos por fuera (recursos `MONETARIO`) para reflejarlos en la transparencia. La app no procesa el pago.

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
