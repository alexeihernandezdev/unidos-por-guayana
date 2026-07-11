# 022 · Actividades por administrador — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las dependencias
> de `plan.md`. Es una **enmienda aditiva** a `src/modules/ayudas` (005) y a las lecturas del panel (008).

## 0. Preparación

- [x] Repasar `ayudas`: `domain/Ayuda.ts`, `domain/reglas.ts`, `application/{crearAyuda,listarAyudas,
      obtenerAyuda,editarCabecera,gestionarMetas,avanzarEstado,eliminarAyuda}.ts`,
      `infrastructure/PrismaAyudaRepository.ts` y las lecturas de `modules/panel`.
- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` antes de tocar server actions/components.
- [x] Confirmar cómo se obtiene el `adminId` de la sesión (helper de 002/015).

## 1. Modelo de datos y migración

- [x] `schema.prisma`: `adminId` + relación `admin`/`ayudas` e `@@index([adminId])` en `Ayuda`/`Usuario`.
- [x] Migración `add_admin_a_ayuda`: columna nullable → **backfill** al admin dueño (semilla → primer
      admin → superadmin) → `NOT NULL` + FK + índice. Validar (`prisma validate`).
- [ ] Aplicar con `pnpm db:migrate` cuando haya base disponible.

## 2. Dominio (`src/modules/ayudas/domain`)

- [x] `adminId: string` en `Ayuda` y `NuevaAyuda`; **no** en `CambiosAyuda`.
- [x] Helper `esDueño` + error de propiedad; exportar desde `domain/index.ts`.

## 3. Aplicación (`src/modules/ayudas/application`)

- [x] `crearAyuda`: persistir el `adminId` del creador.
- [x] `listarAyudas`: filtro `{ estado?; tipo?; adminId? }`, combinables.
- [x] `obtenerAyuda`/`editarCabecera`/`gestionarMetas`/`avanzarEstado`/`eliminarAyuda`: recibir `adminId`
      del solicitante y **verificar propiedad**; error si no es el dueño.
- [x] Panel (008): `contarAyudasPorEstado`, `listarPrioridadRecolectando` y agregados de aportes/sectores
      aceptan `adminId` para acotar.
- [x] Actualizar `fakes.ts`; mantener la capa pura.

## 4. Infraestructura

- [x] `PrismaAyudaRepository`: mapear `adminId` (lectura/escritura) y aplicar el filtro por `adminId` en
      `listar` y en las agregaciones del panel.

## 5. Presentación (solo `ADMIN`)

- [x] `/(admin)/panel/ayudas` (listado): pasar `adminId` de sesión a `listarAyudas`.
- [x] Detalle/editar/metas/avanzar/eliminar: pasar `adminId` de sesión; `notFound()` (404) si no es dueño.
- [x] `/panel` (008): pasar `adminId` de sesión a las lecturas agregadas.
- [x] Alta `/(admin)/panel/ayudas/nueva`: la server action toma el `adminId` de la sesión (no del form).
      Mantener `requireRol(ADMIN)` y `revalidatePath`.
- [x] **No** tocar rutas de colaborador ni `/transparencia`.
- [x] Sin em-dash (`—`) / en-dash (`–`) en textos visibles.

## 6. Composición (wiring)

- [x] Sin repos/casos de uso nuevos: solo extender firmas. Respetar los límites de capas.

## 7. Tests (Vitest)

- [x] `crearAyuda`: la actividad queda con el dueño.
- [x] `listarAyudas`: filtra por `adminId` (solo y combinado con estado/tipo).
- [x] Gestión: rechaza sobre actividad ajena, opera sobre la propia.
- [x] Panel: agregaciones acotadas por `adminId`.
- [x] Suites de 005/008/018 en verde.

## 8. Validación final

- [ ] Base disponible + `pnpm db:migrate` (`add_admin_a_ayuda`; sin nulos).
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores de esta feature (fallos previos de 020 en UI de perfil).
- [ ] `pnpm dev`: dos `ADMIN` no ven las actividades del otro; URL de actividad ajena da 404; el
      colaborador y `/transparencia` siguen viendo la red completa.

## 9. Cierre

- [x] `ayudas/domain` y `ayudas/application` siguen puras.
- [x] `DOC/features/022-actividades-por-administrador.md` refleja lo entregado.
- [x] Mover `022` a **Hecho ✅** en `constitution/roadmap.md` (enmienda 005/008); revisar que los DOC de
      005 y 008 siguen fieles.
