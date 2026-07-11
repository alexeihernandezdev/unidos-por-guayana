# 014 · Donaciones monetarias externas — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. **Recordatorio duro:** la app **no procesa pagos**; solo
> muestra medios externos y registra montos ya recibidos.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar los módulos `recursos` (004) y `aportes` (006).
- [x] Levantar la base: `docker compose up -d`. Requiere `Recurso` `MONETARIO` (004) y `Aporte` (006).

## 1. Modelo de datos y migración

- [x] Añadir a `schema.prisma`: enum `TipoMedioDonacion` y modelo `MedioDonacion` (`tipo`, `titular`,
      `moneda`, `datos`, `nota?`, `orden` `@default(0)`, `activo` `@default(true)`, timestamps,
      `@@map("medios_donacion")`).
- [x] Enmendar `model Aporte` (006): `colaboradorId` a **opcional**; añadir `registradoPorId?`,
      `medioDonacionId?` (relación a `MedioDonacion`), `moneda?`, `referencia?`; índice
      `@@index([medioDonacionId])`. Revisar `onDelete` (no arrastrar aportes al tocar un medio).
- [x] Relación inversa `aportes` en `MedioDonacion` y `registradoPor` en `Usuario`.
- [x] `pnpm db:migrate` — migración `add_medios_donacion` aplicada sin errores.

## 2. Dominio `donaciones` (`src/modules/donaciones/domain`)

- [x] Enum `TipoMedioDonacion` (const-object + unión, mismos valores que Prisma).
- [x] `MONEDAS_PERMITIDAS` (const-array + unión) y validación de `moneda`.
- [x] Entidad `MedioDonacion` y tipos `NuevoMedioDonacion` / `CambiosMedioDonacion`.
- [x] Reglas puras: `titular`/`datos` no vacíos, `moneda` válida, `esPublicable(medio)` = `activo`.
- [x] Contrato `MedioDonacionRepository` (`crear`, `buscarPorId`, `listar`, `listarPublicables`,
      `actualizar`, `cambiarActivo`).

## 3. Dominio `aportes` (extensión de 006)

- [x] Permitir `Aporte` sin `colaboradorId` (imputado); añadir `registradoPorId?`, `medioDonacionId?`,
      `moneda?`, `referencia?` a entidad y `NuevoAporte`.
- [x] Validaciones puras: `esAporteMonetario(categoria)`, `montoValido(monto)`,
      `monedaRequeridaSiMonetario`.
- [x] Confirmar que la máquina de estados admite un aporte que **nace en `RECIBIDO`** por el flujo
      externo (sin romper las transiciones existentes).

## 4. Aplicación

### donaciones/application
- [x] `crearMedioDonacion`, `editarMedioDonacion`, `activarMedioDonacion` / `desactivarMedioDonacion`.
- [x] `listarMediosDonacion` (todos, admin) y `listarMediosPublicables` (solo `activo`, por `orden`).
- [x] Errores (`MedioDonacionNoEncontradoError`, `DatosMedioInvalidosError`); capa pura.

### aportes/application (006)
- [x] `registrarAporteExterno`: valida recurso `MONETARIO`, `monto > 0`, `moneda` válida; crea `Aporte`
      en `RECIBIDO` con `registradoPorId`, `medioDonacionId?`, `ayudaId?`, `colaboradorId?`,
      `referencia?`, `recibidoEn = fechaRecepcion`. No pasa por `COMPROMETIDO`.
- [x] Errores (`RecursoNoMonetarioError`, `MontoInvalidoError`); mantener la capa pura.

## 5. Infraestructura

- [x] `PrismaMedioDonacionRepository` (`donaciones/infrastructure`): CRUD + `listarPublicables`
      (filtro `activo`, `orderBy orden asc`).
- [x] Extender `PrismaAporteRepository` (006): `create` con `colaboradorId` nulo, `registradoPorId`,
      `medioDonacionId`, `moneda`, `referencia`; mapear `Decimal → number`. Verificar agregaciones con
      aportes sin colaborador.

## 6. Presentación

### Admin
- [x] Ruta `/(admin)/panel/donaciones`: `MedioDonacionForm` + `MediosDonacionTabla`
      (alta/edición/activar/desactivar/ordenar). Server actions con `requireRol(ADMIN)` y
      `revalidatePath`.
- [x] `RegistroIngresoForm` (recurso `MONETARIO`, `monto`, `moneda`, `MedioDonacion`, `fecha de
      recepción`, `ayudaId?`, `referencia?`) + `registrarAporteExternoAction`.
- [x] `IngresosMonetariosTabla`: listado de aportes `MONETARIO` `RECIBIDO` imputados.

### Público (para 009 / landing)
- [x] `MediosDonacionPublicos` (server component, sin `requireRol`): lista publicable con copy
      explícito de que **el pago es por fuera de la app**. Sin em-dash ni en-dash.
- [x] Confirmar que `proxy.ts` cubre las rutas admin y que la parte pública queda fuera de `requireRol`.

### Componentes
- [x] `MedioDonacionForm`, `MediosDonacionTabla`, `RegistroIngresoForm`, `IngresosMonetariosTabla`,
      `MediosDonacionPublicos`, `TipoMedioBadge` en `donaciones/ui`.

## 7. Composición (wiring)

- [x] Exponer la composición (repos + casos de uso) sin romper los límites de capas (patrón de
      `@/shared/auth` y 006). `registrarAporteExterno` recibe `AporteRepository`/`RecursoRepository`
      (y `AyudaRepository` si hay `ayudaId`). `donaciones` invoca a `aportes` por su caso de uso, no
      por su repositorio.

## 8. Tests (Vitest)

- [x] `MedioDonacion` (dominio): campos requeridos, moneda válida/inválida, `esPublicable`.
- [x] `crearMedioDonacion` y `listarMediosPublicables` (solo activos, ordenados).
- [x] `registrarAporteExterno`: crea en `RECIBIDO`; rechaza recurso no `MONETARIO`, `monto ≤ 0`,
      `moneda` inválida; admite ausencia de colaborador; ata `medioDonacionId`/`ayudaId`.
- [x] Tests colocados junto a cada caso de uso; en verde. Con dobles en memoria.

## 9. Validación final

- [x] `docker compose up -d` y base `healthy`.
- [x] `pnpm db:migrate` aplicada.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: como `ADMIN` crear un `MedioDonacion` y verlo publicable; registrar un ingreso
      `MONETARIO` (con y sin colaborador, con y sin `ayudaId`); comprobar que el atado a una Ayuda suma
      a su meta y que el agregado por moneda refleja el monto. Confirmar que **no** existe flujo de
      cobro.

## 10. Cierre

- [x] Revisar que `donaciones/domain`, `donaciones/application` y la extensión de `aportes/*` siguen
      puras (sin framework/Prisma).
- [x] Confirmar que el tablero público (009) consume `listarMediosPublicables` y el agregado monetario
      **sin** datos personales.
- [x] Generar/actualizar `DOC/features/014-donaciones-monetarias-externas.md` para reflejar lo
      entregado.
- [x] Enmendar la nota de `006 · Aportes` (registro manual del `ADMIN` = implementado en 014) y mover
      `014 · Donaciones monetarias externas` a **Hecho ✅** en `constitution/roadmap.md`.
