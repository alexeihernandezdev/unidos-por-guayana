# 011 · Puntos de acopio (Plan)

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), replicando el
patrón ya probado en el módulo `recursos` (feature 004), pero en el **módulo nuevo
`src/modules/acopio`**. Orden:
**modelo `PuntoAcopio` + migración → dominio/aplicación (+tests) → repositorio Prisma → UI de gestión
solo-`ADMIN` dueño → alimentar el selector del `Aporte` (feature 006) → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002; la
> relación `adminId` y la herencia de ubicación provienen de la feature 016.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma` añadir:
  - `model PuntoAcopio { id, nombre, direccion, horarios, estado, parroquia, adminId (FK a Usuario ADMIN), activo Boolean @default(true), createdAt, updatedAt, @@map("puntos_acopio") }`.
  - Relación N a N con `Recurso` (qué recibe) mediante tabla puente explícita (p. ej.
    `PuntoAcopioRecurso` / `@@map("puntos_acopio_recursos")`), o relación implícita de Prisma si basta.
  - Confirmar/consumir la relación `Usuario (ADMIN) 1 a N PuntoAcopio` declarada en la feature 016
    (lado `adminId`). La referencia opcional `Aporte → PuntoAcopio` ya existe (feature 006).
- `pnpm db:migrate` (con la base de Docker arriba) → migración `add_puntos_acopio`.
- Regenerar el cliente (`pnpm db:generate` lo hace `migrate`).

## 2. Capa de dominio (`src/modules/acopio/domain`), pura

- Tipo/entidad `PuntoAcopio` y tipos `NuevoPuntoAcopio` / `CambiosPuntoAcopio` (incluye la lista de
  `recursoId` que recibe y el `adminId` dueño).
- Contrato `PuntoAcopioRepository`: `crear`, `listarPorAdmin(adminId, filtro?)`,
  `listarActivosPorAdmin(adminId)` (para el aporte), `buscarPorId`, `actualizar`, `cambiarActivo`.
- Reglas de dominio puras:
  - `nombre`/`direccion`/`horarios` no vacíos (trim).
  - `aplicarHerenciaUbicacion(perfil, entrada)`: si `estado`/`parroquia` vienen vacíos, tomar los del
    `PerfilAdmin`; validar que el resultado no quede vacío.
  - `perteneceA(punto, adminId)`: comprobación de propiedad.
- Sin imports de framework ni Prisma (ESLint lo impide).

## 3. Capa de aplicación (`src/modules/acopio/application`), pura

- `crearPuntoAcopio(deps, adminId, input)`: valida campos, aplica herencia de ubicación desde el
  `PerfilAdmin` (leído por un puerto/contrato), valida que los `recursoId` existan y estén activos
  (feature 004), crea el punto atado al `adminId`.
- `listarPuntosDeAdmin(deps, adminId, filtro?)`: los del dueño, filtro solo-activos.
- `listarPuntosActivosParaAporte(deps, adminId)`: puntos activos seleccionables en el `Aporte`.
- `editarPuntoAcopio(deps, adminId, id, cambios)`: **comprueba propiedad** (`perteneceA`) antes de
  actualizar; revalida campos y recursos.
- `archivarPuntoAcopio` / `activarPuntoAcopio(deps, adminId, id)`: comprueba propiedad y alterna
  `activo`.
- Errores de aplicación (`PuntoAcopioNoEncontradoError`, `PuntoAcopioAjenoError`,
  `RecursoNoDisponibleError`, `UbicacionVaciaError`) como en `recursos`.
- Depende solo de `domain`. Es el sitio de los tests unitarios (con repos en memoria).

## 4. Infraestructura (`src/modules/acopio/infrastructure`)

- `PrismaPuntoAcopioRepository` implementa `PuntoAcopioRepository` sobre `@/lib/prisma`. Mapea la fila
  de Prisma (y la tabla puente de recursos) a la entidad de dominio. Los filtros por `adminId` y
  `activo` se resuelven en la consulta.
- Puerto para leer el `PerfilAdmin` (estado/parroquia) del `ADMIN` dueño: reutilizar el repositorio de
  `usuarios` (feature 016) vía un contrato de `acopio/domain`, sin que `acopio` dependa de la
  infraestructura de `usuarios`.

## 5. Presentación (`src/modules/acopio/ui` + `src/app`), solo `ADMIN` dueño

- Rutas bajo el área de administración (protegidas): p. ej.
  - `/(admin)/panel/acopio`: **listado** de los puntos del `ADMIN` (server component;
    `requireRol(ADMIN)`; consulta filtrada por su `adminId`).
  - `/(admin)/panel/acopio/nuevo`: **alta** (con `estado`/`parroquia` prellenados desde su perfil).
  - `/(admin)/panel/acopio/[id]/editar`: **edición** (previa comprobación de propiedad).
- Componentes en `src/modules/acopio/ui` (PascalCase): `PuntoAcopioForm` (client, RHF; incluye
  selección de recursos que recibe y campos de ubicación prellenados), `PuntosAcopioTabla` (listado
  con estado activo/archivado y filtro), `PuntoAcopioAccionesArchivar`.
- **Server actions** para crear/editar/archivar que:
  - validan con `zod` en el límite,
  - vuelven a comprobar rol (`requireRol(ADMIN)`) **y propiedad** (`adminId` de la sesión), defensa en
    profundidad,
  - invocan los casos de uso compuestos (repos Prisma inyectados) y hacen `revalidatePath` del listado.
- Ampliar el `matcher` de `proxy.ts` (feature 002) si hace falta para cubrir `/panel/acopio` (ya cubre
  `/panel/:path*`).
- **Selector en el `Aporte` (feature 006):** exponer `listarPuntosActivosParaAporte` para poblar el
  campo opcional `PuntoAcopio` del formulario de aporte, sin alterar su ciclo de vida.

## 6. Composición (wiring)

- Igual que en `recursos`/`usuarios`: la composición (repos Prisma + casos de uso) se expone desde una
  fachada que la presentación importa sin romper los límites de capas (ESLint). Inyectar tanto el
  `PuntoAcopioRepository` como el puerto de lectura del `PerfilAdmin`. Mantener `app`/`ui` sin importar
  `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- `crearPuntoAcopio`: crea atado al `adminId`; **hereda** `estado`/`parroquia` del perfil cuando faltan
  y **respeta** los del formulario cuando se indican; rechaza campos vacíos; rechaza `recursoId`
  inexistente o archivado.
- `editarPuntoAcopio`: actualiza cuando es del dueño; **rechaza** `adminId` ajeno.
- `archivarPuntoAcopio`/`activarPuntoAcopio`: comprueba propiedad y alterna `activo`.
- `listarPuntosDeAdmin` / `listarPuntosActivosParaAporte`: filtran por `adminId` y por solo-activos.
- Con dobles en memoria (repo de puntos y puerto de perfil), colocados junto a cada caso de uso
  (`*.test.ts`).

## Decisiones

- **Módulo nuevo `acopio`:** el CRUD de `PuntoAcopio` es su propio dominio; consume `adminId` y
  ubicación de `usuarios`/`PerfilAdmin` (016) por contrato, sin acoplarse a su infraestructura.
- **Propiedad además de rol:** todo filtra por `adminId` en servidor (lectura y escritura); el rol
  `ADMIN` no basta para tocar puntos ajenos.
- **Archivar (soft) en vez de borrar:** protege la integridad referencial con los aportes (006).
- **Herencia de ubicación con valor efectivo:** se copia el valor al crear (con opción de
  sobrescribir), de modo que el punto no cambie si el perfil se edita después.
- **Qué recibe contra el catálogo (004):** recursos activos, no texto libre, para coherencia con metas
  y aportes.
- **Dominio/aplicación agnósticos de Prisma:** los repos Prisma son adaptadores; la lógica es pura y
  testeable, como en `recursos`.

## Validación final

1. `docker compose up -d` (base arriba) y `pnpm db:migrate` (migración aplicada).
2. `pnpm test` (casos de uso en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN`, crear un punto (comprobar herencia de ubicación), editarlo, archivar y
   reactivar, y verlo en el listado; comprobar que otro `ADMIN` no ve ni edita ese punto y que un
   no-`ADMIN` no accede a `/panel/acopio`; comprobar que el punto activo aparece como opción de entrega
   al registrar un aporte (feature 006).

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `011 · Puntos de acopio` a **Hecho ✅** y promover la
  siguiente feature de apoyo (`012 · Notificaciones`) según el orden del backlog.
- Verificar que `DOC/features/011-puntos-de-acopio.md` refleja lo entregado.
