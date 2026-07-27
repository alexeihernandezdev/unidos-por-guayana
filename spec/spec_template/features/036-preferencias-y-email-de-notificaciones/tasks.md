# 036 · Preferencias y email de notificaciones · Tareas

## Documentación

- [x] Diseño funcional y visual aprobado.
- [x] Spec, plan, tareas y resumen de cliente creados.
- [x] Revisión de la spec por el usuario.

## Datos y dominio

- [x] Ampliar `TipoNotificacion` y crear `PreferenciaNotificacion`.
- [x] Crear migración y regenerar Prisma (aplicación en el entorno queda como paso de despliegue).
- [x] Implementar catálogo por rol, defaults, mensajes, referencias y deduplicación.
- [x] Crear contratos de preferencias y Email.

## Aplicación e infraestructura

- [x] Implementar repositorio Prisma de preferencias.
- [x] Extender el lector de contacto con nombre y email.
- [x] Implementar el adaptador SMTP plug-and-play.
- [x] Integrar preferencias y Email en el notificador compuesto.
- [x] Cablear los nuevos disparadores en sus casos de uso/composition roots.
- [x] Añadir consulta, actualización y correo de prueba a la fachada compartida.

## Interfaz

- [x] Añadir `/ajustes` al área autenticada y a la navegación de todos los roles.
- [x] Implementar filas de evento y canal con in-app fijo.
- [x] Implementar guardado inmediato con feedback y reversión de errores.
- [x] Implementar disponibilidad SMTP y botón de correo de prueba.
- [x] Aplicar objetivos táctiles, foco, contraste, layout responsive y movimiento reducido.

## Configuración y validación

- [x] Documentar SMTP en `.env.example`.
- [x] Cubrir reglas, casos de uso, adaptadores y navegación con tests.
- [x] Ejecutar `pnpm db:generate` y `prisma validate`.
- [ ] Ejecutar la suite completa: 493/506 pasan; 13 fixtures previos de ubicación en solicitudes requieren actualización.
- [x] Ejecutar `pnpm lint` (sin errores; conserva una advertencia previa de React Hook Form).
- [x] Ejecutar `pnpm build`.
- [x] Actualizar roadmap, estado de feature y documentación de cliente al cerrar.
