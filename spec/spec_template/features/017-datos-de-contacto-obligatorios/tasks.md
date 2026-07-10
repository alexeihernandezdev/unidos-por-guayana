# 017 · Datos de contacto obligatorios — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. Esta feature **enmienda 002** y reutiliza el módulo
> `src/modules/usuarios`.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, **proxy**
      —antes middleware—, authentication) para el guard y la pantalla de completar perfil.
- [x] Confirmar que no hacen falta dependencias nuevas (`zod` y React Hook Form ya vienen de 002).
      Si se necesitara algo, **avisar** antes de instalar.
- [x] Levantar la base: `docker compose up -d` (publicada en el puerto **5435**, ver 002).

## 1. Reglas de dominio (`src/modules/usuarios/domain`)

- [x] `validarCedula(entrada)`: prefijo `V` | `E` | `J` + número de 6-9 dígitos; errores en español.
- [x] `normalizarCedula(entrada)`: prefijo en mayúscula + dígitos sin puntos (`V12345678`).
- [x] `validarTelefono(entrada)`: normaliza a `0XXXXXXXXXX` (11 dígitos, `+58` → `0`) y valida
      longitud y código de operadora.
- [x] `normalizarTelefono(entrada)`: solo dígitos, formato nacional.
- [x] `validarUbicacion({ estado, parroquia })`: trim y no vacío para ambos; errores en español.
- [x] `normalizarUbicacion({ estado, parroquia })`: trim + colapso de espacios.
- [x] Constantes de dominio `PREFIJOS_CEDULA` y `CODIGOS_OPERADORA_VENEZUELA`.
- [x] Sin Prisma ni framework (lo verifica ESLint).

## 2. Modelo de datos y migración

- [x] Añadir a `model Usuario`: `cedula String? @unique`, `telefono String?`,
      `telefonoEsWhatsApp Boolean @default(false)`, `estado String?`, `parroquia String?`.
- [x] Añadir a `model PerfilAdmin` (enmienda 016): `telefonoEsWhatsApp Boolean @default(false)`.
- [x] `pnpm db:migrate` — una migración **aditiva** con todo lo anterior (no rompe filas
      existentes; sin `NOT NULL`).

## 3. Aplicación (`src/modules/usuarios/application`)

- [x] Enmendar `registrarUsuario`: exige y valida los cinco campos para `COLABORADOR` |
      `SOLICITANTE`, normaliza antes de crear y **rechaza cédula duplicada**.
- [x] `registrarUsuario` acepta `telefonoEsWhatsApp` para `ADMIN` (lo persiste en `PerfilAdmin`) y
      **no** exige el resto de campos para `ADMIN` / `SUPERADMIN`.
- [x] Nuevo caso de uso `actualizarDatosContacto(usuarioId, input)`: valida, normaliza y actualiza
      los cinco campos; unicidad de cédula excluye al propio usuario.
- [x] Enmendar `gestionarPerfilAdmin` (016) para persistir `telefonoEsWhatsApp`.
- [x] Capa pura (solo depende de `domain`) — lo verifica ESLint.

## 4. Infraestructura

- [x] Ampliar `PrismaUsuarioRepository`: `buscarPorCedula(cedula, excluirId?)` y
      `actualizarDatosContacto(id, datos)`.
- [x] Ampliar el repositorio de `PerfilAdmin` para incluir `telefonoEsWhatsApp` en create/update.
- [x] Sin cambios en `src/lib/auth.ts` (el `rol` sigue en la sesión JWT de 002).

## 5. Presentación

- [x] Componente reutilizable `DatosContactoFields` en `src/modules/usuarios/ui` con los cinco
      campos y sus mensajes (React Hook Form + resolver del dominio).
- [x] Formulario de **registro**: usar `DatosContactoFields` visible para `COLABORADOR` |
      `SOLICITANTE`; añadir checkbox `telefonoEsWhatsApp` dentro del bloque `PerfilAdmin` para
      `ADMIN`.
- [x] Pantalla **`/completar-perfil`**: formulario → server action `actualizarDatosContacto`.
- [x] Pantalla **`/mi-perfil`** (solo `COLABORADOR` / `SOLICITANTE`): precarga los datos del usuario
      en sesión y permite editarlos con el mismo formulario y server action.
- [x] Enlazar `/mi-perfil` desde el menú de usuario del layout.

## 6. Guard de perfil incompleto

- [x] Ampliar el guard de servidor (`src/shared/auth`): si `COLABORADOR` | `SOLICITANTE` sin
      `cedula`, `telefono`, `estado` o `parroquia`, redirigir a `/completar-perfil`.
- [x] Coordinar con `proxy.ts` para evitar bucle de redirección en `/completar-perfil` y para
      que `/mi-perfil` solo sea accesible con el perfil ya completo.

## 7. Tests (Vitest)

- [x] Dominio: `validarCedula` / `validarTelefono` / `validarUbicacion` (válidos e inválidos:
      prefijos, longitudes, operadora, `+58`, puntos de miles, estado/parroquia vacíos) y
      `normalizar*`.
- [x] Aplicación: `registrarUsuario` exige/normaliza los cinco campos para los dos roles, acepta
      `telefonoEsWhatsApp` para `ADMIN`, no exige nada para `SUPERADMIN`, rechaza duplicado;
      `actualizarDatosContacto` valida, actualiza y respeta exclusión propia en la unicidad.
- [x] Tests colocados junto a cada archivo; en verde.

## 8. Validación final

- [x] `docker compose up -d` y base `healthy` (5435).
- [x] `pnpm db:migrate` aplicada.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: registrar colaborador y solicitante (cédula/teléfono/estado/parroquia válidos e
      inválidos, con y sin WhatsApp flag), verificar `/mi-perfil` (editar y guardar), y comprobar
      la redirección a `/completar-perfil` con una cuenta antigua sin datos.
- [x] Registrar un `ADMIN` con el checkbox WhatsApp marcado y confirmar que `PerfilAdmin` lo
      persiste.

## 9. Cierre

- [x] `usuarios/domain` y `usuarios/application` puras (sin framework/Prisma/Auth.js) — ESLint OK.
- [x] Verificar que `DOC/features/017-datos-de-contacto-obligatorios.md` refleja lo entregado.
- [x] Revisar que los `DOC/` de las features 002 y 016 no queden desactualizados por esta enmienda
      (2: contacto obligatorio; 16: flag WhatsApp en `PerfilAdmin`).
- [x] Mover `017 · Datos de contacto obligatorios` a **Hecho ✅** en `constitution/roadmap.md`.
