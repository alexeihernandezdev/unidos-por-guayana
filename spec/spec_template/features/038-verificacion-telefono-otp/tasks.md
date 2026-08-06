# Tareas · 038 Verificación de teléfono mediante OTP

## Datos y dominio

- [x] Añadir migración Prisma y regenerar el cliente.
- [x] Crear tipos, reglas y persistencia de verificación.
- [x] Implementar generación y HMAC del OTP.

## Aplicación e infraestructura

- [x] Implementar iniciar, reenviar, confirmar y cancelar.
- [x] Implementar persistencia Prisma con transacciones.
- [x] Implementar `WhatsAppOtpAdapter`.
- [x] Cablear el composition root.

## Integración

- [x] Integrar registro de todos los destinos con teléfono.
- [x] Integrar cambios de teléfono conservando el valor anterior.
- [x] Añadir guard global y excepciones seguras.

## Presentación

- [x] Crear `/verificar-telefono`.
- [x] Añadir estados verificado/pendiente a los perfiles.
- [x] Cubrir accesibilidad, móvil y reducción de movimiento.

## Validación

- [x] Pruebas unitarias de OTP, adaptador y regresión de usuarios/webhook.
- [ ] Suite global: conserva 13 fallos preexistentes en fixtures de solicitudes.
- [x] Lint.
- [x] Build.
- [x] Actualizar roadmap y documentación de cliente.
