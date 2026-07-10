# Panel de usuario y redirección tras login

## Qué cambió

Cuando una persona inicia sesión, ya no vuelve a la página de bienvenida. La plataforma la lleva directamente a su espacio de trabajo según su rol:

- **Colaborador** → actividades abiertas para aportar
- **Solicitante** → sus solicitudes de ayuda
- **Administrador** → panel de gestión (o pantalla de cuenta pendiente si aún no fue aprobado)
- **Superadministrador** → bandeja de aprobación de administradores

## Cómo se ve

En lugar del menú superior de la landing, cada usuario ve un **menú lateral** con las secciones de su rol y un botón **Atrás** arriba del contenido para volver a la pantalla anterior o al inicio de su panel.

La landing (`/`) sigue siendo pública para visitantes sin sesión.
