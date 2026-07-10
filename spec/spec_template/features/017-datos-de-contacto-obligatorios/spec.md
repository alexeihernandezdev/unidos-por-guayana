# 017 · Datos de contacto obligatorios (colaborador y solicitante)

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles` · Enmienda: `002` · Roadmap: `constitution/roadmap.md`

## Qué hace

Hace **obligatorios** los datos de contacto `cedula` y `telefono` en el registro de los usuarios
`COLABORADOR` y `SOLICITANTE`. Hoy el registro (feature 002) solo pide correo, contraseña, nombre
y rol; esta feature añade dos campos que la plataforma necesita para poder contactar y luego
verificar a quien aporta ayuda o pide ayuda:

- **Cédula obligatoria** — documento de identidad venezolano con su prefijo (`V`, `E` o `J`) y su
  número. Se valida el formato en el formulario y en el servidor.
- **Teléfono obligatorio** — número de contacto venezolano, validado en formato y longitud.
- **Enmienda al registro (002)** — el formulario y el caso de uso `registrarUsuario` pasan a exigir
  ambos campos para `COLABORADOR` y `SOLICITANTE`. El `ADMIN` y el `SUPERADMIN` quedan fuera.
- **Usuarios existentes sin estos datos** — se define una estrategia de "completar perfil
  obligatorio al primer inicio de sesión" para las cuentas ya creadas antes de esta feature.

## Por qué

`mission.md` dice que "el colaborador y el solicitante deben completar sus datos de contacto
(cédula y teléfono) para operar", y describe a estos usuarios como personas que "deben registrar
cédula y teléfono". `tech-stack.md` lo recoge en el modelo `Usuario`: "para `COLABORADOR` y
`SOLICITANTE` el registro exige `cedula` y `telefono` obligatorios; su verificación la gestiona el
`ADMIN`". Sin estos datos, el módulo de **verificación de usuarios** (feature 013) no tiene contra
qué validar a quien aporta camiones o pide ayuda, y el `ADMIN` no puede contactar a nadie. Esta
feature es el prerrequisito de datos para esa confianza.

## Decisiones tomadas

- **Alcance por rol:** la obligatoriedad aplica **solo** a `COLABORADOR` y `SOLICITANTE`. El
  `ADMIN` tiene sus datos ampliados en la feature 016 (`PerfilAdmin`) y el `SUPERADMIN` se siembra
  (no se registra por la app); ninguno de los dos pasa por esta validación.
- **Validación en el límite:** el formulario usa **React Hook Form** y la validación de **formato**
  vive en el **dominio** (funciones puras `validarCedula` / `validarTelefono`), reutilizadas tanto
  por el formulario (resolver) como por el servidor. La regla de dominio no depende del framework.
- **Cédula:** se guarda **normalizada** como `PREFIJO` (`V` | `E` | `J`) + `numero` (solo dígitos,
  sin puntos ni separadores). El prefijo `J` corresponde a personas jurídicas; para el registro de
  personas naturales se aceptan `V` y `E`, y se admite `J` para dejar la puerta abierta a
  organizaciones que colaboran o solicitan (ver "Notas y riesgos").
- **Teléfono:** se guarda normalizado a **solo dígitos** en formato nacional de 11 dígitos
  (`0XXXXXXXXXX`); se aceptan separadores y prefijo `+58` en la entrada y se normalizan al guardar.
- **Unicidad de cédula:** la `cedula` normalizada es **única** por usuario (no puede haber dos
  cuentas con la misma cédula), igual que el correo.
- **Usuarios existentes (backfill):** no se hace backfill de datos inventados. Las cuentas
  `COLABORADOR` / `SOLICITANTE` creadas antes de esta feature quedan con `cedula` / `telefono`
  vacíos y, al **primer inicio de sesión**, un guard las redirige a una pantalla de
  **"completar perfil"** obligatoria antes de poder operar. La columna se añade como **opcional en
  la base** (para no romper la migración) pero **obligatoria en el flujo** para los dos roles.

## Alcance

**Incluye**

- Ampliar el modelo `Usuario` en Prisma con `cedula` (única, opcional en BD) y `telefono`
  (opcional en BD); **migración** que añade ambas columnas sin romper los datos existentes.
- Reglas de dominio puras en `src/modules/usuarios/domain`:
  - `validarCedula(entrada)` — formato de cédula venezolana (prefijo + número).
  - `validarTelefono(entrada)` — formato de teléfono venezolano.
  - Funciones de **normalización** (`normalizarCedula`, `normalizarTelefono`) que producen el valor
    a guardar.
- Enmendar el caso de uso `registrarUsuario` para **exigir y validar** `cedula` y `telefono`
  cuando el rol es `COLABORADOR` o `SOLICITANTE` (validado en servidor, no solo en el formulario),
  incluida la comprobación de **cédula no duplicada**.
- Enmendar el **formulario de registro** (`src/modules/usuarios/ui`) para pedir los dos campos con
  React Hook Form, con mensajes de error en español.
- Flujo de **completar perfil** para usuarios existentes: pantalla `/completar-perfil`, caso de uso
  `completarDatosContacto`, y un **guard** que redirige allí a los `COLABORADOR` / `SOLICITANTE`
  sin `cedula` o `telefono` antes de dejarles usar rutas protegidas.
- Tests (Vitest) de las reglas de dominio (cédulas y teléfonos válidos e inválidos) y del caso de
  uso (registro exige y normaliza los datos; rechaza cédula duplicada).

**No incluye**

- **Verificación de usuarios** (que el `ADMIN` valide al colaborador/solicitante): es la feature
  `013`. Aquí solo se **capturan y validan de formato** los datos, no se aprueban.
- Datos ampliados del `ADMIN` (`PerfilAdmin`, centro de acopio): es la feature `016`.
- Validación contra un registro externo (CNE/SAIME) o verificación de que la cédula sea real: solo
  se valida el **formato**, no la existencia del documento.
- Recuperación/edición general del perfil más allá de completar los dos campos obligatorios.

## Reglas de validación (dominio)

> Mensajes en **español**, medibles y reutilizables por formulario y servidor. Todos los ejemplos
> de fecha, si aplicaran, en formato `DD/MM/AAAA`.

### Cédula

- **Formato de entrada aceptado:** un prefijo `V`, `E` o `J` (mayúscula o minúscula, con o sin
  guion/espacio) seguido del número; el número admite puntos de miles en la entrada (`V-12.345.678`).
- **Normalización:** prefijo en mayúscula + dígitos sin puntos ni separadores (`V12345678`).
- **Reglas:**
  - El prefijo debe ser uno de `V` | `E` | `J`. Si falta o es otro → error.
  - El número debe tener entre **6 y 9 dígitos** tras normalizar.
  - No se permiten letras ni símbolos dentro del número.
- **Mensajes:**
  - Vacío: `"La cédula es obligatoria."`
  - Prefijo inválido: `"La cédula debe empezar por V, E o J."`
  - Número inválido: `"La cédula debe tener entre 6 y 9 dígitos."`
  - Duplicada (servidor): `"Ya existe una cuenta con esta cédula."`

### Teléfono

- **Formato de entrada aceptado:** dígitos con separadores opcionales (espacios, guiones,
  paréntesis) y prefijo internacional opcional `+58`; p. ej. `0412-1234567`, `+58 412 1234567`,
  `04121234567`.
- **Normalización:** solo dígitos, en formato nacional `0XXXXXXXXXX` (11 dígitos). Un `+58` inicial
  se convierte a `0`.
- **Reglas:**
  - Tras normalizar debe tener **exactamente 11 dígitos** y empezar por `0`.
  - El código de operadora (dígitos 2-3) debe ser uno de los válidos en Venezuela: móviles
    `0412`, `0414`, `0416`, `0424`, `0426`; se aceptan también fijos con código de área (p. ej.
    `0212`, `0286`…). La lista concreta de códigos válidos se define como constante de dominio.
- **Mensajes:**
  - Vacío: `"El teléfono es obligatorio."`
  - Longitud inválida: `"El teléfono debe tener 11 dígitos (por ejemplo 0412 1234567)."`
  - Código de operadora inválido: `"El código de operadora no es válido en Venezuela."`

## Criterios de aceptación

- [ ] Al **registrarse** como `COLABORADOR` o `SOLICITANTE`, el formulario **exige** cédula y
      teléfono; sin ellos no deja continuar y muestra los mensajes en español definidos arriba.
- [ ] El servidor **rechaza** un registro de `COLABORADOR` / `SOLICITANTE` sin cédula o sin
      teléfono, o con formato inválido, aunque el formulario se saltara (validado en `registrarUsuario`).
- [ ] La cédula y el teléfono se guardan **normalizados** (cédula `V12345678`, teléfono
      `04121234567`), no en el formato crudo tecleado.
- [ ] El registro **rechaza una cédula duplicada** con `"Ya existe una cuenta con esta cédula."`.
- [ ] La validación de **formato** vive en el dominio (`validarCedula` / `validarTelefono`) y la
      usan tanto el formulario como el servidor (una sola fuente de verdad).
- [ ] Un usuario `COLABORADOR` / `SOLICITANTE` **creado antes** de esta feature (sin cédula ni
      teléfono) es **redirigido a `/completar-perfil`** al iniciar sesión y no puede usar rutas
      protegidas hasta completarlos.
- [ ] El registro de `ADMIN` (feature 016) y el `SUPERADMIN` **no** pasan por esta validación.
- [ ] La **migración** añade `cedula` y `telefono` sin romper los datos existentes.
- [ ] `pnpm test` cubre reglas de dominio (cédulas/teléfonos válidos e inválidos, normalización) y
      el caso de uso (exige datos, normaliza, rechaza duplicado) — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `usuarios/domain` y `usuarios/application` siguen
      **puras** (sin framework, Prisma ni Auth.js).

## Notas y riesgos

- **Enmienda a 002:** esta feature modifica el modelo `Usuario`, el caso de uso `registrarUsuario`
  y el formulario de registro ya entregados en 002. Al cerrarla, revisar que el `DOC/` de 002 no
  quede desactualizado (o anotar la enmienda).
- **Backfill vs. completar perfil:** se elige "completar perfil al primer login" en vez de backfill
  con datos inventados, porque no se pueden fabricar cédulas ni teléfonos reales. La columna nace
  **opcional en la base** (migración segura) pero **obligatoria en el flujo** para los dos roles; si
  en el futuro no quedan usuarios sin datos, se puede endurecer a `NOT NULL` en una migración
  posterior.
- **Personas jurídicas (`J`):** se admite el prefijo `J` por si una organización colabora o
  solicita; si el cliente prefiere restringir el registro a personas naturales (`V` / `E`),
  quitar `J` de la lista de prefijos válidos es un cambio de una línea en el dominio.
- **Validación solo de formato:** no se comprueba que la cédula exista en un registro oficial;
  eso pertenece a la verificación real (feature 013) y/o a un servicio externo que hoy no existe.
- **Dependencias:** no se prevén dependencias nuevas; `zod` (ya instalado en 002) puede usarse como
  resolver del formulario, delegando el formato en las funciones de dominio. Si se añadiera algo,
  avisar (límite duro de la constitución).
- **Pureza de capas:** las reglas de cédula/teléfono son **dominio puro**; Prisma y el formulario
  son adaptadores que las consumen. ESLint hace cumplir la dirección de dependencias.
