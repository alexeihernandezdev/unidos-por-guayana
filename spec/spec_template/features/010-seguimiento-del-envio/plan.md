# 010 · Seguimiento del envío — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros). El seguimiento vive **dentro del módulo `ayudas`**
> por cohesión del agregado (ver "Decisiones tomadas" en la spec).

## Enfoque general

El seguimiento es una **extensión del agregado Ayuda**: cada transición de estado debe dejar un
`SeguimientoEvento` de forma **atómica**. Orden:
**schema + migración → dominio (entidad y contrato) → infraestructura (avance atómico con
`$transaction` y lecturas) → aplicación (ampliar `avanzarEstado`, casos de lectura) → presentación
(línea de tiempo admin + campos de evidencia; caso de uso público para 009) → tests → validación**.

> ⚠️ Antes de tocar server actions / server components / `revalidatePath` de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza 002 (`requireRol(ADMIN)`).

## 1. Modelo de datos y migración

- Añadir a `prisma/schema.prisma`:

  ```prisma
  model SeguimientoEvento {
    id             String       @id @default(cuid())
    ayudaId        String
    ayuda          Ayuda        @relation(fields: [ayudaId], references: [id], onDelete: Cascade)
    estadoAnterior EstadoAyuda?
    estadoNuevo    EstadoAyuda
    nota           String?
    evidenciaUrl   String?
    ocurridoEn     DateTime     @default(now())
    registradoPor  String?      // id del Usuario ADMIN; nunca se expone en público
    createdAt      DateTime     @default(now())

    @@index([ayudaId])
    @@map("seguimiento_eventos")
  }
  ```

- Relación inversa en `Ayuda`: `seguimiento SeguimientoEvento[]`.
- `pnpm db:migrate` para generar la migración. Sin cambios en enums (reutiliza `EstadoAyuda`).

## 2. Dominio (`ayudas/domain`)

- **Entidad `SeguimientoEvento`** (pura): `id`, `ayudaId`, `estadoAnterior | null`, `estadoNuevo`,
  `nota?`, `evidenciaUrl?`, `ocurridoEn: Date`, `registradoPor?`.
- **Máquina de estados sin cambios** (`maquinaEstados.ts`): sigue siendo la fuente de verdad de qué
  transición es válida. El evento solo **describe** la transición ya validada por `siguienteEstado`.
- **Ampliar `AyudaRepository`** con:
  - `avanzarConSeguimiento(id, nuevoEstado, evento)` → cambia estado **e** inserta el evento
    atómicamente; devuelve la `Ayuda` actualizada.
  - `registrarEvento(evento)` (para el evento de creación) — o exponerlo vía `crearAyuda`.
  - `listarSeguimiento(ayudaId)` → `SeguimientoEvento[]` ordenado por `ocurridoEn` asc.
- El dominio **no** conoce Prisma: solo define el contrato y la entidad.

## 3. Infraestructura (`ayudas/infrastructure`)

- En `PrismaAyudaRepository`:
  - `avanzarConSeguimiento`: `prisma.$transaction([update estado, create SeguimientoEvento])`. Si
    cualquiera falla, ninguna se aplica.
  - `listarSeguimiento`: `findMany` por `ayudaId` con `orderBy: { ocurridoEn: "asc" }`; mapear a la
    entidad de dominio (`Date` nativo, sin `Decimal`).
  - Mapear `estadoAnterior`/`estadoNuevo` sin casts (el enum de dominio y el de Prisma comparten
    valores, igual que hoy).

## 4. Aplicación (`ayudas/application`)

- **Ampliar `avanzarEstado(deps, id, detalle?)`**:
  - `detalle?`: `{ nota?: string; evidenciaUrl?: string; registradoPor?: string }`.
  - Igual que hoy: busca la Ayuda, calcula `siguienteEstado`, si no hay siguiente lanza
    `TransicionInvalidaError`.
  - Construye el `SeguimientoEvento` (`estadoAnterior = ayuda.estado`, `estadoNuevo = siguiente`) y
    llama a `ayudas.avanzarConSeguimiento(id, siguiente, evento)` (antes usaba `cambiarEstado`).
  - Permanece **puro** (sin Prisma/Next); la atomicidad la resuelve la infraestructura.
- **Evento de creación**: en `crearAyuda` (005) registrar el evento inicial
  (`estadoAnterior = null`, `estadoNuevo = RECOLECTANDO`), idealmente en la misma transacción de
  creación. Si complica 005, dejarlo como mínimo para una iteración y documentar.
- **Lecturas**:
  - `listarSeguimiento(deps, ayudaId)` → historial completo (admin).
  - `listarSeguimientoPublico(deps, ayudaId)` → mapea el historial **omitiendo `registradoPor`** (la
    única puerta pública; la consume 009).

## 5. Presentación

- **Admin** (`/(admin)/panel/ayudas/[id]`, de 005):
  - Bloque `LineaTiempoSeguimiento` con los eventos (fecha con Luxon, nota, evidencia como enlace,
    `registradoPor`).
  - El control de **avanzar estado** amplía su server action para aceptar `nota` y `evidenciaUrl`
    opcionales; validación con `zod` (URL `https` si viene), `requireRol(ADMIN)`, `revalidatePath`.
  - Al pasar a `ENTREGADO`, la UI **solicita** nota y evidencia (sin bloquear si faltan).
- **Público** (`/transparencia/[id]`, de 009):
  - Bloque de línea de tiempo pública que consume `listarSeguimientoPublico` (sin `registradoPor`).
  - Si 009 aún no está implementado, dejar el caso de uso listo y documentar el punto de integración.
- Componentes en `ayudas/ui`: `LineaTiempoSeguimiento`, `EventoSeguimiento`, ampliación del
  formulario/acción de avance de estado.
- Respetar el estilo visual (`tech-stack.md`): sin em-dash en texto visible, `prefers-reduced-motion`
  en cualquier animación de la línea de tiempo, móvil primero.

## 6. Composición (wiring)

- La fachada de `ayudas` (la que hoy inyecta `PrismaAyudaRepository` en las server actions) expone las
  operaciones ampliadas. `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- Dominio/aplicación con dobles en memoria (fakes de `AyudaRepository`):
  - `avanzarEstado` crea el evento con `estadoAnterior`/`estadoNuevo` correctos y respeta la máquina de
    estados (transición inválida → error, sin evento).
  - **Atomicidad**: si el repo falla al insertar el evento, el estado no cambia (fake que lanza).
  - `listarSeguimiento` devuelve orden cronológico asc.
  - `listarSeguimientoPublico` **no** incluye `registradoPor` (aserción explícita).
- Actualizar los tests existentes de `avanzarEstado` (005) a la nueva firma retrocompatible.

## Decisiones

- **Seguimiento dentro de `ayudas`:** cohesión del agregado y atomicidad transición-evento; evita
  escritura cruzada entre módulos.
- **Atomicidad en infraestructura:** el `$transaction` vive en el repo; dominio/aplicación puros.
- **Evidencia como URL:** sin pipeline de subida en el MVP; el campo queda listo para la iteración de
  almacenamiento.
- **Eventos inmutables:** sin editar/borrar aislado; cascada con la Ayuda.
- **`registradoPor` nunca público:** `listarSeguimientoPublico` es la única puerta pública.

## Validación final

1. `docker compose up -d`; crear una Ayuda y avanzarla por toda la secuencia adjuntando nota/evidencia
   en algún paso, incluido `ENTREGADO`.
2. `pnpm test` (nuevos casos + `avanzarEstado` actualizado en verde, incluida la atomicidad y la
   ausencia de `registradoPor` en la lectura pública).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN`, abrir el detalle de la Ayuda y verificar la línea de tiempo completa;
   comprobar que una transición inválida no registra evento. Si 009 está, verificar la línea de tiempo
   pública sin datos personales.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `010 · Seguimiento del envío` a **Hecho ✅** y promover
  la siguiente feature (`011 · Puntos de acopio`) a **Siguiente 🔜**.
- Generar/actualizar `DOC/features/010-seguimiento-del-envio.md` para reflejar lo entregado.
- Si 009 ya existía, integrar la línea de tiempo pública en `/transparencia/[id]` y revisar que su DOC
  mencione que la traza ya está disponible.
