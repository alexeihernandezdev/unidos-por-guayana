# 036 · Preferencias y email de notificaciones · Tareas

## Documentación

- [x] Diseño funcional y visual aprobado.
- [x] Spec, plan, tareas y resumen de cliente creados.
- [ ] Revisión de la spec por el usuario.

## Datos y dominio

- [ ] Ampliar `TipoNotificacion` y crear `PreferenciaNotificacion`.
- [ ] Crear y aplicar migración; regenerar Prisma.
- [ ] Implementar catálogo por rol, defaults, mensajes, referencias y deduplicación.
- [ ] Crear contratos de preferencias y Email.

## Aplicación e infraestructura

- [ ] Implementar repositorio Prisma de preferencias.
- [ ] Extender el lector de contacto con nombre y email.
- [ ] Implementar el adaptador SMTP plug-and-play.
- [ ] Integrar preferencias y Email en el notificador compuesto.
- [ ] Cablear los nuevos disparadores en sus casos de uso/composition roots.
- [ ] Añadir consulta, actualización y correo de prueba a la fachada compartida.

## Interfaz

- [ ] Añadir `/ajustes` al área autenticada y a la navegación de todos los roles.
- [ ] Implementar filas de evento y canal con in-app fijo.
- [ ] Implementar guardado inmediato con feedback y reversión de errores.
- [ ] Implementar disponibilidad SMTP y botón de correo de prueba.
- [ ] Validar responsive, teclado, foco, contraste y movimiento reducido.

## Configuración y validación

- [ ] Documentar SMTP en `.env.example`.
- [ ] Cubrir reglas, casos de uso, adaptadores, navegación y UI con tests.
- [ ] Ejecutar migración local y `pnpm db:generate`.
- [ ] Ejecutar `pnpm test`.
- [ ] Ejecutar `pnpm lint`.
- [ ] Ejecutar `pnpm build`.
- [ ] Actualizar roadmap, estado de feature y documentación de cliente al cerrar.
