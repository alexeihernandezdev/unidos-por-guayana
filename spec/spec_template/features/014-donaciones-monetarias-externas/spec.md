# 014 · Donaciones monetarias externas

> Estado: **Hecho ✅** · Depende de: `002 · Autenticación y roles`, `004 · Catálogo de recursos`, `006 · Aportes` · Relacionado (consume las lecturas): `009 · Tablero público de transparencia` · Roadmap: `constitution/roadmap.md`
>
> **Nota de implementación (enmienda a 006 no listada en el plan original):** para cumplir el
> criterio "un ingreso sin actividad asociada cuenta en el agregado general", además de
> `colaboradorId` se hizo **`Aporte.ayudaId` opcional** (migración `aporte_ayuda_opcional`). Un ingreso
> de "caja general" nace en `RECIBIDO` sin `ayudaId`; los aportes de colaborador (006) siempre la
> llevan. El registro de montos se implementó como `registrarAporteExterno` en `aportes/application`.

## Qué hace

Introduce las **donaciones monetarias externas**: la forma en que el proyecto **muestra al público
los medios para donar dinero** (cuenta bancaria, Pago Móvil, PayPal, Zelle, Binance, etc.) y en que
el `ADMIN` **registra manualmente los montos ya recibidos por fuera** para reflejarlos en la
transparencia. Es la materialización del principio: la ayuda monetaria es bienvenida, pero **el pago
siempre ocurre por un canal externo**; la app solo **muestra** los medios y **registra** lo que ya
ingresó.

Se apoya en dos piezas ya existentes: el `Recurso` de categoría `MONETARIO` (feature 004) y el
`Aporte` MONETARIO (feature 006). El aporte MONETARIO ya modela "un monto que el `ADMIN` marca
`RECIBIDO` al confirmar el ingreso externo"; esta feature añade lo que faltaba alrededor: **el
catálogo público de medios de pago externos** y una vía cómoda para que el `ADMIN` **impute montos
recibidos sin colaborador identificado** (transferencia anónima, efectivo en punto de acopio, etc.).

- **Medios de donación (`MedioDonacion`)** — entidad de configuración que el `ADMIN` administra:
  `tipo` (`CUENTA_BANCARIA`, `PAGO_MOVIL`, `PAYPAL`, `ZELLE`, `BINANCE`, `EFECTIVO`, `OTRO`),
  `titular`, los **datos de la instrucción** (número de cuenta, correo, teléfono, alias… según el
  tipo), la `moneda` asociada, una `nota`/instrucción y un `activo` para mostrarlo u ocultarlo. Es
  **de solo lectura para el público**: aparece en el tablero de transparencia (009) y donde el
  proyecto invite a donar.
- **Registro manual de montos recibidos (`ADMIN`)** — el `ADMIN` registra un ingreso monetario ya
  recibido por fuera, asociado a un `Recurso` de categoría `MONETARIO`, indicando `monto`, `moneda`,
  el `MedioDonacion` por el que entró, `fecha de recepción` y una referencia/nota opcional. El
  registro nace **directamente en `RECIBIDO`** (el dinero ya está), de modo que suma a la
  transparencia sin pasos intermedios.
- **Se apoya en el `Aporte` MONETARIO (006)** — cada ingreso registrado es un `Aporte` de categoría
  `MONETARIO` en estado `RECIBIDO`. Si hay un colaborador identificado se le asocia; si no (donación
  anónima), el aporte queda **sin colaborador** e imputado por el `ADMIN`. No se duplica el modelo de
  aportes: se reutiliza y se extiende lo mínimo.
- **La app NO procesa el pago** — no hay pasarela, ni tarjeta, ni saldo, ni checkout. Mostrar un
  medio y registrar un monto son operaciones **informativas y de registro**, nunca de cobro.

## Por qué

`mission.md` incluye las **donaciones monetarias externas** como módulo de apoyo y, en "Qué NO es",
fija que la app **no es una pasarela de pagos**: la ayuda monetaria se canaliza por fuera y la app
solo **muestra los medios externos** y **registra los montos ya recibidos** para transparencia. Hoy
falta la pieza que hace visible **cómo donar** (no hay dónde publicar la cuenta bancaria o el Zelle) y
la pieza que permite **imputar dinero recibido sin un colaborador que lo cargue** (una transferencia
anónima, efectivo en el punto de acopio). Sin esta feature, el `MONETARIO` del tablero (009) queda en
cero aunque haya entrado dinero, y el donante no sabe a dónde transferir. Esta feature cierra ese
hueco respetando el límite duro: **transparencia, no cobro**.

## Decisiones tomadas

- **La app no procesa pagos. Punto.** No se integra ninguna pasarela, API de cobro, tokenización de
  tarjetas, ni saldo interno. Todo lo que esta feature toca es: (a) **texto/datos** de medios externos
  para mostrar, y (b) **registro** de montos ya recibidos. Cualquier propuesta de "botón de pagar",
  "checkout" o "integrar Stripe/MercadoPago" queda **fuera** y contradice `tech-stack.md` (límite
  duro). Se deja explícito en spec y plan.
- **Se reutiliza el `Aporte` MONETARIO (006), no se crea un modelo paralelo de "donación".** El ingreso
  monetario **es** un `Aporte` de recurso `MONETARIO` en `RECIBIDO`. Así el tablero (009) ya lo suma
  sin cambios y no hay dos fuentes de verdad para "cuánto dinero se recibió".
- **Aportes monetarios sin colaborador.** Hasta ahora un `Aporte` siempre tenía `colaboradorId`. Aquí
  se permite que un aporte **imputado por el `ADMIN`** no tenga colaborador (donación anónima o de un
  tercero no registrado). Se añade `colaboradorId` **opcional** y un `registradoPorId` (el `ADMIN` que
  lo cargó) para auditoría. Un aporte imputado nace en `RECIBIDO`.
- **`MedioDonacion` es una entidad de configuración, no de dominio transaccional.** No participa en el
  ciclo de vida de una Ayuda; es catálogo administrable (como los recursos), con `activo` para
  publicar/ocultar. No se borra si tiene ingresos asociados: se **desactiva**.
- **El monto se guarda con su moneda.** `moneda` (`USD`, `VES`, `EUR`, `USDT`…) como código de string
  acotado; el `monto` como `Decimal(14,2)`. El tablero (009) agrega **por moneda**, nunca mezcla
  divisas ni convierte (no hay tasa de cambio en el MVP).
- **El ingreso se ata a un `MedioDonacion` (opcional) y a una `fecha de recepción`.** Da trazabilidad
  ("entró por el Zelle el 03/07/2026") sin exponer datos personales del donante en la transparencia.
- **`fecha de recepción` la pone el `ADMIN`.** Puede ser anterior a hoy (dinero que llegó ayer se
  registra hoy). Se guarda en UTC y se muestra en `es-VE` (`dd/MM/yyyy`).
- **Un ingreso monetario no se ata obligatoriamente a una Ayuda.** Puede ser una donación de "caja
  general". Si se asocia a una Ayuda (aporte a su meta `MONETARIO`), suma al progreso de esa meta como
  cualquier aporte 006; si no, cuenta en el agregado general de dinero recibido. Se decide con un
  campo `ayudaId` **opcional** en el registro.
- **Módulo `src/modules/donaciones/`** (Clean + Screaming) para la entidad **`MedioDonacion`** y sus
  casos de uso de gestión pública/administrativa. El **registro de montos recibidos** se implementa
  como caso de uso **`registrarAporteExterno`** que vive en el módulo **`aportes` (006)**, porque
  opera sobre el `Aporte` (su entidad, su repositorio, su invariante de progreso). Justificación: los
  medios de pago son un catálogo propio (dominio distinto), mientras que el monto recibido es un aporte
  y debe compartir el modelo, el repositorio y la agregación de 006 para no bifurcar la verdad del
  dinero recolectado. `donaciones` **depende** de `aportes` para el registro; no lo reimplementa.

## Alcance

**Incluye**

- Modelo Prisma:
  - `enum TipoMedioDonacion { CUENTA_BANCARIA PAGO_MOVIL PAYPAL ZELLE BINANCE EFECTIVO OTRO }`.
  - `model MedioDonacion`: `id`, `tipo` (`TipoMedioDonacion`), `titular` (String), `moneda` (String,
    código acotado), `datos` (String, la instrucción legible: número de cuenta, correo, alias…),
    `nota` (String?, instrucción adicional), `orden` (Int, para ordenar en la vista pública), `activo`
    (Boolean `@default(true)`), timestamps. `@@map("medios_donacion")`.
  - En `model Aporte` (006): `colaboradorId` pasa a **opcional** (`String?`) y se añade
    `registradoPorId` (`String?`, el `ADMIN` que imputó el aporte externo), `medioDonacionId`
    (`String?`, relación opcional a `MedioDonacion`), `moneda` (`String?`, obligatoria cuando el
    recurso es `MONETARIO`) y `referencia` (`String?`, nota/número de referencia del ingreso). Relación
    inversa `aportes` en `MedioDonacion`.
  - **Migración** correspondiente (`add_medios_donacion` + alteración de `aportes`).
- Dominio:
  - En `src/modules/donaciones/domain`: entidad `MedioDonacion`, enum `TipoMedioDonacion`, contrato
    `MedioDonacionRepository`, y reglas puras (`titular` y `datos` no vacíos, `moneda` en el conjunto
    permitido, `esPublicable(medio)` = `activo`).
  - En `src/modules/aportes/domain` (extensión mínima de 006): permitir `Aporte` sin `colaboradorId`
    cuando es imputado; validación pura `esAporteMonetario(recurso)` y `montoValido(monto)` (> 0).
- Casos de uso:
  - En `donaciones/application`: `crearMedioDonacion`, `editarMedioDonacion`,
    `activarMedioDonacion` / `desactivarMedioDonacion`, `listarMediosDonacion` (admin, todos) y
    `listarMediosPublicables` (solo `activo`, para 009 y superficies públicas).
  - En `aportes/application` (006): `registrarAporteExterno(deps, input)` — solo `ADMIN`; crea un
    `Aporte` de recurso `MONETARIO` en `RECIBIDO`, con `monto`/`moneda`, `medioDonacionId?`,
    `ayudaId?`, `colaboradorId?`, `registradoPorId = admin`, `recibidoEn = fechaRecepcion`. Valida
    recurso `MONETARIO`, `monto > 0`, y (si hay `ayudaId`) que la meta exista. No pasa por
    `COMPROMETIDO`.
- Infraestructura:
  - `PrismaMedioDonacionRepository` en `donaciones/infrastructure`.
  - Extensión de `PrismaAporteRepository` (006) para el nuevo caso (campos opcionales,
    `medioDonacionId`, `moneda`, `referencia`; mapear `Decimal → number`).
- Presentación:
  - **Admin** (`/(admin)/panel/donaciones` o similar):
    - Gestión de **medios de donación**: alta, edición, activar/desactivar, ordenar. Formularios con
      `zod` + RHF; server actions con `requireRol(ADMIN)` y `revalidatePath`.
    - **Registrar ingreso monetario**: formulario con recurso `MONETARIO`, `monto`, `moneda`,
      `MedioDonacion`, `fecha de recepción`, `ayudaId?` y `referencia?`. Invoca `registrarAporteExterno`.
    - Listado de ingresos monetarios registrados (monto, moneda, medio, fecha, referencia).
  - **Público** (componente reutilizable, consumido por 009 y/o la landing 003):
    - `MediosDonacionPublicos` — lista los `MedioDonacion` `activo` con `titular`, `datos`, `moneda`,
      `nota`, agrupados/ordenados por `orden`. Copy claro de que **el pago es por fuera de la app**.
- Tests (Vitest): reglas de `MedioDonacion` (campos requeridos, moneda válida, `esPublicable`),
  `registrarAporteExterno` (crea en `RECIBIDO`; rechaza recurso no `MONETARIO`, `monto ≤ 0`; admite
  ausencia de colaborador; ata `medioDonacionId`/`ayudaId` cuando se pasan), y que
  `listarMediosPublicables` **solo** devuelve los `activo`.

**No incluye**

- **Procesar el pago**, botón de "donar ahora" que cobre, checkout, pasarela, tarjetas, saldos o
  conversión de divisas. Límite duro de `tech-stack.md` y `mission.md`. Esta feature **jamás** mueve
  dinero.
- **Tasa de cambio / conversión entre monedas.** Los montos se agregan por moneda; no se convierte USD
  a VES ni viceversa en el MVP.
- **Conciliación bancaria automática / lectura de estados de cuenta.** El registro es **manual**; no se
  importa ni se cruza con extractos.
- **Comprobantes/recibos** emitidos al donante ni facturación fiscal.
- **Notificaciones** al donante o al colaborador por un ingreso registrado (feature 012).
- **Exponer datos personales del donante** en la transparencia (009): el tablero sigue mostrando solo
  **agregados por moneda** (privacidad dura de 009).
- **La vista pública del tablero** en sí (la construye 009); aquí se entrega el **componente de medios**
  y la **lectura publicable**, que 009 consume.

## Criterios de aceptación

- [x] La app **no procesa ningún pago**: no hay pasarela, checkout, tarjeta ni saldo en ninguna ruta ni
      caso de uso de esta feature. (Verificado por ausencia y por diseño.)
- [x] Un `ADMIN` puede **crear, editar, activar y desactivar** un `MedioDonacion` con `tipo`, `titular`,
      `moneda` válida, `datos` y `nota` opcional. Un `MedioDonacion` con ingresos asociados **no se
      borra**, se **desactiva**.
- [x] `listarMediosPublicables` devuelve **solo** los `MedioDonacion` con `activo = true`, ordenados por
      `orden`. Un medio inactivo **no** aparece en superficies públicas.
- [x] Un `ADMIN` puede **registrar un monto recibido** (recurso `MONETARIO`, `monto > 0`, `moneda`,
      `MedioDonacion` opcional, `fecha de recepción`, `ayudaId` opcional, `referencia` opcional). El
      registro se crea como `Aporte` `MONETARIO` en **`RECIBIDO`** (no pasa por `COMPROMETIDO`).
- [x] El registro admite **donación sin colaborador identificado**: el `Aporte` queda sin
      `colaboradorId`, con `registradoPorId` = el `ADMIN`. Un aporte imputado nunca queda huérfano de
      auditoría.
- [x] El sistema **rechaza**: registrar un ingreso sobre un recurso no `MONETARIO`, `monto ≤ 0`, o
      `moneda` fuera del conjunto permitido. Validado en servidor.
- [x] Si el ingreso se asocia a una `ayudaId`, **suma al progreso** de su meta `MONETARIO` (como
      cualquier aporte `RECIBIDO` de 006). Si no se asocia, cuenta en el **agregado general** de dinero
      recibido.
- [x] El **tablero público (009)** refleja el dinero recibido como **monto agregado por moneda**, con
      nota de que el pago es por canal externo; **sin** datos personales del donante y **sin** ninguna
      operación de cobro.
- [x] Las fechas de recepción se muestran en español (`dd/MM/yyyy`, Luxon `es-VE`); nunca ISO ni
      `MM/DD/AAAA` en texto visible. Ningún em-dash ni en-dash en textos visibles.
- [x] La **migración** crea `medios_donacion` y el enum `TipoMedioDonacion`, y altera `aportes`
      (`colaboradorId` opcional, `registradoPorId`, `medioDonacionId`, `moneda`, `referencia`) sin
      errores.
- [x] `pnpm test` cubre: reglas de `MedioDonacion`, `registrarAporteExterno` (creación en `RECIBIDO`,
      rechazos, ausencia de colaborador, asociación a medio/ayuda) y `listarMediosPublicables` (solo
      activos) — en verde.
- [x] `pnpm lint` / `pnpm build` sin errores; `donaciones/domain`, `donaciones/application` y la
      extensión de `aportes/*` **puras** (sin framework ni Prisma en dominio/aplicación).

## Notas y riesgos

- **Dependencias:** ninguna nueva. Zod, RHF, Prisma, Auth.js y Luxon ya están. **Prohibido** añadir
  cualquier SDK de pagos (Stripe, MercadoPago, PayPal SDK, etc.): contradice el límite duro. Si alguien
  lo plantea, se rechaza y se documenta por qué.
- **Reutilización de 006:** el registro de montos **es** un `Aporte` `MONETARIO` en `RECIBIDO`. Esta
  feature **enmienda** 006 (hace `colaboradorId` opcional y añade `registradoPorId`, `medioDonacionId`,
  `moneda`, `referencia`). Revisar que los cálculos de progreso de 006 y los agregados de 009 sigan
  correctos cuando un aporte no tiene colaborador. Los tests de 006 que asumen `colaboradorId` presente
  deben ajustarse.
- **Privacidad:** el donante puede quedar identificado en el registro interno (referencia, colaborador
  si aplica), pero **nunca** en la transparencia pública (009). El DTO público sigue siendo agregado
  por moneda. No filtrar `titular` de cuentas de terceros ni referencias en superficies públicas.
- **Moneda como string acotado:** validar contra un conjunto permitido (`USD`, `VES`, `EUR`, `USDT`…)
  en el dominio; no usar un enum de Prisma para no migrar cada vez que se acepte una moneda nueva.
  Documentar el conjunto en el dominio.
- **Sin conversión de divisas:** el agregado es por moneda. Si el cliente pide un total unificado en
  una divisa, requiere una tasa de cambio y es **otra** feature (fuera de alcance, avisar).
- **Next 16:** server actions y server components cambian; consultar `node_modules/next/dist/docs/`
  antes de codificar (AGENTS.md). Reutilizar `requireRol` y el patrón de composición de 002/006.
- **`Decimal` de Prisma:** `monto` como `Decimal(14,2)` en base, `number` en el límite de
  infraestructura, consistente con 005/006.
- **Orden de implementación con 009:** si 014 aterriza antes que 009, el tablero consumirá
  `listarMediosPublicables` y los agregados monetarios cuando 009 se construya. Si 009 llega primero,
  muestra el `MONETARIO` en cero hasta que 014 permita registrar ingresos. Documentar el orden real al
  ejecutar.
- **Enmienda a features previas:** al cerrar, actualizar la nota de 006 ("Registro manual de aportes
  por el `ADMIN`" pasa de "fuera, entra en 014" a **hecho aquí**) y confirmar que 009 lee los agregados
  monetarios y los medios publicables.
