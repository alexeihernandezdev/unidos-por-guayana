# Webhook mínimo de WhatsApp y plantilla OTP

Fecha: 29 de julio de 2026

## Objetivo

Configurar un webhook de WhatsApp Cloud API que Meta pueda verificar y al que
pueda entregar eventos, sin procesarlos ni persistirlos todavía. Preparar además
una plantilla de autenticación para enviar códigos OTP durante la demostración
del inicio de sesión.

## Alcance

### Incluido

- Un endpoint público `GET /api/webhooks/whatsapp` para la verificación inicial
  de Meta.
- Un endpoint público `POST /api/webhooks/whatsapp` para recibir notificaciones.
- Validación del token de verificación en solicitudes `GET`.
- Validación de `X-Hub-Signature-256` con el App Secret en solicitudes `POST`.
- Respuesta rápida `200` a eventos auténticos.
- Suscripción en Meta únicamente al campo `messages`.
- Una plantilla de categoría `AUTHENTICATION` con botón para copiar el código.
- Variables de entorno separadas para el webhook y la plantilla OTP.

### Fuera de alcance

- Persistir eventos, mensajes o estados de entrega.
- Procesar mensajes entrantes.
- Actualizar el estado del OTP desde eventos `sent`, `delivered`, `read` o
  `failed`.
- Reintentos, colas y trabajos en segundo plano.
- Respuestas automáticas de WhatsApp.
- Autocompletado de Android mediante botón one-tap.
- Implementar en esta etapa la generación, almacenamiento o validación del OTP y
  la creación de la sesión de usuario.

## Decisión sobre la plantilla

Se creará en WhatsApp Manager una plantilla llamada `login_otp`, de categoría
`AUTHENTICATION`, en español, con estas opciones:

- Botón `Copy code` o `Copiar código`.
- Recomendación de seguridad activada.
- Expiración de 10 minutos.
- Sin texto promocional ni cuerpo personalizado.

`login_otp` no es una plantilla que exista automáticamente. El entorno de prueba
normalmente incluye `hello_world`, pero esa plantilla no admite un código OTP.
Al crear una plantilla de autenticación, Meta proporciona y controla el texto
base; la plantilla igualmente debe quedar en estado `APPROVED` antes de enviarla.

Se elige `Copy code` en lugar de `One-tap autofill` porque el producto actual es
una aplicación web. One-tap requiere una aplicación Android, su package name y
el hash de firma.

## Alternativas consideradas

### Endpoint mínimo con validación de firma

Es la alternativa elegida. Comprueba que las solicitudes provienen de Meta, pero
no introduce almacenamiento ni lógica de negocio que la demostración todavía no
necesita.

### Endpoint que solo responde 200

Es más corto, pero deja una ruta pública capaz de aceptar solicitudes no
auténticas y oculta errores de configuración. Se descarta por seguridad.

### Persistencia completa de estados de entrega

Permitiría auditoría y métricas de entrega, pero exigiría modelo de datos,
correlación por identificador de mensaje, casos de uso y política de retención.
Se pospone hasta que exista una necesidad de producto.

## Arquitectura

La integración se expondrá mediante un Route Handler de Next.js:

`src/app/api/webhooks/whatsapp/route.ts`

El archivo será una frontera HTTP pequeña. La verificación de token y firma se
extraerá a funciones puras y testeables dentro del módulo de notificaciones, sin
acoplar la lógica a Meta ni al framework más de lo necesario.

Variables de servidor:

- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: secreto arbitrario generado para comparar el
  `hub.verify_token`. No es el access token de WhatsApp.
- `META_APP_SECRET`: App Secret de la aplicación de Meta usado para verificar
  `X-Hub-Signature-256`.
- `WHATSAPP_TEMPLATE_LOGIN_OTP`: nombre exacto de la plantilla aprobada,
  inicialmente `login_otp`.

Estas variables nunca se exponen mediante prefijos `NEXT_PUBLIC_`.

## Flujo de verificación

1. Meta solicita el callback con `hub.mode`, `hub.verify_token` y
   `hub.challenge`.
2. El endpoint acepta únicamente `hub.mode=subscribe`.
3. Compara el token recibido con `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
4. Si coincide, responde con el valor literal de `hub.challenge` y estado 200.
5. Si falta configuración o el token no coincide, responde 403 sin revelar
   secretos.

## Flujo de recepción

1. El endpoint obtiene el cuerpo como texto sin modificar.
2. Lee la cabecera `X-Hub-Signature-256`.
3. Calcula HMAC-SHA256 del cuerpo exacto utilizando `META_APP_SECRET`.
4. Compara ambas firmas en tiempo constante.
5. Si la firma no es válida, responde 401.
6. Si la firma es válida, responde 200 sin persistir ni procesar el contenido.

No se registrará el cuerpo completo, porque puede contener teléfonos u otros
datos personales.

## Configuración en Meta

Una vez desplegado el endpoint sobre HTTPS:

1. Abrir la aplicación en Meta for Developers.
2. Ir a `WhatsApp > Configuration`.
3. Editar la configuración del webhook.
4. Usar como Callback URL el origen HTTPS del despliegue de producción seguido
   por `/api/webhooks/whatsapp`.
5. Introducir exactamente el mismo valor configurado en
   `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
6. Completar la verificación.
7. Administrar los campos del webhook y suscribirse solo a `messages`.
8. Confirmar que la aplicación está suscrita al WABA de prueba.

La suscripción al WABA se realizará una sola vez; cubre los números asociados a
esa cuenta de WhatsApp Business.

## Errores y observabilidad

- Configuración ausente en la verificación: 403.
- Token de verificación incorrecto: 403.
- App Secret ausente en recepción: 503.
- Firma ausente o inválida: 401.
- Evento auténtico: 200.

Los logs pueden indicar el tipo general de error, pero no incluirán secretos,
firmas, teléfonos ni el cuerpo completo del webhook.

## Pruebas

Las pruebas cubrirán:

- Challenge correcto con modo y token válidos.
- Rechazo de modo inválido.
- Rechazo de token inválido.
- Firma HMAC válida sobre el cuerpo exacto.
- Rechazo de firma ausente, mal formada o incorrecta.
- Comparación segura cuando las firmas tienen longitudes diferentes.
- Respuesta 200 a un evento auténtico sin efectos secundarios.

Antes de implementar el Route Handler se consultará la documentación incluida en
`node_modules/next/dist/docs/` correspondiente a Next.js 16.2.10.

## Criterios de aceptación

- Meta verifica correctamente la Callback URL desplegada.
- El campo `messages` queda suscrito.
- Una solicitud POST firmada por Meta recibe 200.
- Una solicitud POST sin firma válida no es aceptada.
- El webhook no escribe en la base de datos ni procesa mensajes.
- La plantilla `login_otp` queda creada como `AUTHENTICATION` con botón para
  copiar código.
- Los secretos solo existen en variables de entorno del servidor.
- Las pruebas, lint y build quedan en verde.
