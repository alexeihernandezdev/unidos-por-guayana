# 017 · Datos de contacto obligatorios — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. Esta feature **enmienda 002** y reutiliza el módulo
> `src/modules/usuarios`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, **proxy**
      —antes middleware—, authentication) para el guard y la pantalla de completar perfil.
- [ ] Confirmar que no hacen falta dependencias nuevas (`zod` y React Hook Form ya vienen de 002).
      Si se necesitara algo, **avisar** antes de instalar.
- [ ] Levantar la base: `docker compose up -d` (publicada en el puerto **5435**, ver 002).

## 1. Reglas de dominio (`src/modules/usuarios/domain`)

- [ ] `validarCedula(entrada)`: prefijo `V` | `E` | `J` + número de 6-9 dígitos; errores en español.
- [ ] `normalizarCedula(entrada)`: prefijo en mayúscula + dígitos sin puntos (`V12345678`).
- [ ] `validarTelefono(entrada)`: normaliza a `0XXXXXXXXXX` (11 dígitos, `+58` → `0`) y valida
      longitud y código de operadora.
- [ ] `normalizarTelefono(entrada)`: solo dígitos, formato nacional.
- [ ] Constantes de dominio `PREFIJOS_CEDULA` y `CODIGOS_OPERADORA_VENEZUELA`.
- [ ] Sin Prisma ni framework (lo verifica ESLint).

## 2. Modelo de datos y migración

- [ ] Añadir a `model Usuario`: `cedula String? @unique` y `telefono String?`.
- [ ] `pnpm db:migrate` — migración **aditiva** (no rompe filas existentes; sin `NOT NULL`).

## 3. Aplicación (`src/modules/usuarios/application`)

- [ ] Enmendar `registrarUsuario`: exige y valida `cedula`/`telefono` para `COLABORADOR` |
      `SOLICITANTE`, normaliza antes de crear y **rechaza cédula duplicada**.
- [ ] `registrarUsuario` **no** exige estos campos para `ADMIN` / `SUPERADMIN`.
- [ ] Caso de uso `completarDatosContacto(usuarioId, input)`: valida, normaliza y actualiza.
- [ ] Capa pura (solo depende de `domain`) — lo verifica ESLint.

## 4. Infraestructura

- [ ] Ampliar `PrismaUsuarioRepository`: buscar por cédula y actualizar datos de contacto.
- [ ] Sin cambios en `src/lib/auth.ts` (el `rol` sigue en la sesión JWT de 002).

## 5. Presentación

- [ ] Formulario de **registro**: añadir campos `cedula` y `telefono` (React Hook Form) con resolver
      que delega el formato en el dominio; mensajes en español; visibles para `COLABORADOR` |
      `SOLICITANTE`.
- [ ] Pantalla **`/completar-perfil`** con formulario → server action `completarDatosContacto`.
- [ ] Componentes de formulario en `src/modules/usuarios/ui` (PascalCase).

## 6. Guard de perfil incompleto

- [ ] Ampliar el guard de servidor (`src/shared/auth`): si `COLABORADOR` | `SOLICITANTE` sin
      `cedula` o `telefono`, redirigir a `/completar-perfil`.
- [ ] Coordinar con `proxy.ts` para evitar bucle de redirección en `/completar-perfil`.

## 7. Tests (Vitest)

- [ ] Dominio: `validarCedula` / `validarTelefono` (válidos e inválidos: prefijos, longitudes,
      operadora, `+58`, puntos de miles) y `normalizar*`.
- [ ] Aplicación: `registrarUsuario` exige/normaliza para los dos roles, no exige para
      `ADMIN`/`SUPERADMIN`, rechaza duplicado; `completarDatosContacto` valida y actualiza.
- [ ] Tests colocados junto a cada archivo; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy` (5435).
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: registrar colaborador y solicitante (cédula/teléfono válidos e inválidos) y
      comprobar la redirección a `/completar-perfil` con una cuenta antigua sin datos.

## 9. Cierre

- [ ] `usuarios/domain` y `usuarios/application` puras (sin framework/Prisma/Auth.js) — ESLint OK.
- [ ] Verificar que `DOC/features/017-datos-de-contacto-obligatorios.md` refleja lo entregado.
- [ ] Revisar que el `DOC/` de la feature 002 no quede desactualizado por esta enmienda.
- [ ] Mover `017 · Datos de contacto obligatorios` a **Hecho ✅** en `constitution/roadmap.md`.
