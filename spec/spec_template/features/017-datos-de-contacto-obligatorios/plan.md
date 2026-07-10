# 017 · Datos de contacto obligatorios — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros). Esta feature **enmienda 002**: reutiliza el
> módulo `src/modules/usuarios` ya existente.

## Enfoque general

Construir de **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación),
apoyándose en el módulo `usuarios` de la feature 002. Orden:
**reglas de dominio (cédula/teléfono) → ampliar modelo `Usuario` + migración → enmendar
`registrarUsuario` → formulario de registro → flujo de completar perfil + guard → tests**.

> ⚠️ Antes de tocar proxy (antes middleware), server actions o server components de Next 16, leer la
> guía en `node_modules/next/dist/docs/` (AGENTS.md). Esta versión trae cambios importantes.

## 1. Reglas de dominio (`src/modules/usuarios/domain`) — puras

- `validarCedula(entrada): ResultadoValidacion` — acepta prefijo `V` | `E` | `J` (con o sin
  guion/espacio) y número; comprueba prefijo válido y 6-9 dígitos. Devuelve error tipado con el
  mensaje en español o el valor normalizado.
- `normalizarCedula(entrada): string` — prefijo en mayúscula + dígitos sin puntos (`V12345678`).
- `validarTelefono(entrada): ResultadoValidacion` — normaliza a 11 dígitos `0XXXXXXXXXX`
  (convierte `+58` inicial en `0`) y valida longitud y código de operadora contra una constante de
  dominio `CODIGOS_OPERADORA_VENEZUELA`.
- `normalizarTelefono(entrada): string` — solo dígitos en formato nacional.
- Constante `PREFIJOS_CEDULA = ["V", "E", "J"]` y la lista de códigos de operadora, como dominio.
- Sin imports de framework, Prisma ni Auth.js (ESLint lo impide).

## 2. Modelo de datos y migración

- En `prisma/schema.prisma`, ampliar `model Usuario`:
  - `cedula String? @unique`
  - `telefono String?`
  - (opcionales en BD para no romper filas existentes; obligatorios en el flujo, ver 4 y 5).
- `pnpm db:migrate` — migración que **añade** ambas columnas (aditiva, segura sobre datos
  existentes). No se marca `NOT NULL` en esta migración.

## 3. Capa de aplicación (`src/modules/usuarios/application`) — pura

- Enmendar `registrarUsuario(input)`:
  - Si el rol es `COLABORADOR` | `SOLICITANTE`, exigir `cedula` y `telefono`; validarlos con
    `validarCedula` / `validarTelefono` y **normalizar** antes de crear.
  - Comprobar **cédula no duplicada** vía `UsuarioRepository` (nuevo método `buscarPorCedula` o
    equivalente) y devolver el error de duplicado.
  - Para `ADMIN` (el registro público de 016) y `SUPERADMIN`, no exigir estos campos.
- Nuevo caso de uso `completarDatosContacto(usuarioId, input)`:
  - Valida y normaliza cédula/teléfono, comprueba unicidad y actualiza el `Usuario`.
- Depende solo de `domain`. Es el mejor sitio para los tests unitarios.

## 4. Infraestructura (`src/modules/usuarios/infrastructure` + `src/lib`)

- Ampliar `PrismaUsuarioRepository`: método para buscar por cédula y método de actualización de los
  datos de contacto, sobre el cliente de `src/lib/prisma.ts`.
- No cambia la configuración de Auth.js; el `rol` sigue viajando en la sesión JWT (002).

## 5. Presentación (`src/modules/usuarios/ui` + `src/app`)

- **Formulario de registro** (client component, React Hook Form): añadir campos `cedula` y
  `telefono` con resolver que delega el formato en `validarCedula` / `validarTelefono`; mensajes en
  español. Solo se muestran/exigen para `COLABORADOR` | `SOLICITANTE` (el `rol` llega por
  `?rol=` de la landing).
- El registro sigue llamando al server action que ejecuta `registrarUsuario`.
- **Pantalla `/completar-perfil`** (server component + formulario): pide los dos campos y llama a un
  server action que ejecuta `completarDatosContacto`.
- Componentes de formulario en PascalCase dentro de `src/modules/usuarios/ui`.

## 6. Guard de perfil incompleto

- Ampliar el guard de servidor (`src/shared/auth`) para que, tras autenticar, si el usuario es
  `COLABORADOR` | `SOLICITANTE` y le falta `cedula` o `telefono`, redirija a `/completar-perfil`
  antes de dejar entrar a rutas protegidas.
- Coordinar con `proxy.ts` (Next 16) para no crear un bucle de redirección en la propia ruta
  `/completar-perfil`.

## 7. Tests (Vitest)

- Dominio: `validarCedula` / `validarTelefono` con casos válidos e inválidos (prefijos, longitudes,
  códigos de operadora, `+58`, puntos de miles) y `normalizar*` produce el valor esperado.
- Aplicación: `registrarUsuario` exige y normaliza los datos para los dos roles, no los exige para
  `ADMIN`/`SUPERADMIN`, y rechaza cédula duplicada. `completarDatosContacto` valida y actualiza.
- Tests colocados (`*.test.ts`) junto a cada archivo. Con dobles de `UsuarioRepository`, sin base
  real.

## Decisiones

- **Formato en el dominio, no en el formulario:** una sola fuente de verdad para cédula/teléfono,
  reutilizada por UI y servidor; evita divergencia entre validación de cliente y de servidor.
- **Columnas opcionales en BD, obligatorias en el flujo:** permite una migración aditiva segura y a
  la vez fuerza los datos vía caso de uso + guard, sin romper cuentas antiguas.
- **Completar perfil al primer login en vez de backfill:** no se pueden inventar cédulas/teléfonos
  reales; el guard resuelve el caso de las cuentas previas de forma limpia.
- **Solo formato, no existencia:** validar contra un registro oficial pertenece a 013; aquí se
  garantiza forma y unicidad, no veracidad.

## Validación final

1. `docker compose up -d` (base arriba, puerto 5435 según 002).
2. `pnpm db:migrate` — migración aditiva aplicada.
3. `pnpm test` (dominio y casos de uso en verde).
4. `pnpm lint` / `pnpm build` sin errores.
5. `pnpm dev` — registrar un colaborador y un solicitante con cédula/teléfono válidos e inválidos;
   comprobar mensajes; iniciar sesión con una cuenta antigua sin datos y confirmar la redirección a
   `/completar-perfil`.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `017 · Datos de contacto obligatorios` a **Hecho ✅**.
- Revisar que el `DOC/` de la feature 002 no quede desactualizado por esta enmienda (anotar que la
  cédula y el teléfono ya son obligatorios para colaborador y solicitante).
- Verificar que `DOC/features/017-datos-de-contacto-obligatorios.md` refleja lo entregado.
