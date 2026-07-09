# Feature 008 · Panel de administración

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/008-panel-administracion/` (se creará al iniciar la feature)._

---

## En una frase

El **espacio de trabajo del administrador**, donde se ve todo lo que está pasando con los envíos y se decide qué sale primero y con qué recursos.

## Qué aporta

Un tablero privado, accesible solo para el rol **Administrador**, que reúne en una sola pantalla la información necesaria para operar el día a día del proyecto:

- **Estado de cada envío** — cuáles están recolectando, cuáles listos para salir, cuáles en tránsito y cuáles ya entregados.
- **Progreso de las metas** — para cada envío, cuánto se ha recolectado de cada recurso y cuánto falta.
- **Solicitudes abiertas** — las peticiones de ayuda que aún no se han cubierto, priorizadas por urgencia y sector.
- **Aportes recientes** — quién aportó qué y a qué envío, para dar seguimiento y confirmar recepciones.
- **Acciones rápidas** — crear un nuevo envío, ajustar sus metas, marcar aportes como recibidos y decidir cuándo cambia de estado un envío (por ejemplo, de "recolectando" a "listo").

## Por qué importa

Sin este panel, la persona que administra tendría que buscar la información en pedazos sueltos (listas, mensajes, hojas de cálculo…). Aquí **la información se centraliza y se muestra en el lenguaje del proyecto**: envíos, metas, aportes, solicitudes. Eso ahorra tiempo en momentos donde la urgencia manda y ayuda a **tomar mejores decisiones** sobre qué envío priorizar.

También es la contraparte operativa del tablero público de transparencia: el administrador trabaja aquí, y el público ve los resultados allá.

## Qué queda fuera (por ahora)

- **No es un CRM ni un sistema contable** — no lleva finanzas, facturas ni relaciones detalladas con proveedores.
- **No incluye chat ni mensajería interna** entre administrador y colaboradores; la comunicación ocurre por canales externos.
- **No exporta informes personalizados** (PDF, Excel con filtros a medida): muestra vistas útiles pero no un generador de reportes.
- **No sustituye la validación humana** — decisiones sensibles (aceptar un aporte, cerrar un envío) siguen siendo del administrador; el panel las facilita, no las automatiza.

## Resultado para el cliente

Al terminar, **el administrador tiene un centro de mando claro**: entra al panel, entiende en segundos qué envíos van bien, dónde hay retraso, qué sector está pidiendo ayuda y qué acción toca. La operación deja de depender de conversaciones dispersas y pasa a apoyarse en una única fuente de verdad dentro de la plataforma.
