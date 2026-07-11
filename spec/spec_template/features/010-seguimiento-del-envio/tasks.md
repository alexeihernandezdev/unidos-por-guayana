# 010 · Seguimiento del envío — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. El seguimiento vive **dentro del módulo `ayudas`**.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, `revalidatePath`)
      y repasar el módulo 005 (`avanzarEstado`, `maquinaEstados`, `PrismaAyudaRepository`).
- [x] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [x] Añadir `model SeguimientoEvento` a `prisma/schema.prisma` (con `estadoAnterior?`, `estadoNuevo`,
      `nota?`, `evidenciaUrl?`, `ocurridoEn`, `registradoPor?`, `@@index([ayudaId])`,
      `@@map("seguimiento_eventos")`).
- [x] Añadir la relación inversa `seguimiento SeguimientoEvento[]` en `model Ayuda`.
- [x] `pnpm db:migrate` y verificar que la migración crea la tabla y el índice sin errores.

## 2. Dominio (`ayudas/domain`)

- [x] Entidad `SeguimientoEvento` (pura).
- [x] Ampliar el contrato `AyudaRepository`: `avanzarConSeguimiento(id, nuevoEstado, evento)`,
      `registrarEvento(evento)` (o vía `crearAyuda`) y `listarSeguimiento(ayudaId)`.
- [x] Confirmar que `maquinaEstados.ts` **no** cambia (sigue siendo la fuente de verdad de las
      transiciones válidas).

## 3. Infraestructura (`ayudas/infrastructure`)

- [x] `PrismaAyudaRepository.avanzarConSeguimiento`: `prisma.$transaction` (cambia estado + inserta
      evento) atómico.
- [x] `PrismaAyudaRepository.listarSeguimiento`: `findMany` por `ayudaId`, `orderBy ocurridoEn asc`,
      mapeo a la entidad de dominio.
- [x] Mapear `estadoAnterior`/`estadoNuevo` sin casts.

## 4. Aplicación (`ayudas/application`)

- [x] Ampliar `avanzarEstado(deps, id, detalle?)` con `detalle?` (`{ nota?, evidenciaUrl?,
      registradoPor? }`); construye el `SeguimientoEvento` y llama a `avanzarConSeguimiento`.
      Mantener puro.
- [x] Evento de creación en `crearAyuda` (005): `estadoAnterior = null`, `estadoNuevo = RECOLECTANDO`
      (mismo `$transaction` de creación si es viable).
- [x] `listarSeguimiento(deps, ayudaId)` (admin).
- [x] `listarSeguimientoPublico(deps, ayudaId)` — omite `registradoPor` (única puerta pública; la
      consume 009).
- [x] Actualizar los tests existentes de `avanzarEstado` a la nueva firma retrocompatible.

## 5. Presentación

### Admin (`/(admin)/panel/ayudas/[id]`, de 005)
- [x] Bloque `LineaTiempoSeguimiento` con los eventos (fecha Luxon, nota, evidencia como enlace,
      `registradoPor`).
- [x] Ampliar la server action de **avanzar estado** para aceptar `nota` y `evidenciaUrl` opcionales;
      validar con `zod` (URL `https` si viene), `requireRol(ADMIN)`, `revalidatePath`.
- [x] Al pasar a `ENTREGADO`, la UI **solicita** nota y evidencia (sin bloquear si faltan).

### Público (`/transparencia/[id]`, de 009)
- [x] Bloque de línea de tiempo pública que consume `listarSeguimientoPublico` (sin `registradoPor`).
- [x] Si 009 aún no está, dejar el caso de uso listo y documentar el punto de integración.

### Componentes
- [x] `LineaTiempoSeguimiento`, `EventoSeguimiento` en `ayudas/ui`.
- [x] Respetar estilo visual: sin em-dash en texto visible, `prefers-reduced-motion`, móvil primero.

## 6. Composición (wiring)

- [x] La fachada de `ayudas` expone las operaciones ampliadas; `app`/`ui` no importan
      `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- [x] `avanzarEstado` crea el evento con `estadoAnterior`/`estadoNuevo` correctos y respeta la máquina
      de estados (inválida → error, sin evento).
- [x] Atomicidad: si el repo falla al insertar el evento, el estado no cambia (fake que lanza).
- [x] `listarSeguimiento` ordena cronológicamente asc.
- [x] `listarSeguimientoPublico` **no** incluye `registradoPor` (aserción explícita).
- [x] Todos en verde.

## 8. Validación final

- [x] `docker compose up -d`; crear una Ayuda y avanzarla por toda la secuencia adjuntando
      nota/evidencia en algún paso, incluido `ENTREGADO`.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: como `ADMIN`, abrir el detalle de la Ayuda y verificar la línea de tiempo completa;
      comprobar que una transición inválida no registra evento. Si 009 está, verificar la línea de
      tiempo pública sin datos personales.

## 9. Cierre

- [x] Revisar que `ayudas/domain` y `ayudas/application` siguen puros (sin framework/Prisma) y que
      `registradoPor` no se filtra a ninguna superficie pública.
- [x] Generar/actualizar `DOC/features/010-seguimiento-del-envio.md` para reflejar lo entregado.
- [x] Mover `010 · Seguimiento del envío` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `011 · Puntos de acopio` a **Siguiente 🔜**.
