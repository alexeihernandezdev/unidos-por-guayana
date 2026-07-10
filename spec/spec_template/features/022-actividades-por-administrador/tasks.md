# 022 · Actividades por administrador — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las dependencias
> de `plan.md`. Es una **enmienda aditiva** a `src/modules/ayudas` (005) y a las lecturas del panel (008).

## 0. Preparación

- [ ] Repasar `ayudas`: `domain/Ayuda.ts`, `domain/reglas.ts`, `application/{crearAyuda,listarAyudas,
      obtenerAyuda,editarCabecera,gestionarMetas,avanzarEstado,eliminarAyuda}.ts`,
      `infrastructure/PrismaAyudaRepository.ts` y las lecturas de `modules/panel`.
- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` antes de tocar server actions/components.
- [ ] Confirmar cómo se obtiene el `adminId` de la sesión (helper de 002/015).

## 1. Modelo de datos y migración

- [ ] `schema.prisma`: `adminId` + relación `admin`/`ayudas` e `@@index([adminId])` en `Ayuda`/`Usuario`.
- [ ] Migración `add_admin_a_ayuda`: columna nullable → **backfill** al admin dueño (semilla → primer
      admin → superadmin) → `NOT NULL` + FK + índice. Validar (`prisma validate`).
- [ ] Aplicar con `pnpm db:migrate` cuando haya base disponible.

## 2. Dominio (`src/modules/ayudas/domain`)

- [ ] `adminId: string` en `Ayuda` y `NuevaAyuda`; **no** en `CambiosAyuda`.
- [ ] Helper `esDueño` + error de propiedad; exportar desde `domain/index.ts`.

## 3. Aplicación (`src/modules/ayudas/application`)

- [ ] `crearAyuda`: persistir el `adminId` del creador.
- [ ] `listarAyudas`: filtro `{ estado?; tipo?; adminId? }`, combinables.
- [ ] `obtenerAyuda`/`editarCabecera`/`gestionarMetas`/`avanzarEstado`/`eliminarAyuda`: recibir `adminId`
      del solicitante y **verificar propiedad**; error si no es el dueño.
- [ ] Panel (008): `contarAyudasPorEstado`, `listarPrioridadRecolectando` y agregados de aportes/sectores
      aceptan `adminId` para acotar.
- [ ] Actualizar `fakes.ts`; mantener la capa pura.

## 4. Infraestructura

- [ ] `PrismaAyudaRepository`: mapear `adminId` (lectura/escritura) y aplicar el filtro por `adminId` en
      `listar` y en las agregaciones del panel.

## 5. Presentación (solo `ADMIN`)

- [ ] `/(admin)/panel/ayudas` (listado): pasar `adminId` de sesión a `listarAyudas`.
- [ ] Detalle/editar/metas/avanzar/eliminar: pasar `adminId` de sesión; `notFound()` (404) si no es dueño.
- [ ] `/panel` (008): pasar `adminId` de sesión a las lecturas agregadas.
- [ ] Alta `/(admin)/panel/ayudas/nueva`: la server action toma el `adminId` de la sesión (no del form).
      Mantener `requireRol(ADMIN)` y `revalidatePath`.
- [ ] **No** tocar rutas de colaborador ni `/transparencia`.
- [ ] Sin em-dash (`—`) / en-dash (`–`) en textos visibles.

## 6. Composición (wiring)

- [ ] Sin repos/casos de uso nuevos: solo extender firmas. Respetar los límites de capas.

## 7. Tests (Vitest)

- [ ] `crearAyuda`: la actividad queda con el dueño.
- [ ] `listarAyudas`: filtra por `adminId` (solo y combinado con estado/tipo).
- [ ] Gestión: rechaza sobre actividad ajena, opera sobre la propia.
- [ ] Panel: agregaciones acotadas por `adminId`.
- [ ] Suites de 005/008/018 en verde.

## 8. Validación final

- [ ] Base disponible + `pnpm db:migrate` (`add_admin_a_ayuda`; sin nulos).
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: dos `ADMIN` no ven las actividades del otro; URL de actividad ajena da 404; el
      colaborador y `/transparencia` siguen viendo la red completa.

## 9. Cierre

- [ ] `ayudas/domain` y `ayudas/application` siguen puras.
- [ ] `DOC/features/022-actividades-por-administrador.md` refleja lo entregado.
- [ ] Mover `022` a **Hecho ✅** en `constitution/roadmap.md` (enmienda 005/008); revisar que los DOC de
      005 y 008 siguen fieles.
