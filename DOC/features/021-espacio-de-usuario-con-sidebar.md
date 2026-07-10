# Feature 021 · Espacio del usuario logeado (sidebar) y navbar solo público

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/021-espacio-de-usuario-con-sidebar/`._

---

## En una frase

Que **cualquier persona que inicie sesión** entre a su propio espacio de trabajo con un **menú lateral** (como el del Administrador), y que la barra de navegación pública **desaparezca** mientras se está dentro de la cuenta.

## Qué aporta

Hoy el Administrador ya tiene un espacio ordenado con un menú lateral (sidebar), pero el **colaborador** y el **solicitante** siguen navegando con la misma barra superior que ve un visitante. Eso mezcla "estar de visita" con "estar trabajando". Esta feature unifica la experiencia:

- **Un espacio propio al iniciar sesión** — al entrar, cada usuario aterriza directamente en su zona de trabajo (el colaborador en sus actividades, el solicitante en sus solicitudes), no en la página de bienvenida.
- **Menú lateral para todos los roles** — el mismo estilo del panel del Administrador, con los accesos que le tocan a cada quien:
  - **Colaborador:** Actividades, Mis aportes, Mi perfil.
  - **Solicitante:** Mis solicitudes, Nueva solicitud, Proponer recurso, Mi perfil.
  - **Administrador** y **Superadministrador** conservan sus accesos, ahora también con menú lateral.
- **Adiós a la barra pública cuando estás dentro** — mientras hay sesión iniciada, la barra de navegación de visitante desaparece en toda la app. La navegación se hace por el menú lateral.
- **Nada cambia de lugar** — las pantallas de siempre (actividades, aportes, solicitudes, perfil) siguen funcionando igual y con las mismas direcciones; solo cambia el marco que las envuelve.

## Por qué importa

Separa con claridad dos momentos: **descubrir** el proyecto (páginas públicas, con barra superior) y **operar** dentro de la cuenta (con menú lateral). Esa separación hace que la herramienta se sienta más como un panel de trabajo y menos como un sitio web, que es justo lo que necesita quien coordina o participa en las ayudas. Además, reaprovecha el diseño ya hecho para el Administrador, así que todos los roles comparten el mismo lenguaje visual sin construir dos sistemas distintos.

## Qué queda fuera (por ahora)

- **Sin pantallas de resumen nuevas** para colaborador y solicitante — se les da el menú lateral y sus pantallas actuales, no un tablero de métricas propio como el del Administrador (eso sería una etapa aparte).
- **Sin cambios en lo que cada rol puede hacer** — los permisos y las reglas de negocio no cambian; solo cambia cómo se navega.
- **Sin personalización del menú** — mismas secciones para todos los del mismo rol; nada de reordenar o esconder ítems.
- **El panel del Administrador se ve igual** — se reutiliza su diseño por dentro, pero su aspecto no cambia.

## Nota de decisión

Al quitar la barra pública mientras hay sesión, un usuario logeado que abra la página de bienvenida o el tablero público de transparencia se quedaría sin una forma visible de volver a su cuenta. Para evitarlo, esas páginas mostrarán un enlace discreto **"Ir a mi panel"** cuando haya sesión. Si se prefiere, la alternativa es **llevar automáticamente** al usuario logeado a su panel al entrar a la página de bienvenida; queda a confirmación del cliente.

## Resultado para el cliente

Al terminar, **cualquier persona que inicie sesión** —colaborador, solicitante, administrador o superadministrador— entra a un espacio de trabajo consistente, con su menú lateral y sin la barra de visitante. La experiencia deja de depender del rol para sentirse coherente, y el proyecto se percibe como una herramienta de coordinación, no como una web informativa a la que además hay que iniciar sesión.
