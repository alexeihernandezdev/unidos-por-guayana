# Verificación de teléfono mediante OTP por WhatsApp

Fecha: 29 de julio de 2026

## Objetivo

Comprobar que un usuario tiene acceso al número de teléfono que registra o
solicita cambiar. El sistema enviará un código OTP por WhatsApp y limitará el
acceso a las áreas privadas mientras exista un teléfono pendiente de
verificación.

El OTP verifica exclusivamente el teléfono. El inicio de sesión continúa usando
email y contraseña.

## Alcance

La verificación aplica a cualquier rol cuando registra un teléfono nuevo o
solicita cambiar uno existente. Un mismo número puede estar verificado en varias
cuentas: el código demuestra acceso, no propiedad exclusiva.

Las cuentas existentes con teléfono se considerarán verificadas durante la
migración. A partir del despliegue, cualquier número nuevo o modificado requerirá
OTP.

El canal inicial y obligatorio es WhatsApp. No se aceptarán números declarados
sin WhatsApp y no se implementará un fallback por SMS en esta etapa.

## Arquitectura

La lógica pertenece al módulo `usuarios`, porque verifica un dato de identidad y
contacto. WhatsApp es una dependencia de infraestructura detrás de un puerto.

### Componentes

- `VerificacionTelefono`: solicitud temporal asociada al usuario.
- `CanalOtpTelefono`: puerto de aplicación para enviar códigos.
- `WhatsAppOtpAdapter`: implementación con WhatsApp Cloud API y la plantilla
  configurada en `WHATSAPP_TEMPLATE_LOGIN_OTP`.
- Casos de uso independientes para iniciar, reenviar, confirmar y cancelar.
- Repositorio de verificaciones con implementación Prisma.
- Guard global que dirige a `/verificar-telefono`.
- Pantalla de verificación y estados pendientes en los perfiles.

### Destinos

Una solicitud indica qué dato se confirmará:

- `USUARIO`: teléfono de contacto almacenado en `Usuario`.
- `PERFIL_ADMIN`: teléfono público del centro almacenado en `PerfilAdmin`.

El diseño permite añadir otros destinos sin duplicar las reglas del OTP.

## Modelo de datos

Cada ubicación que contiene un teléfono tendrá `telefonoVerificadoEn`. Para las
cuentas existentes, la migración establecerá esa fecha cuando ya exista un
teléfono.

`VerificacionTelefono` contiene:

- `id`
- `usuarioId`
- `destino`
- `telefonoPendiente` normalizado a E.164
- `codigoHash`
- `expiraEn`
- `intentosFallidos`
- `envios`
- `ultimoEnvioEn`
- `consumidoEn`
- `createdAt`
- `updatedAt`

Solo puede existir una solicitud vigente por usuario y destino. Una solicitud
nueva invalida la anterior. Las solicitudes consumidas se conservan únicamente
durante 30 días para diagnóstico de límites y después pueden eliminarse; no
contienen el código en texto.

En una cuenta nueva, el teléfono inicialmente guardado se marca como no
verificado. En un cambio, el teléfono verificado anterior permanece activo y el
nuevo vive como `telefonoPendiente` hasta confirmar el código.

## Seguridad

- OTP numérico de seis dígitos generado con un generador criptográfico.
- Vigencia de diez minutos.
- El código se persiste como HMAC con un secreto exclusivo del servidor.
- Máximo cinco intentos incorrectos por código.
- Reenvío habilitado después de sesenta segundos.
- Máximo cinco envíos por hora para la combinación de usuario y teléfono.
- Cada reenvío invalida el código anterior.
- Solicitar otro cambio invalida la solicitud pendiente previa.
- El código, el teléfono completo, las firmas y los payloads de Meta no se
  escriben en logs.
- Las respuestas no revelan si el teléfono aparece en otras cuentas.
- Confirmar y sustituir el teléfono se realiza en una transacción.

El secreto del HMAC será independiente de `META_APP_SECRET` y de los tokens de
WhatsApp.

## Flujo de registro

1. El límite HTTP valida y normaliza el teléfono como E.164.
2. Se crea la cuenta con el teléfono sin verificar.
3. Se crea la solicitud y el código OTP.
4. El adaptador intenta enviar la plantilla de autenticación por WhatsApp.
5. El registro conserva la cuenta aunque el proveedor falle.
6. En el primer inicio de sesión, el guard dirige a `/verificar-telefono`.
7. Una confirmación correcta marca `telefonoVerificadoEn`, consume la solicitud
   y permite continuar al espacio privado.

## Flujo de cambio

1. El usuario introduce un teléfono nuevo desde su perfil.
2. El sistema conserva el teléfono verificado anterior.
3. El nuevo teléfono se registra como pendiente y se envía el OTP.
4. Mientras la solicitud esté activa, el guard permite únicamente el flujo de
   verificación, cerrar sesión y los endpoints técnicos necesarios.
5. Confirmar reemplaza el teléfono anterior y registra la fecha de verificación.
6. Cancelar descarta el teléfono pendiente, conserva el anterior y desbloquea la
   cuenta.

## Orden del guard

El orden de evaluación será:

1. Sin sesión: `/login`.
2. Teléfono pendiente o teléfono requerido sin verificar:
   `/verificar-telefono`.
3. Perfil de contacto incompleto: `/completar-perfil`.
4. Autorización y destino por rol.

Durante el bloqueo siguen disponibles:

- `/verificar-telefono`
- iniciar, confirmar, reenviar y cancelar la verificación
- cerrar sesión
- handlers internos de Auth.js
- webhook de WhatsApp

El guard no confía en el JWT para este estado; consulta el dato vigente en base.

## Integración con WhatsApp

`WhatsAppOtpAdapter` reutiliza las credenciales de WhatsApp Cloud API, pero no el
adaptador de notificaciones de negocio. Utiliza la plantilla de categoría
`AUTHENTICATION` configurada mediante `WHATSAPP_TEMPLATE_LOGIN_OTP`.

La disponibilidad del webhook no condiciona la confirmación del OTP: el sistema
valida el código introducido por el usuario. El webhook continúa respondiendo con
rapidez y sin persistir eventos de entrega en esta etapa.

Si faltan credenciales o Meta rechaza el envío, el caso de uso devuelve un estado
operativo explícito. La interfaz permite reintentar y nunca indica que el mensaje
fue enviado cuando no se confirmó la solicitud a Meta.

## Interfaz

### Intención

La persona acaba de registrarse o cambiar su teléfono y probablemente está
alternando entre el navegador y WhatsApp desde un móvil. Debe confirmar seis
dígitos con rapidez, entender qué número se está comprobando y recuperar el
flujo si el mensaje no llega. La experiencia debe transmitir confianza
comunitaria, no severidad bancaria.

### Dirección

La interfaz reutiliza el petróleo/teal, off-white, grafito y colores semánticos
existentes. No introduce nuevos acentos. Geist Sans presenta instrucciones;
Geist Mono presenta código, contador y fragmentos telefónicos.

La firma visual será una cadena de contacto de tres pasos:

`Tu número → WhatsApp → Número confirmado`

El paso actual siempre se comunica con texto, icono y color. Se aplicará en la
pantalla principal, el estado pendiente del perfil, el reenvío, la confirmación y
el estado verificado.

Se evitan tres defaults:

- Una tarjeta blanca genérica se sustituye por un flujo de onboarding coherente
  con `AuthShell`.
- Seis inputs independientes se sustituyen por un único control accesible que se
  presenta como una banda conectada de seis posiciones y acepta pegado completo.
- Una celebración invasiva se sustituye por confirmación tranquila y retorno al
  destino original.

### Vistas

- `/verificar-telefono`: vista autenticada mínima fuera del sidebar. Presenta el
  teléfono enmascarado, la cadena de contacto, el control OTP, expiración y
  reenvío.
- Registro: explica que el número debe recibir WhatsApp y que será confirmado al
  iniciar sesión.
- Mi perfil y perfil de administrador: muestran el número actual como
  `Verificado`; durante un cambio muestran el nuevo como `Pendiente`, con acciones
  para verificar o cancelar.
- Confirmación: retorna a la pantalla desde la que comenzó el proceso.

Cerrar sesión siempre permanece disponible. Cancelar está disponible cuando
existe un teléfono anterior verificado; una cuenta nueva sin teléfono verificado
debe completar el proceso.

La profundidad se expresa mediante cambios suaves de superficie y bordes
discretos, siguiendo los tokens existentes. Todos los estados incluyen foco,
pendiente, error, deshabilitado y `prefers-reduced-motion`.

## Estados y errores

La interfaz distingue:

- Código incorrecto con intentos restantes.
- Código vencido con acción para generar otro.
- Límite de intentos alcanzado.
- Reenvío todavía no disponible con contador.
- Límite horario alcanzado con el próximo momento permitido.
- Fallo temporal de WhatsApp sin perder la solicitud.
- Solicitud consumida, cancelada o reemplazada.
- Sesión expirada, con retorno seguro al login.

Los mensajes son accionables y no exponen detalles internos del proveedor.

## Pruebas

### Dominio y aplicación

- Normalización y rechazo de teléfonos que no puedan expresarse en E.164.
- Generación de códigos dentro del rango de seis dígitos, incluyendo ceros
  iniciales.
- Confirmación correcta, incorrecta, vencida, agotada y ya consumida.
- Invalidación del código anterior al reenviar.
- Ventana de sesenta segundos y límite de cinco envíos por hora.
- Cancelación con y sin teléfono previamente verificado.
- Sustitución atómica del teléfono según el destino.
- Ausencia de unicidad global del número.

### Infraestructura

- Persistencia e índices de la solicitud.
- Migración de teléfonos existentes como verificados.
- Payload correcto para la plantilla de autenticación de Meta.
- Credenciales ausentes, error HTTP y respuesta exitosa del proveedor.
- El código en texto no se persiste ni se incluye en errores.

### Presentación

- Redirección global antes de los guards de perfil y rol.
- Introducción y pegado del código desde teclado móvil.
- Reenvío, contador, intentos restantes y estados de error.
- Cancelación que conserva el teléfono anterior.
- Accesibilidad por teclado, anuncios `aria-live`, contraste y reducción de
  movimiento.

### Regresión

- Login por email y contraseña sigue funcionando.
- Aprobación manual de administradores y `estadoVerificacion` conservan su
  significado actual.
- Notificaciones de negocio continúan usando su adaptador de WhatsApp existente.
- El webhook conserva sus respuestas y validación de firma.

## Fuera de alcance

- Login sin contraseña mediante OTP.
- Segundo factor en cada inicio de sesión.
- Envío por SMS, email o llamada.
- Unicidad global del teléfono.
- Procesamiento de estados `sent`, `delivered`, `read` o `failed`.
- Recuperación de cuenta basada exclusivamente en el teléfono.
- One-tap autofill específico de Android.

## Criterios de aceptación

- Toda cuenta nueva con teléfono queda limitada hasta verificarlo.
- Un cambio no sustituye el teléfono vigente antes de confirmar el OTP.
- Las cuentas existentes conservan sus teléfonos como verificados.
- El código expira, limita intentos y respeta los límites de reenvío.
- El mismo número puede verificarse en más de una cuenta.
- Ningún código en texto se guarda o registra.
- La interfaz cubre éxito, error, expiración, reenvío y cancelación.
- Login, autorización por rol, notificaciones y webhook no sufren regresiones.
