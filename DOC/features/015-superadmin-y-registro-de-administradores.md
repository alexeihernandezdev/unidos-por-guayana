# Feature 015 · Rol Superadministrador y registro público de administradores

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/015-superadmin-y-registro-de-administradores/`._

---

## En una frase

Abrir el registro de **administradores a cualquiera**, pero con una figura de confianza, el **Superadministrador**, que aprueba (o rechaza) cada cuenta antes de que pueda operar.

## Qué aporta

Hasta ahora el administrador era una cuenta cerrada que se creaba a mano. El cliente pidió abrir esa puerta para que la red de centros de acopio pueda crecer, sin perder el control de quién entra. Esta etapa lo resuelve con dos piezas:

- **Superadministrador**: una nueva figura, la autoridad máxima del sistema. No gestiona envíos ni el día a día: su único trabajo es revisar las solicitudes de administrador y **aprobarlas o rechazarlas**. Esta cuenta no se registra desde la app: se crea de forma controlada y es la raíz de confianza de toda la red.
- **Registro público de administrador**: ahora **cualquier persona u organización** puede postularse como administrador. Al hacerlo, su cuenta queda **pendiente de aprobación**: existe, pero todavía no puede crear ni gestionar nada.
- **Bandeja de aprobación**: el superadministrador ve un listado de las cuentas de administrador pendientes y, con un clic, las **aprueba** (quedan habilitadas para operar) o las **rechaza** (siguen sin poder operar).

Mientras una cuenta de administrador está pendiente o ha sido rechazada, la plataforma le impide crear envíos, gestionar recursos o cualquier otra acción de gestión. Solo cuando el superadministrador la aprueba, esa cuenta empieza a funcionar con normalidad.

## Por qué importa

Es lo que permite que la red **crezca con confianza**. Abrir el registro de administradores atrae a más centros de acopio y organizaciones, pero sin un filtro sería fácil que entrara cualquiera a gestionar ayuda real. El superadministrador es ese filtro: da un visto bueno explícito antes de que una cuenta pueda mover recursos. Así se equilibra apertura y control, que es justo lo que necesita una plataforma de ayuda humanitaria.

## Qué queda fuera (por ahora)

- Los **datos ampliados del administrador como centro de acopio** (nombre de la cuenta, estado, parroquia, teléfono, correo y documento de identidad) llegan en la etapa siguiente. Aquí el administrador se registra con lo básico y queda a la espera de aprobación.
- La **verificación de colaboradores y solicitantes** (por ejemplo, quien aporta camiones o pide ayuda) la hace el administrador y se aborda en otra etapa; esta feature solo cubre la aprobación de administradores por el superadministrador.
- Avisar por correo al administrador de que su cuenta fue aprobada o rechazada se podrá añadir cuando llegue la etapa de notificaciones.
- Recuperación de contraseña, confirmación por correo o ingreso con redes sociales siguen fuera de alcance.

## Resultado para el cliente

Al terminar, **la plataforma acepta administradores de forma abierta pero segura**: cualquiera puede postularse, cada cuenta queda a la espera hasta que el superadministrador la aprueba, y solo entonces puede gestionar ayuda. Queda además preparado el terreno para el paso siguiente, en el que cada administrador aporta sus datos completos como centro de acopio.
