# 037 · Webhook mínimo de WhatsApp

> Estado: **Implementado; pendiente configuración externa en Meta** · Depende de:
> `012 · Notificaciones`

## Qué hace

Expone un callback HTTPS para que Meta verifique la integración de WhatsApp
Cloud API y entregue eventos del campo `messages`. En esta primera etapa el
callback acepta eventos auténticos, pero no los procesa ni persiste.

También documenta la plantilla de autenticación `login_otp` que se creará en
WhatsApp Manager con el contenido base de Meta, botón para copiar el código y
expiración de 10 minutos.

## Decisiones

- `GET /api/webhooks/whatsapp` valida `hub.mode`, `hub.verify_token` y devuelve
  literalmente `hub.challenge`.
- `POST /api/webhooks/whatsapp` valida `X-Hub-Signature-256` sobre el cuerpo
  exacto mediante HMAC-SHA256 y el App Secret.
- No se registran cuerpos, firmas, teléfonos ni secretos.
- No hay tablas, colas, reintentos ni procesamiento de mensajes.
- El endpoint usa el runtime Node.js explícitamente.
- La plantilla OTP usa `Copy code`; `One-tap autofill` queda fuera porque la
  aplicación es web.

## Variables de entorno

- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `META_APP_SECRET`
- `WHATSAPP_TEMPLATE_LOGIN_OTP`

Todas son exclusivas del servidor.

## Fuera de alcance

- Generación y validación del OTP.
- Inicio de sesión mediante OTP.
- Persistencia de estados `sent`, `delivered`, `read` o `failed`.
- Mensajes entrantes y respuestas automáticas.
- Creación automática de plantillas mediante Graph API.

## Criterios de aceptación

- [ ] Meta puede verificar la Callback URL desplegada.
- [ ] Un challenge válido responde 200 con el valor literal recibido.
- [ ] Un modo o token incorrecto responde 403.
- [ ] Un POST con firma válida responde 200 sin efectos secundarios.
- [ ] Una firma ausente, mal formada o incorrecta responde 401.
- [ ] La ausencia de `META_APP_SECRET` responde 503.
- [ ] Las comparaciones sensibles se realizan en tiempo constante.
- [ ] `.env.example` documenta las tres variables nuevas.
- [ ] Las pruebas, lint y build quedan en verde.
