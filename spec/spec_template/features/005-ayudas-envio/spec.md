# 005 · Ayudas / Envío

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles`, `004 · Catálogo de recursos` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce la **entidad central** del proyecto: la **Ayuda** (o **Envío**). Una Ayuda representa un
envío concreto de ayuda humanitaria hacia un sector, con una **fecha de salida**, un **destino** y un
**ciclo de vida** que avanza en un solo sentido. Cada Ayuda define **qué necesita y cuánto** mediante
sus **metas de recursos** (`MetaRecurso`), que apuntan a los `Recurso` del catálogo (feature 004).

- **Creación (solo `ADMIN`)** — el `ADMIN` crea un envío indicando destino, fecha y sus metas por
  recurso (p. ej. 500 litros de agua, 200 cajas de alimentos, 1 camión).
- **Metas de recursos** — cada meta enlaza un `Recurso` del catálogo con una **`cantidadObjetivo`**
  en la unidad de ese recurso. Una Ayuda tiene varias metas.
- **Ciclo de vida** — el `estado` avanza **en un solo sentido**:
  `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`. Lo decide el `ADMIN` (típicamente pasa a `LISTO`
  cuando las metas se cumplen). No se puede retroceder ni saltar pasos.
- **Gestión** — el `ADMIN` lista los envíos, ve su detalle (con sus metas) y edita destino/fecha y
  metas **mientras está en `RECOLECTANDO`**.

## Por qué

`tech-stack.md` y `mission.md` sitúan la **Ayuda** como el núcleo alrededor del cual gira todo:
colaboradores aportan **a una Ayuda** (006), solicitantes piden ayuda que orienta **qué Ayuda crear**
(007), y el panel (008) y la transparencia (009) muestran el **progreso de sus metas**. Sin la Ayuda
y sus metas no hay contra qué medir aportes ni qué mostrar. Es el requisito directo de las features
006–010.

## Decisiones tomadas

- **Solo `ADMIN` gestiona Ayudas.** Crear, editar, gestionar metas y avanzar el estado están
  protegidos por rol en servidor (feature 002), no solo en la UI.
- **Ciclo de vida unidireccional y paso a paso.** Transiciones válidas: `RECOLECTANDO → LISTO`,
  `LISTO → EN_TRANSITO`, `EN_TRANSITO → ENTREGADO`. Nada de retroceder ni saltar; `ENTREGADO` es
  terminal. La máquina de estados es una **regla de dominio** pura y testeable.
- **Metas editables solo en `RECOLECTANDO`.** Una vez el envío pasa a `LISTO`, las metas quedan
  **congeladas** (a partir de ahí los aportes cuentan contra un objetivo fijo). Los datos de cabecera
  (destino, fecha, título, descripción) también se editan solo en `RECOLECTANDO`.
- **`MetaRecurso` única por (Ayuda, Recurso).** No se repite un recurso en dos metas de la misma
  Ayuda; para cambiar el objetivo se edita la meta existente. Solo se pueden usar recursos **activos**
  del catálogo.
- **`cantidadObjetivo` numérica positiva**, en la **unidad del recurso**. Se almacena como `Decimal`
  en la base (precisión) y se convierte a número en el límite; debe ser `> 0`.
- **El progreso NO se calcula aquí.** El progreso de una meta = aportes `RECIBIDO` ÷ `cantidadObjetivo`
  depende de los **Aportes** (feature 006). En 005 el progreso se muestra como "sin aportes aún".
- **El histórico de trazabilidad es 010.** Aquí el `estado` cambia; el registro de cada transición
  como `SeguimientoEvento` (con nota/evidencia) llega en la feature 010.
- **Módulo `src/modules/ayudas/`** con las cuatro capas, siguiendo Clean + Screaming.

## Alcance

**Incluye**

- Modelo Prisma:
  - `enum EstadoAyuda { RECOLECTANDO LISTO EN_TRANSITO ENTREGADO }`.
  - `model Ayuda`: `titulo` (breve, para identificar el envío), `sectorDestino`, `fecha` (salida),
    `estado` (`@default(RECOLECTANDO)`), `descripcion?`, relación `metas`, timestamps.
  - `model MetaRecurso`: relación a `Ayuda` (cascade) y a `Recurso`, `cantidadObjetivo` (`Decimal`),
    `@@unique([ayudaId, recursoId])`, timestamps.
  - Relación inversa `metas` en `Recurso`. **Migración** correspondiente.
- Dominio: entidades `Ayuda` y `MetaRecurso`, enum `EstadoAyuda`, contratos de repositorio, y las
  reglas puras: **máquina de estados** (transiciones válidas), validaciones (destino/fecha, meta con
  recurso activo y `cantidadObjetivo > 0`, no duplicar recurso).
- Casos de uso: **crear** Ayuda (con sus metas iniciales), **listar** (con filtro por estado),
  **obtener detalle**, **editar** cabecera, **gestionar metas** (añadir / editar objetivo / quitar,
  solo en `RECOLECTANDO`), **avanzar estado** (valida la transición), y **eliminar** (solo en
  `RECOLECTANDO`).
- Infraestructura: `PrismaAyudaRepository` (con sus metas). Lectura de recursos activos vía el
  catálogo (feature 004) para elegir en las metas.
- Presentación **solo-`ADMIN`** bajo el área de administración: **listado** de envíos, **alta** (con
  selección de recursos del catálogo y objetivos), **detalle** (metas + estado + botón de avanzar) y
  **edición** de cabecera/metas. Formularios con React Hook Form; validación con `zod`; server actions
  que revalidan rol y hacen `revalidatePath`.
- Tests (Vitest) de los casos de uso y de la máquina de estados.

**No incluye**

- **Aportes** de colaboradores ni el **cálculo de progreso** real de las metas: feature 006.
- **Solicitudes** de ayuda (007), **panel** del admin (008) ni **tablero público** (009).
- **Histórico de trazabilidad** (`SeguimientoEvento`) y evidencia de entrega: feature 010.
- **Puntos de acopio** (011) ni asociación de metas/aportes a un punto.
- Retroceso de estados, edición de metas tras `LISTO`, o borrado de envíos ya avanzados.
- Notificaciones al avanzar de estado (012).

## Criterios de aceptación

- [ ] El `ADMIN` puede **crear** una Ayuda con `titulo`, `sectorDestino`, `fecha` y una o más metas
      (recurso del catálogo + `cantidadObjetivo`); nace en estado `RECOLECTANDO`.
- [ ] Solo se pueden añadir metas con **recursos activos** del catálogo, con `cantidadObjetivo > 0`, y
      **sin repetir** recurso en la misma Ayuda (validado en servidor).
- [ ] El `ADMIN` puede **avanzar el estado** solo por la secuencia válida
      `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`; cualquier salto o retroceso se **rechaza**.
- [ ] El `ADMIN` puede **editar** cabecera y **metas** mientras la Ayuda está en `RECOLECTANDO`; tras
      `LISTO`, esas ediciones se **bloquean**.
- [ ] El **listado** muestra los envíos con su estado y permite **filtrar por estado**; el **detalle**
      muestra las metas con su objetivo y unidad.
- [ ] Un usuario **no-`ADMIN`** (o sin sesión) **no** puede acceder a la gestión de Ayudas (protegido
      en servidor).
- [ ] La **migración** crea `ayudas`, `metas_recurso` y el enum `EstadoAyuda` sin errores.
- [ ] `pnpm test` cubre: transiciones válidas/ inválidas, meta con cantidad no positiva, recurso
      duplicado, y bloqueo de edición fuera de `RECOLECTANDO` — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `ayudas/domain` y `ayudas/application` permanecen
      **puras** (sin framework ni Prisma).

## Notas y riesgos

- **Dependencias:** no debería hacer falta ninguna nueva (Prisma, zod, RHF, Auth.js ya están). Para
  fechas usar **Luxon** (ya instalado) en el formateo de la UI. Si se valorara algo más, **avisar**.
- **Next 16:** route handlers, server actions y server components cambian — leer
  `node_modules/next/dist/docs/` antes de codificar (AGENTS.md). La gestión vive bajo `requireRol`
  y `proxy.ts` de la feature 002 (área `/panel`).
- **`Decimal` de Prisma:** `cantidadObjetivo` se devuelve como `Decimal`; convertir a `number` (o
  string) en el límite de infraestructura para que dominio/aplicación trabajen con números puros.
  Documentar y ser consistente con lo que hará Aportes (006).
- **Integridad con el catálogo:** una meta referencia un `Recurso`; como los recursos se **archivan**
  (no se borran, feature 004), no habrá metas huérfanas. No permitir metas nuevas con recursos
  archivados.
- **Máquina de estados como dominio puro:** modelar las transiciones como función/regla en `domain`
  (p. ej. `siguienteEstado(estado)` y `puedeTransicionar(desde, hacia)`), testeable sin base.
- **Progreso diferido:** dejar el detalle preparado para mostrar progreso cuando 006 aporte los
  datos; no adelantar el cálculo aquí.
- **Zona horaria de `fecha`:** guardar en UTC; interpretar/mostrar con Luxon. Definir si `fecha` es
  solo día o fecha-hora (recomendado: fecha de salida a nivel de día).
