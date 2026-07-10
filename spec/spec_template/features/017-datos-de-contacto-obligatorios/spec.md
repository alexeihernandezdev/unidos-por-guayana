# 017 · Datos de contacto obligatorios (colaborador y solicitante)

> Estado: **Pendiente** · Depende de: `002 · Autenticación y roles` · Enmienda: `002`, `016` · Roadmap: `constitution/roadmap.md`

## Qué hace

Hace **obligatorios** los datos de contacto y ubicación en el registro de los usuarios
`COLABORADOR` y `SOLICITANTE`. Hoy el registro (feature 002) solo pide correo, contraseña, nombre
y rol; esta feature añade los datos que la plataforma necesita para contactar, ubicar y luego
verificar a quien aporta ayuda o pide ayuda:

- **Cédula obligatoria** — documento de identidad venezolano con su prefijo (`V`, `E` o `J`) y su
  número. Se valida el formato en el formulario y en el servidor.
- **Teléfono obligatorio** — número de contacto venezolano, validado en formato y longitud.
- **Flag `telefonoEsWhatsApp`** — el usuario indica si su teléfono es contactable por WhatsApp.
  Aplica también a `ADMIN` (se añade a `PerfilAdmin` de la feature 016) para simetría de contacto.
- **Ubicación obligatoria (`estado` + `parroquia`)** — el `COLABORADOR` y el `SOLICITANTE` indican
  dónde están, con el mismo modelo (texto libre) que usa `PerfilAdmin` en 016. Habilita filtrado
  geográfico en 008/009 y decisiones logísticas del `ADMIN`.
- **Enmienda al registro (002)** — el formulario y el caso de uso `registrarUsuario` pasan a exigir
  los cinco campos (`cedula`, `telefono`, `telefonoEsWhatsApp`, `estado`, `parroquia`) para
  `COLABORADOR` y `SOLICITANTE`. El `SUPERADMIN` queda fuera; el `ADMIN` conserva su flujo de 016 y
  solo suma el flag WhatsApp.
- **Usuarios existentes sin estos datos** — estrategia de "completar perfil obligatorio al primer
  inicio de sesión" para las cuentas ya creadas antes de esta feature.
- **Edición desde `/mi-perfil`** — el `COLABORADOR` y el `SOLICITANTE` pueden actualizar sus datos
  de contacto y ubicación en cualquier momento (no solo la primera vez).

## Por qué

`mission.md` dice que "el colaborador y el solicitante deben completar sus datos de contacto
(cédula y teléfono) para operar", y describe a estos usuarios como personas que "deben registrar
cédula y teléfono". `tech-stack.md` lo recoge en el modelo `Usuario`: "para `COLABORADOR` y
`SOLICITANTE` el registro exige `cedula` y `telefono` obligatorios; su verificación la gestiona el
`ADMIN`". Sin estos datos, el módulo de **verificación de usuarios** (feature 013) no tiene contra
qué validar a quien aporta camiones o pide ayuda, y el `ADMIN` no puede contactar a nadie. Esta
feature es el prerrequisito de datos para esa confianza.

## Decisiones tomadas

- **Alcance por rol:** la obligatoriedad de `cedula`, `telefono`, `estado` y `parroquia` aplica
  **solo** a `COLABORADOR` y `SOLICITANTE`. El `ADMIN` ya cubre estos datos en `PerfilAdmin` (016);
  aquí solo suma `telefonoEsWhatsApp` a ese perfil. El `SUPERADMIN` se siembra (no se registra por
  la app) y no pasa por esta validación.
- **Ubicación como texto libre:** `estado` y `parroquia` se guardan como `string` no acotado, igual
  que `PerfilAdmin` (016), para no arrastrar mantenimiento de un catálogo de estados/parroquias VE
  antes de tenerlo definido. La validación es solo "no vacío". Si en el futuro se añade un catálogo,
  se migra desde el mismo campo sin re-modelar.
- **Datos en `Usuario`, no en tabla aparte:** los 5 campos del colaborador/solicitante viven
  directamente en `usuarios` (no se crea un `PerfilColaborador`/`PerfilSolicitante`) porque son
  pocos y no tienen relación 1:N. Contrasta con `PerfilAdmin` (016), que sí es tabla aparte por su
  relación con `PuntoAcopio`.
- **Flag WhatsApp en ambos lados:** `telefonoEsWhatsApp: boolean` se añade a `Usuario` (para
  colaborador/solicitante) y a `PerfilAdmin` (enmienda 016). En BD nace con default `false`, en el
  formulario se muestra como casilla marcable. Enmienda 016 por simetría de contacto.
- **Edición vía `/mi-perfil`, no solo "completar":** el flujo `/completar-perfil` sigue existiendo
  como puerta obligatoria para cuentas incompletas, pero se separa una pantalla persistente
  `/mi-perfil` (COLABORADOR/SOLICITANTE) que permite editar los datos en cualquier momento. Ambas
  usan el mismo caso de uso `actualizarDatosContacto`.
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

- Ampliar el modelo `Usuario` en Prisma con `cedula String? @unique`, `telefono String?`,
  `telefonoEsWhatsApp Boolean @default(false)`, `estado String?` y `parroquia String?`; **migración
  aditiva** que no rompe los datos existentes.
- Ampliar `PerfilAdmin` (enmienda 016) con `telefonoEsWhatsApp Boolean @default(false)`, en la
  misma migración.
- Reglas de dominio puras en `src/modules/usuarios/domain`:
  - `validarCedula(entrada)` — formato de cédula venezolana (prefijo + número).
  - `validarTelefono(entrada)` — formato de teléfono venezolano.
  - `validarUbicacion(entrada)` — `estado` y `parroquia` no vacíos tras trim.
  - Funciones de **normalización** (`normalizarCedula`, `normalizarTelefono`, `normalizarUbicacion`)
    que producen el valor a guardar (trim + colapso de espacios en ubicación).
- Enmendar el caso de uso `registrarUsuario` para **exigir y validar** los cinco campos
  (`cedula`, `telefono`, `telefonoEsWhatsApp`, `estado`, `parroquia`) cuando el rol es
  `COLABORADOR` o `SOLICITANTE` (validado en servidor, no solo en el formulario), incluida la
  comprobación de **cédula no duplicada**. Para `ADMIN`, sumar `telefonoEsWhatsApp` en el flujo de
  registro público (feature 016).
- Enmendar el **formulario de registro** (`src/modules/usuarios/ui`) para pedir los campos con
  React Hook Form; mensajes de error en español. La ramificación por rol de 016 se conserva.
- Nuevo caso de uso `actualizarDatosContacto(usuarioId, input)` que sustituye a
  `completarDatosContacto`: valida, normaliza, comprueba unicidad de cédula (excluyéndose a sí
  mismo) y actualiza los cinco campos del `Usuario`. Sirve tanto para el flujo "completar" como
  para "editar".
- Flujo de **completar perfil** para usuarios existentes: pantalla `/completar-perfil` y un
  **guard** que redirige allí a los `COLABORADOR` / `SOLICITANTE` sin datos completos antes de
  dejarles usar rutas protegidas.
- Pantalla **`/mi-perfil`** (COLABORADOR/SOLICITANTE): formulario de edición que carga los datos
  actuales del usuario en sesión y permite actualizarlos; usa el mismo caso de uso
  `actualizarDatosContacto`. Enlazada desde el menú de usuario.
- Tests (Vitest) de las reglas de dominio y del caso de uso (registro/edición exigen y normalizan;
  rechazan cédula duplicada; el `ADMIN` guarda el flag WhatsApp; los cinco campos aplican solo a
  los dos roles objetivo).

**No incluye**

- **Verificación de usuarios** (que el `ADMIN` valide al colaborador/solicitante): es la feature
  `013`. Aquí solo se **capturan y validan de formato** los datos, no se aprueban.
- Catálogo cerrado de estados/parroquias venezolanas: por ahora texto libre (igual que 016).
- Datos ampliados del `ADMIN` más allá del flag WhatsApp añadido a `PerfilAdmin`.
- Validación contra un registro externo (CNE/SAIME) o verificación de que la cédula sea real: solo
  se valida el **formato**, no la existencia del documento.
- Cambio de email o de contraseña desde `/mi-perfil`: fuera de alcance.

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

### WhatsApp

- **Tipo:** booleano; en el formulario, casilla marcable ("Este número recibe WhatsApp").
- **Default:** `false`. No hay validación adicional; solo se muestra el flag al `ADMIN` para saber
  el canal de contacto.

### Ubicación (`estado` + `parroquia`)

- **Formato de entrada:** texto libre (igual que `PerfilAdmin` de 016).
- **Normalización:** trim + colapsar espacios múltiples.
- **Reglas:** tras normalizar, ambos deben tener **al menos 1 carácter**.
- **Mensajes:**
  - `estado` vacío: `"Indica el estado."`
  - `parroquia` vacía: `"Indica la parroquia."`

## Criterios de aceptación

- [ ] Al **registrarse** como `COLABORADOR` o `SOLICITANTE`, el formulario **exige** cédula,
      teléfono, estado y parroquia; sin ellos no deja continuar y muestra los mensajes en español
      definidos arriba.
- [ ] El formulario de registro expone el checkbox `telefonoEsWhatsApp` para los tres roles con
      teléfono (`COLABORADOR`, `SOLICITANTE`, `ADMIN`); default marcado según decisión de UI, se
      guarda tal cual.
- [ ] El servidor **rechaza** un registro de `COLABORADOR` / `SOLICITANTE` con cualquiera de los
      cinco campos faltante o con formato inválido, aunque el formulario se saltara (validado en
      `registrarUsuario`).
- [ ] Cédula y teléfono se guardan **normalizados** (`V12345678`, `04121234567`); estado y
      parroquia se guardan sin espacios sobrantes.
- [ ] El registro **rechaza una cédula duplicada** con `"Ya existe una cuenta con esta cédula."`.
- [ ] La validación de **formato** vive en el dominio (`validarCedula` / `validarTelefono` /
      `validarUbicacion`) y la usan tanto el formulario como el servidor (una sola fuente de
      verdad).
- [ ] Un usuario `COLABORADOR` / `SOLICITANTE` **creado antes** de esta feature (sin datos
      completos) es **redirigido a `/completar-perfil`** al iniciar sesión y no puede usar rutas
      protegidas hasta completarlos.
- [ ] Un `COLABORADOR` o `SOLICITANTE` autenticado puede **entrar en `/mi-perfil`**, ver sus datos
      actuales precargados y **guardar cambios**; los cambios pasan por `actualizarDatosContacto`
      (validación completa; rechaza cédula que ya use otro usuario, permite conservar la propia).
- [ ] El registro público de `ADMIN` (feature 016) **añade** el checkbox `telefonoEsWhatsApp` y lo
      guarda en `PerfilAdmin`. El `SUPERADMIN` no pasa por ninguna de estas validaciones.
- [ ] La **migración** añade `cedula`, `telefono`, `telefonoEsWhatsApp`, `estado` y `parroquia` a
      `usuarios` y `telefonoEsWhatsApp` a `perfiles_admin` sin romper los datos existentes.
- [ ] `pnpm test` cubre reglas de dominio, `registrarUsuario` y `actualizarDatosContacto` — en
      verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `usuarios/domain` y `usuarios/application` siguen
      **puras** (sin framework, Prisma ni Auth.js).

## Notas y riesgos

- **Enmienda a 002 y 016:** esta feature modifica el modelo `Usuario`, el caso de uso
  `registrarUsuario` y el formulario de registro entregados en 002; y añade `telefonoEsWhatsApp` a
  `PerfilAdmin` de 016 (con su UI de registro/edición de perfil admin). Al cerrarla, revisar que
  los `DOC/` de 002 y 016 no queden desactualizados.
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
