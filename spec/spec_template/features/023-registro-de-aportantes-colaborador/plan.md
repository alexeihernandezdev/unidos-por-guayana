# 023 · Registro de aportantes visible al colaborador — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, pureza de
> capas, convenciones y límites duros). Es una **enmienda aditiva** a `src/modules/aportes` (006): sin
> modelo ni migración nuevos, solo se **expone** una lectura en una superficie nueva.

## Enfoque general

De **adentro hacia afuera**, pero muy acotado: **aplicación (lectura de reconocimiento) → repositorio
(`select` sin datos de contacto) → presentación (sección en el detalle de la actividad, con gating por
sesión) → validación**. No hay dominio nuevo ni cambios de datos.

> ⚠️ El detalle `/ayudas/[id]` ya existe (006). Antes de tocar el server component leer la guía de Next 16
> en `node_modules/next/dist/docs/` (AGENTS.md). La sesión se obtiene con el helper de 002.

## 1. Datos

- **Sin cambios en `schema.prisma` ni migración.** El `Aporte` ya tiene `colaboradorId` (→ `Usuario`),
  `recursoId` (→ `Recurso`), `cantidad`, `estado` y `createdAt`.

## 2. Aplicación (`src/modules/aportes/application`) — pura

- Definir el DTO de lectura para el registro de reconocimiento: `{ id, aportanteNombre, recursoNombre,
  recursoUnidad, cantidad, estado, fecha }` (sin datos de contacto).
- Reutilizar `listarAportesPorAyuda` o añadir una variante `listarAportantesDeAyuda` que devuelva ese DTO.
  Mantener la capa **pura** (depende solo del contrato del repositorio).

## 3. Infraestructura (`src/modules/aportes/infrastructure`)

- `PrismaAporteRepository`: consulta por `ayudaId` con `select` **explícito**:
  - `colaborador: { select: { nombre: true } }` (nunca `cedula`/`telefono`/`correo`/ubicación).
  - `recurso: { select: { nombre: true, unidad: true } }`, `cantidad`, `estado`, `createdAt`.
  - `orderBy: { createdAt: "desc" }`.
- Convertir `Decimal` → `number` en el límite; mapear al DTO.

## 4. Presentación (`src/app/ayudas/[id]` + `src/modules/aportes/ui`)

- En el server component del detalle:
  - Obtener la sesión. Si hay usuario autenticado, cargar el registro de aportantes y renderizar la
    sección "Quiénes han aportado".
  - Sin sesión: **no** renderizar nombres; mostrar los agregados existentes (progreso/recolectado) o un
    CTA a iniciar sesión.
- Componente `AportantesTabla` (o similar) en `aportes/ui`: lista/tabla con nombre, recurso, cantidad,
  `EstadoAporteBadge` y fecha (`Luxon`, `es-VE`, `DD/MM/AAAA`).
- Estado vacío ("Todavía no hay aportes; sé el primero en colaborar").
- Solo lectura: sin botones de acción.

## 5. Tests (Vitest)

- La lectura por actividad devuelve los aportes con `aportanteNombre` y **sin** campos de contacto
  (aserción explícita de que el DTO no los tiene).
- Orden por fecha desc.
- Estado vacío (lista vacía) manejado.

## Decisiones

- **Reutilización pura:** se aprovecha el modelo y el caso de uso de 006; la novedad es la **exposición**
  con un DTO que no filtra datos de contacto.
- **Privacidad en la lectura, no en la UI:** el `select` explícito es la barrera; la UI no "esconde" datos
  que igual viajarían.
- **Gating por sesión** para nombres; la transparencia pública (009) queda anónima e intacta.
- **Solo lectura:** las acciones sobre aportes siguen en el panel del `ADMIN` (006).

## Validación final

1. `pnpm test` (lectura con `nombre` sin contacto, orden desc, vacío).
2. `pnpm lint` / `pnpm build` sin errores.
3. `pnpm dev`: como `COLABORADOR`, abrir una actividad con aportes de varias personas y ver el registro
   con nombres, recurso, cantidad y estado; comprobar que sin sesión no aparecen nombres y que
   `/transparencia` sigue anónima.

## Al terminar

- `constitution/roadmap.md`: mover `023 · Registro de aportantes visible al colaborador` a **Hecho ✅**
  (enmienda 006).
- Verificar que `DOC/features/023-registro-de-aportantes-colaborador.md` refleja lo entregado y que el DOC
  de 006 sigue fiel (o anotar la nueva vista de reconocimiento).
