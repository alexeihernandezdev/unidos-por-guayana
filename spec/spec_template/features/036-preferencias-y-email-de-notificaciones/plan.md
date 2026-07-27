# 036 · Preferencias y email de notificaciones · Plan

## Enfoque

Extender el módulo `notificaciones` sin mover reglas a las features emisoras. Los casos de uso que
producen el hecho construyen un `EventoNotificacion`; el notificador compuesto decide destinatarios,
preferencias, contenido y canales.

## Datos y dominio

1. Ampliar `TipoNotificacion` en Prisma y dominio con las categorías de `spec.md`.
2. Crear `PreferenciaNotificacion` con FK en cascada a `Usuario` y `@@unique([usuarioId, tipo])`.
3. Interpretar filas ausentes mediante una función pura de valores efectivos; usar `upsert` al guardar.
4. Definir catálogo por rol, descripciones para Ajustes y claves de deduplicación por resultado.
5. Extender las referencias navegables para Actividad, Aporte, Solicitud, Recurso, Testimonio,
   Perfil/Red y bandejas de gestión.

## Aplicación e infraestructura

1. Crear casos de uso para consultar y actualizar preferencias, consultar disponibilidad y enviar el
   correo de prueba.
2. Extender el lector de contacto con `nombre` y `email` registrados.
3. Añadir `CanalEmail` y `SmtpEmailAdapter` con transporte SMTP genérico, no-op sin configuración,
   HTML/texto y errores sanitizados.
4. Refactorizar la emisión para mantener in-app obligatorio y filtrar únicamente canales externos.
5. Cablear los nuevos eventos en las operaciones existentes después de persistir con éxito.
6. Mantener todas las llamadas externas con `Promise.allSettled` y logging seguro.

## Presentación

1. Crear `/ajustes` como Server Component autenticado con metadata y datos frescos.
2. Añadir «Ajustes» con icono Lucide a «Mi cuenta» en las cinco configuraciones de navegación.
3. Implementar filas responsive de preferencias y controles cliente con guardado inmediato.
4. Implementar el panel de Email con disponibilidad, dirección registrada y prueba SMTP.
5. Reutilizar `PanelPage`, `PanelPageHeader`, tokens, movimiento y feedback existentes.

## Variables y dependencias

- Añadir un cliente SMTP mantenido y compatible con Node.js; no usarlo en Edge Runtime.
- Documentar todas las variables SMTP en `.env.example` con valores vacíos seguros.
- Leer la guía local de Next.js 16 para Server Actions, caché/revalidación y runtime antes de escribir
  las rutas.

## Validación

- Unit tests de defaults, catálogo por rol, mensajes, enlaces, dedupe y filtros de destinatarios.
- Tests de aplicación con fakes para preferencias y ambos canales.
- Tests del adaptador SMTP con transporte sustituido, sin conexiones reales.
- Tests de navegación y componentes para estados habilitado, deshabilitado, pendiente y error.
- Migración en base local, `pnpm db:generate`, `pnpm test`, `pnpm lint` y `pnpm build`.
- Revisión manual a 375 px, escritorio, teclado y movimiento reducido.
