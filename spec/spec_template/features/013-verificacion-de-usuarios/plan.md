# 013 · Verificación de usuarios: Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), sobre el módulo
`usuarios` ya existente (002) y reutilizando el campo `estadoVerificacion` de `Usuario`. Orden:
**modelo `Usuario` (campos de traza) + enum + migración → dominio (máquina de estados de
verificación) → aplicación (+tests) → repositorio Prisma → UI de la bandeja del `ADMIN` + distintivo
→ validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002; cuando
> exista, se apoya en `requireAdminVerificado` de 015.

> **Coordinación con 015:** el enum `EstadoVerificacion` y el campo `estadoVerificacion` en `Usuario`
> se definen **una sola vez**. Si 015 ya los introdujo, esta feature los **reutiliza** y solo añade la
> traza (`verificadoPor`, `verificadoEn`, `motivoRechazo`) y los casos de uso del `ADMIN`.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`, sobre `model Usuario`:
  - Asegurar `enum EstadoVerificacion { PENDIENTE VERIFICADO RECHAZADO }` y
    `estadoVerificacion EstadoVerificacion @default(PENDIENTE)` (reutilizar si 015 ya lo creó).
  - Añadir `verificadoPorId String?`, `verificadoPor Usuario? @relation("VerificacionesUsuario", fields: [verificadoPorId], references: [id])`,
    la relación inversa `verificaciones Usuario[] @relation("VerificacionesUsuario")`,
    `verificadoEn DateTime?` y `motivoRechazo String?`.
  - Índice `@@index([rol, estadoVerificacion])` para la bandeja.
- `pnpm db:migrate` → migración `add_verificacion_usuarios` (aditiva; no destruye datos).

## 2. Capa de dominio (`src/modules/usuarios/domain`): pura

- Enum `EstadoVerificacion` (const-object + unión, mismos valores que Prisma). Reutilizar si 015 ya lo
  definió.
- Ampliar la entidad `Usuario` con `estadoVerificacion`, `verificadoPorId?`, `verificadoEn?`,
  `motivoRechazo?` (solo tipos, sin dependencias externas).
- **Máquina de estados** pura de verificación:
  - `puedeVerificar(estado)` → desde `PENDIENTE` o `RECHAZADO`.
  - `puedeRechazar(estado)` → desde `PENDIENTE`.
  - `esVerificado(estado)` → helper booleano para UI y guards.
- Regla de dominio `esRolVerificablePorAdmin(rol)` → `true` solo para `COLABORADOR` y `SOLICITANTE`
  (excluye `ADMIN` y `SUPERADMIN`, que gestiona 015).
- Ampliar el contrato `UsuarioRepository`: `listarPorRolYEstado(filtro)`, `buscarPorId` (con datos de
  verificación), `cambiarEstadoVerificacion(id, estado, adminId, verificadoEn, motivo?)`.

## 3. Capa de aplicación (`src/modules/usuarios/application`): pura

- `listarPendientesDeVerificacion(deps, filtro?)`: por defecto rol `COLABORADOR`/`SOLICITANTE` y
  estado `PENDIENTE`; filtros por rol y estado.
- `obtenerCuentaAVerificar(deps, id)`: detalle con cédula, teléfono y documento.
- `verificarUsuario(deps, usuarioId, adminId)`: comprueba `esRolVerificablePorAdmin(rol)` y
  `puedeVerificar(estado)`; pasa a `VERIFICADO`, registra `verificadoPor = adminId` y `verificadoEn`.
- `rechazarUsuario(deps, usuarioId, adminId, motivo?)`: comprueba rol y `puedeRechazar(estado)`; pasa a
  `RECHAZADO` con `motivoRechazo`.
- Errores de aplicación: `UsuarioNoEncontradoError`, `RolNoVerificableError`,
  `TransicionVerificacionInvalidaError`, `NoAutorizadoError`.
- Depende solo de `domain`. Tests aquí.

## 4. Infraestructura (`src/modules/usuarios/infrastructure`)

- Ampliar `PrismaUsuarioRepository` sobre `@/lib/prisma`: `listarPorRolYEstado` (usa el índice
  `[rol, estadoVerificacion]`), `buscarPorId` con los campos de verificación, y
  `cambiarEstadoVerificacion` (set de estado + traza en una escritura).

## 5. Presentación (`src/modules/usuarios/ui` + `src/app`)

### 5.1 Bandeja del `ADMIN`

- `/(admin)/panel/verificaciones`: **bandeja** con `VerificacionesTabla` (filtros por rol y estado;
  columnas: nombre, rol, cédula, teléfono, fecha de registro formateada `DD/MM/AAAA` con Luxon
  `es-VE`, estado).
- `/(admin)/panel/verificaciones/[id]`: **detalle** con datos de contacto y documento, y
  `VerificacionAcciones` (**verificar** / **rechazar** con `motivo` opcional).
- Server actions `verificar/rechazar`: `requireRol(ADMIN)` (+ `requireAdminVerificado` de 015 cuando
  exista), zod, `revalidatePath`.

### 5.2 Distintivo de verificado

- `VerificadoBadge` reutilizable (lucide-react, `strokeWidth={1.5}`) mostrado junto al autor de un
  aporte de transporte (006) y al autor de una solicitud (007). Sin nuevos colores de acento; usa el
  token de estado existente.

### 5.3 Componentes

- `VerificacionesTabla`, `EstadoVerificacionBadge`, `VerificacionAcciones`, `VerificadoBadge`.

## 6. Composición (wiring)

- Exponer la composición (repo Prisma + casos de uso) siguiendo el patrón de `@/shared/auth`. No
  duplicar el contrato `UsuarioRepository`; ampliarlo.

## 7. Tests (Vitest)

- Máquina de estados: `puedeVerificar`, `puedeRechazar`, `esVerificado` (positivas y negativas).
- `esRolVerificablePorAdmin`: `true` para `COLABORADOR`/`SOLICITANTE`, `false` para
  `ADMIN`/`SUPERADMIN`.
- `verificarUsuario`: verifica; rechaza rol no verificable; rechaza transición inválida; deja traza
  `verificadoPor`/`verificadoEn`.
- `rechazarUsuario`: rechaza con `motivo`; bloquea rol no verificable y transición inválida.
- Estado inicial `PENDIENTE` al registrar (comprobación con doble en memoria del registro de 002).
- Con dobles en memoria (repo de usuarios en `application/fakes.ts`), colocados junto a cada caso de
  uso.

## Decisiones

- **Reutilizar el campo, no duplicarlo:** un solo `estadoVerificacion` y un solo enum en `Usuario`,
  compartido con 015; 013 aporta la traza y el flujo del `ADMIN`.
- **`PENDIENTE` operativo para estos roles:** no se acopla a 006/007; la verificación habilita el
  distintivo y prepara límites futuros sin romper el flujo.
- **Rechazo reversible, verificación no degradable en el MVP:** `RECHAZADO → VERIFICADO` permitido;
  `VERIFICADO → PENDIENTE` fuera de alcance por simplicidad.
- **Revisión manual:** sin OCR ni terceros; el `ADMIN` decide con los datos de la 017.

## Validación final

1. `docker compose up -d` y `pnpm db:migrate` (migración `add_verificacion_usuarios` aplicada).
2. `pnpm test` (casos de uso y máquina de estados en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN`, abrir la bandeja, verificar y rechazar cuentas, ver la traza y el
   distintivo; como `COLABORADOR`/`SOLICITANTE`, comprobar que se nace en `PENDIENTE`, que el flujo
   básico (aportar/solicitar) sigue funcionando y que no se accede a la bandeja.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `013 · Verificación de usuarios` a **Hecho ✅**.
- Generar/actualizar `DOC/features/013-verificacion-de-usuarios.md` para reflejar lo entregado.
