# Plan · 038 Verificación de teléfono mediante OTP

1. Añadir el estado de verificación a `Usuario` y `PerfilAdmin`, más el modelo
   temporal `VerificacionTelefono`.
2. Implementar dominio, repositorio y casos de uso para iniciar, reenviar,
   confirmar y cancelar.
3. Crear el puerto `CanalOtpTelefono` y el adaptador de WhatsApp Cloud API.
4. Cablear la feature en un composition root de servidor.
5. Integrar registro y edición sin sustituir prematuramente teléfonos verificados.
6. Añadir el guard de teléfono antes de los guards de perfil y rol.
7. Crear `/verificar-telefono` y los estados de perfil siguiendo la guía visual.
8. Cubrir dominio, aplicación, infraestructura y presentación con pruebas.
9. Ejecutar Prisma generate, tests, lint y build.

## Diseño técnico

La lógica vive en `src/modules/usuarios`. El código OTP se genera mediante
`node:crypto` y se persiste como HMAC con `PHONE_OTP_SECRET`. El adaptador de Meta
lee configuración en cada envío y usa `WHATSAPP_TEMPLATE_LOGIN_OTP`.

La verificación consulta estado fresco de base. Auth.js continúa con
`Credentials` y JWT; el OTP no se incorpora al token.

El diseño completo está en
`docs/superpowers/specs/2026-07-29-verificacion-telefono-otp-design.md`.

