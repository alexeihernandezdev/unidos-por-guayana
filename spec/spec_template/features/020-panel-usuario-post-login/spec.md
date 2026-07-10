# 020 · Panel de usuario y redirección post-login

> Estado: **Hecho ✅** · Depende de: `002 · Autenticación y roles`, `003 · Landing`, `008 · Panel de administración` · Roadmap: `constitution/roadmap.md`

## Qué hace

Tras iniciar sesión, cada usuario llega a **su panel de funcionalidades** (no se queda en la landing con el navbar público). Todos los roles con área operativa ven un **sidebar** con navegación por rol y un botón **Atrás** en la zona de contenido.

Destinos por rol:

| Rol | Panel principal |
|-----|-----------------|
| `COLABORADOR` | `/ayudas` |
| `SOLICITANTE` | `/solicitudes` |
| `ADMIN` verificado | `/panel` |
| `ADMIN` pendiente/rechazado | `/cuenta-admin` |
| `SUPERADMIN` | `/superadmin/admins` |

## Criterios de aceptación

- [x] Login redirige al panel del rol (no a `/`).
- [x] Usuario autenticado que visita `/` se redirige a su panel.
- [x] Rutas de funcionalidades usan sidebar (sin `SiteHeader` global).
- [x] Botón «Atrás» en panel de usuario y panel admin.
- [x] Completar perfil redirige al panel del rol al terminar.
