# 010 · Seguimiento del envío — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. El seguimiento vive **dentro del módulo `ayudas`**.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, `revalidatePath`)
      y repasar el módulo 005 (`avanzarEstado`, `maquinaEstados`, `PrismaAyudaRepository`).
- [ ] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [ ] Añadir `model SeguimientoEvento` a `prisma/schema.prisma` (con `estadoAnterior?`, `estadoNuevo`,
      `nota?`, `evidenciaUrl?`, `ocurridoEn`, `registradoPor?`, `@@index([ayudaId])`,
      `@@map("seguimiento_eventos")`).
- [ ] Añadir la relación inversa `seguimiento SeguimientoEvento[]` en `model Ayuda`.
- [ ] `pnpm db:migrate` y verificar que la migración crea la tabla y el índice sin errores.

## 2. Dominio (`ayudas/domain`)

- [ ] Entidad `SeguimientoEvento` (pura).
- [ ] Ampliar el contrato `AyudaRepository`: `avanzarConSeguimiento(id, nuevoEstado, evento)`,
      `registrarEvento(evento)` (o vía `crearAyuda`) y `listarSeguimiento(ayudaId)`.
- [ ] Confirmar que `maquinaEstados.ts` **no** cambia (sigue siendo la fuente de verdad de las
      transiciones válidas).

## 3. Infraestructura (`ayudas/infrastructure`)

- [ ] `PrismaAyudaRepository.avanzarConSeguimiento`: `prisma.$transaction` (cambia estado + inserta
      evento) atómico.
- [ ] `PrismaAyudaRepository.listarSeguimiento`: `findMany` por `ayudaId`, `orderBy ocurridoEn asc`,
      mapeo a la entidad de dominio.
- [ ] Mapear `estadoAnterior`/`estadoNuevo` sin casts.

## 4. Aplicación (`ayudas/application`)

- [ ] Ampliar `avanzarEstado(deps, id, detalle?)` con `detalle?` (`{ nota?, evidenciaUrl?,
      registradoPor? }`); construye el `SeguimientoEvento` y llama a `avanzarConSeguimiento`.
      Mantener puro.
- [ ] Evento de creación en `crearAyuda` (005): `estadoAnterior = null`, `estadoNuevo = RECOLECTANDO`
      (mismo `$transaction` de creación si es viable).
- [ ] `listarSeguimiento(deps, ayudaId)` (admin).
- [ ] `listarSeguimientoPublico(deps, ayudaId)` — omite `registradoPor` (única puerta pública; la
      consume 009).
- [ ] Actualizar los tests existentes de `avanzarEstado` a la nueva firma retrocompatible.

## 5. Presentación

### Admin (`/(admin)/panel/ayudas/[id]`, de 005)
- [ ] Bloque `LineaTiempoSeguimiento` con los eventos (fecha Luxon, nota, evidencia como enlace,
      `registradoPor`).
- [ ] Ampliar la server action de **avanzar estado** para aceptar `nota` y `evidenciaUrl` opcionales;
      validar con `zod` (URL `https` si viene), `requireRol(ADMIN)`, `revalidatePath`.
- [ ] Al pasar a `ENTREGADO`, la UI **solicita** nota y evidencia (sin bloquear si faltan).

### Público (`/transparencia/[id]`, de 009)
- [ ] Bloque de línea de tiempo pública que consume `listarSeguimientoPublico` (sin `registradoPor`).
- [ ] Si 009 aún no está, dejar el caso de uso listo y documentar el punto de integración.

### Componentes
- [ ] `LineaTiempoSeguimiento`, `EventoSeguimiento` en `ayudas/ui`.
- [ ] Respetar estilo visual: sin em-dash en texto visible, `prefers-reduced-motion`, móvil primero.

## 6. Composición (wiring)

- [ ] La fachada de `ayudas` expone las operaciones ampliadas; `app`/`ui` no importan
      `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- [ ] `avanzarEstado` crea el evento con `estadoAnterior`/`estadoNuevo` correctos y respeta la máquina
      de estados (inválida → error, sin evento).
- [ ] Atomicidad: si el repo falla al insertar el evento, el estado no cambia (fake que lanza).
- [ ] `listarSeguimiento` ordena cronológicamente asc.
- [ ] `listarSeguimientoPublico` **no** incluye `registradoPor` (aserción explícita).
- [ ] Todos en verde.

## 8. Validación final

- [ ] `docker compose up -d`; crear una Ayuda y avanzarla por toda la secuencia adjuntando
      nota/evidencia en algún paso, incluido `ENTREGADO`.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, abrir el detalle de la Ayuda y verificar la línea de tiempo completa;
      comprobar que una transición inválida no registra evento. Si 009 está, verificar la línea de
      tiempo pública sin datos personales.

## 9. Cierre

- [ ] Revisar que `ayudas/domain` y `ayudas/application` siguen puros (sin framework/Prisma) y que
      `registradoPor` no se filtra a ninguna superficie pública.
- [ ] Generar/actualizar `DOC/features/010-seguimiento-del-envio.md` para reflejar lo entregado.
- [ ] Mover `010 · Seguimiento del envío` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `011 · Puntos de acopio` a **Siguiente 🔜**.
