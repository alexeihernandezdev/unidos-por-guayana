# 014 · Donaciones monetarias externas — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros). **Recordatorio duro:** la app **no procesa pagos**;
> esta feature solo **muestra** medios externos y **registra** montos ya recibidos.

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), reutilizando el
patrón de `recursos` (004) y `aportes` (006). Dos frentes que convergen:

1. **Catálogo de medios de donación** — entidad nueva `MedioDonacion` en el módulo `donaciones`
   (Clean + Screaming completo). Es catálogo administrable, muy parecido a `recursos` (004).
2. **Registro de montos recibidos** — **no** una entidad nueva: es un caso de uso
   `registrarAporteExterno` que vive en el módulo `aportes` (006) y crea un `Aporte` `MONETARIO` en
   `RECIBIDO`. Requiere una **enmienda mínima** al modelo `Aporte` (colaborador opcional + campos de
   auditoría/medio/moneda/referencia).

Orden: **enmienda a `Aporte` + modelo `MedioDonacion` + migración → dominio `donaciones` → dominio
`aportes` (extensión) → aplicación (donaciones + `registrarAporteExterno`) (+tests) → repositorios
Prisma → UI admin (medios + registro) → componente público de medios (para 009) → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002.

## Justificación del módulo (dónde vive cada cosa)

- **`src/modules/donaciones/`** — dueño de `MedioDonacion` (dominio, aplicación, infraestructura, ui).
  Es un dominio propio: "cómo puede donar la gente". No pertenece a `aportes` porque no es un aporte,
  es configuración de canales externos.
- **`src/modules/aportes/`** (006) — dueño del **registro del monto recibido**, porque un ingreso
  monetario **es un `Aporte`** `MONETARIO` en `RECIBIDO`. El caso de uso `registrarAporteExterno` vive
  aquí para compartir entidad, repositorio y la agregación de progreso de 006. Duplicarlo en
  `donaciones` bifurcaría la verdad del dinero recolectado (dos sumas distintas en 009). Por eso
  `donaciones` **depende** de `aportes` para registrar, no lo reimplementa.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`:
  - `enum TipoMedioDonacion { CUENTA_BANCARIA PAGO_MOVIL PAYPAL ZELLE BINANCE EFECTIVO OTRO }`.
  - `model MedioDonacion { id, tipo TipoMedioDonacion, titular String, moneda String, datos String,
    nota String?, orden Int @default(0), activo Boolean @default(true), createdAt, updatedAt,
    aportes Aporte[], @@map("medios_donacion") }`.
  - **Enmienda a `model Aporte`** (006):
    - `colaboradorId String?` (antes obligatorio) + relación opcional.
    - `registradoPorId String?` + relación a `Usuario` (el `ADMIN` que imputó).
    - `medioDonacionId String?` + relación opcional a `MedioDonacion`.
    - `moneda String?` (obligatoria a nivel de aplicación cuando el recurso es `MONETARIO`).
    - `referencia String?`.
    - Índice `@@index([medioDonacionId])`.
- `pnpm db:migrate` (base de Docker arriba) → migración `add_medios_donacion` (crea `medios_donacion`,
  el enum, y altera `aportes`).

> Nota: hacer `colaboradorId` opcional es un cambio compatible hacia atrás para los aportes existentes
> (todos los actuales lo tienen). Revisar las FKs y `onDelete` para que borrar un `MedioDonacion` no
> arrastre aportes (usar `SetNull` o impedir el borrado por regla: se **desactiva**, no se borra).

## 2. Dominio `donaciones` (`src/modules/donaciones/domain`) — puro

- `TipoMedioDonacion` (const-object + unión, mismos valores que Prisma).
- Conjunto permitido de `moneda` (`MONEDAS_PERMITIDAS`, p. ej. `["USD","VES","EUR","USDT"]`) como
  const-array + unión de tipo.
- Entidad `MedioDonacion` y tipos `NuevoMedioDonacion`, `CambiosMedioDonacion`.
- Reglas puras: `titular` y `datos` no vacíos; `moneda` ∈ `MONEDAS_PERMITIDAS`; `esPublicable(medio)`
  = `medio.activo`.
- Contrato `MedioDonacionRepository`: `crear`, `buscarPorId`, `listar` (todos, admin),
  `listarPublicables` (solo `activo`, ordenados por `orden`), `actualizar`, `cambiarActivo`.

## 3. Dominio `aportes` (extensión de 006) — puro

- Relajar la entidad `Aporte` para permitir `colaboradorId` ausente (imputado por `ADMIN`).
- Añadir `registradoPorId?`, `medioDonacionId?`, `moneda?`, `referencia?` a la entidad y a
  `NuevoAporte`.
- Validaciones puras: `esAporteMonetario(categoriaRecurso)` (`=== MONETARIO`), `montoValido(monto)`
  (`> 0`), `monedaRequeridaSiMonetario`. Reutilizar la máquina de estados: un aporte externo nace ya
  en `RECIBIDO` (transición directa válida solo por este flujo del `ADMIN`).

## 4. Aplicación

### 4.1 `donaciones/application`

- `crearMedioDonacion(deps, input)`: valida reglas puras; crea `activo = true`.
- `editarMedioDonacion(deps, id, cambios)`: valida y persiste.
- `activarMedioDonacion` / `desactivarMedioDonacion(deps, id)`: cambia `activo`.
- `listarMediosDonacion(deps)`: todos (admin).
- `listarMediosPublicables(deps)`: solo `activo`, ordenados por `orden` (lo consume 009 y superficies
  públicas).
- Errores: `MedioDonacionNoEncontradoError`, `DatosMedioInvalidosError`.
- Depende solo de `donaciones/domain`. Tests aquí.

### 4.2 `aportes/application` — `registrarAporteExterno` (006)

- `registrarAporteExterno(deps, input)`:
  - Solo `ADMIN` (se controla en la server action con `requireRol`).
  - Depende de `RecursoRepository` (004) para validar recurso `MONETARIO`; opcionalmente de
    `AyudaRepository` (005) si viene `ayudaId` (validar que la meta `MONETARIO` exista).
  - Valida: recurso existe y es `MONETARIO`; `monto > 0`; `moneda` presente y válida.
  - Crea un `Aporte`: `estado = RECIBIDO`, `cantidad = monto`, `moneda`, `recibidoEn = fechaRecepcion`,
    `colaboradorId?` (opcional), `registradoPorId = adminId`, `medioDonacionId?`, `ayudaId?`,
    `referencia?`. **No** pasa por `COMPROMETIDO`.
  - Devuelve el aporte creado.
- Errores: `RecursoNoMonetarioError`, `MontoInvalidoError`, además de los ya existentes de 006.
- Depende de `aportes/domain` + contratos de `RecursoRepository`/`AyudaRepository`. Tests aquí.

## 5. Infraestructura

- `PrismaMedioDonacionRepository` (`donaciones/infrastructure`) sobre `@/lib/prisma`: CRUD + `listar`
  / `listarPublicables` (filtro `activo`, `orderBy: { orden: "asc" }`).
- Extender `PrismaAporteRepository` (006): soportar `create` con `colaboradorId` nulo,
  `registradoPorId`, `medioDonacionId`, `moneda`, `referencia`; mapear `Decimal → number` en el monto.
  Verificar que las agregaciones de progreso/recolectado siguen agrupando bien con aportes sin
  colaborador.

## 6. Presentación (`src/modules/donaciones/ui` + `src/app`)

### 6.1 Admin (rol `ADMIN`)

- Ruta `/(admin)/panel/donaciones` (o dentro del panel 008):
  - **Medios de donación**: `MedioDonacionForm` (RHF + zod: `tipo`, `titular`, `moneda`, `datos`,
    `nota`, `orden`), tabla `MediosDonacionTabla` con activar/desactivar/editar. Server actions con
    `requireRol(ADMIN)` y `revalidatePath`.
  - **Registrar ingreso monetario**: `RegistroIngresoForm` (recurso `MONETARIO`, `monto`, `moneda`,
    `MedioDonacion` selector, `fecha de recepción` con input nativo `type="date"` + Luxon `es-VE` al
    mostrar, `ayudaId?`, `referencia?`). Server action `registrarAporteExternoAction` →
    `registrarAporteExterno`.
  - **Listado de ingresos**: tabla de aportes `MONETARIO` `RECIBIDO` imputados (monto, moneda, medio,
    fecha, referencia). Reutiliza lecturas de 006.

### 6.2 Público (para 009 / landing)

- Componente `MediosDonacionPublicos` en `donaciones/ui`: lista `listarMediosPublicables` con
  `titular`, `datos`, `moneda`, `nota`, ordenados por `orden`. **Copy explícito**: "El pago se realiza
  por fuera de la aplicación; aquí solo mostramos los medios". Sin em-dash ni en-dash. Lo consume 009
  (tablero) y/o la landing (003). **Server component** sin `requireRol` para la parte pública.

### 6.3 Componentes

- `MedioDonacionForm`, `MediosDonacionTabla`, `RegistroIngresoForm`, `IngresosMonetariosTabla`,
  `MediosDonacionPublicos`, `TipoMedioBadge`.

## 7. Composición (wiring)

- Exponer la composición (repos + casos de uso) siguiendo el patrón de `@/shared/auth` y de 006.
  `app`/`ui` no importan `infrastructure`/`lib` directamente. `registrarAporteExterno` recibe
  `AporteRepository` (006), `RecursoRepository` (004) y, si aplica, `AyudaRepository` (005); no duplica
  contratos. `donaciones` invoca a `aportes` a través de su caso de uso, no accede a su repositorio por
  dentro.

## 8. Tests (Vitest)

- `MedioDonacion` (dominio): `titular`/`datos` requeridos, `moneda` válida/inválida, `esPublicable`.
- `donaciones/application`: `crearMedioDonacion` (crea activo; rechaza datos inválidos),
  `listarMediosPublicables` (solo `activo`, ordenados por `orden`).
- `registrarAporteExterno`: crea en `RECIBIDO`; rechaza recurso no `MONETARIO`, `monto ≤ 0`, `moneda`
  inválida; admite ausencia de colaborador (queda con `registradoPorId`); ata `medioDonacionId` y
  `ayudaId` cuando se pasan.
- Con dobles en memoria (repos de medios, aportes, recursos y ayudas), junto a cada caso de uso.

## Decisiones

- **La app no procesa pagos:** solo muestra medios y registra montos ya recibidos. Ningún SDK de cobro.
- **El monto es un `Aporte` `MONETARIO` `RECIBIDO`:** una sola fuente de verdad del dinero recolectado,
  reutilizada por 009. No hay entidad "Donacion" transaccional paralela.
- **`colaboradorId` opcional + `registradoPorId`:** habilita donaciones anónimas imputadas por el
  `ADMIN` sin perder auditoría.
- **Moneda como string acotado, sin conversión:** agregados por moneda; añadir monedas no requiere
  migración de enum.
- **`MedioDonacion` se desactiva, no se borra:** conserva la trazabilidad de ingresos asociados.

## Validación final

1. `docker compose up -d` y `pnpm db:migrate` (migración `add_medios_donacion` aplicada; `aportes`
   alterada).
2. `pnpm test` (dominio de medios, `registrarAporteExterno` y listados en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN`, crear un `MedioDonacion` (p. ej. Zelle), verlo en la lista publicable;
   registrar un ingreso `MONETARIO` (con y sin colaborador, con y sin `ayudaId`); comprobar que un
   ingreso atado a una Ayuda suma a su meta `MONETARIO`, y que el agregado general refleja el monto por
   moneda. Confirmar que **no** existe ningún flujo de cobro.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `014 · Donaciones monetarias externas` a **Hecho ✅**.
- Enmendar la nota de `006 · Aportes` (el "registro manual por el `ADMIN`" pasa de "fuera, entra en
  014" a **implementado en 014**) y confirmar que `009` consume `listarMediosPublicables` y los
  agregados monetarios.
- Generar/actualizar `DOC/features/014-donaciones-monetarias-externas.md` para reflejar lo entregado.
