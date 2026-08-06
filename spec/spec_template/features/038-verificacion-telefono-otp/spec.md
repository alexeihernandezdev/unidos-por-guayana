# 038 · Verificación de teléfono mediante OTP

> Estado: **Implementado; pendiente migración y configuración externa** ·
> Depende de: `002`, `016`, `017`, `037`

## Qué hace

Verifica por WhatsApp que cada usuario tiene acceso al teléfono que registra o
solicita cambiar. El login continúa usando email y contraseña.

## Decisiones

- Aplica a cualquier rol que registre o cambie un teléfono.
- El teléfono debe disponer de WhatsApp; no hay fallback por SMS.
- Las cuentas existentes se migran como verificadas.
- Un teléfono puede pertenecer a varias cuentas.
- En cambios se conserva el número anterior hasta confirmar el nuevo.
- Una cuenta con teléfono pendiente no accede al espacio privado.
- OTP numérico de 6 dígitos, vigencia de 10 minutos y máximo 5 intentos.
- Reenvío tras 60 segundos y máximo 5 envíos por hora.
- El código se guarda como HMAC, nunca en texto.

## Criterios de aceptación

- [ ] Una cuenta nueva queda limitada hasta verificar el teléfono.
- [ ] Un teléfono modificado no sustituye al anterior antes de confirmar.
- [ ] El OTP se envía con la plantilla `WHATSAPP_TEMPLATE_LOGIN_OTP`.
- [ ] Confirmar el OTP actualiza el destino y consume la solicitud.
- [ ] Cancelar un cambio conserva el teléfono anterior.
- [ ] Los límites de expiración, intentos y reenvío se aplican en servidor.
- [ ] Las cuentas existentes conservan sus teléfonos como verificados.
- [ ] La ruta `/verificar-telefono` cubre éxito, error, expiración y reenvío.
- [ ] Login, guards, notificaciones y webhook no sufren regresiones.

## Fuera de alcance

- Login mediante OTP o segundo factor.
- SMS, email, llamada o recuperación de cuenta.
- Unicidad global del teléfono.
- Estados de entrega del webhook.
- One-tap autofill de Android.
