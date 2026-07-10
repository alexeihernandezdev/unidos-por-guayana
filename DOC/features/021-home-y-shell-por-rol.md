# Feature 021 · Home y shell de navegación por rol

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/spec_template/features/021-home-y-shell-por-rol/`._

---

## En una frase

Al iniciar sesión, cada persona entra a **su panel de trabajo** (con menú lateral) en lugar de quedarse en la página de bienvenida; desde ahí puede **volver al sitio público** cuando quiera.

## Qué aporta

Hoy, después del login, el usuario sigue viendo la landing con el menú de arriba. Solo el administrador tiene un panel con barra lateral. Con esta etapa:

- **Entrada directa a las funciones de cada rol** (administrador, colaborador, solicitante o superadministrador).
- **Menú lateral (sidebar)** en las pantallas de trabajo, igual de claro para todos los roles.
- Un botón **«Volver al sitio»** para regresar a la página de bienvenida sin cerrar la sesión.
- La landing sigue disponible para quien no ha iniciado sesión (y para quien vuelve desde el panel).

## Por qué importa

En una situación de crisis la gente necesita **saber qué puede hacer enseguida** (aportar, pedir ayuda, gestionar envíos, aprobar cuentas). Quedarse en la página de presentación después del login confunde y oculta las herramientas. Un panel por rol con navegación lateral reduce fricción y deja la landing como lo que es: la puerta de entrada pública.

## Qué queda fuera (por ahora)

- No se inventan funciones nuevas de negocio (aportes, solicitudes, envíos siguen igual); solo cambia **adónde llegas** y **cómo navegas**.
- No se rediseña por completo la landing ni el tablero del administrador.
- No se obliga a salir de la landing si alguien autenticado quiere leerla: el cambio fuerte es el destino del login y el menú de trabajo.
