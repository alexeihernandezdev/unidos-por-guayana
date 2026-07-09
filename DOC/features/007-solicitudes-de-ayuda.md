# Feature 007 · Solicitudes de ayuda

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/007-solicitudes-de-ayuda/`._

---

## En una frase

Dar voz al **terreno**: permitir que quienes están cerca de una zona afectada pidan ayuda concreta (qué necesitan, dónde y con qué urgencia), para que el equipo gestor decida los envíos con información real.

## Qué aporta

Esta etapa incorpora al **Solicitante** como parte activa de la plataforma.

- **El Solicitante crea una petición** indicando el **sector** (barrio, zona, comunidad), la **urgencia** (baja, media o alta), una **descripción** de la situación y **qué recursos** necesita (agua, medicinas, alimentos, transporte, personal…). Puede incluir una cantidad estimada si la conoce, o dejarla en blanco si no.
- **Cada solicitante ve sus propias peticiones** y su estado en cualquier momento.
- **El Administrador ve todas las solicitudes** en un listado con filtros por sector, urgencia y estado. Es su radar para decidir qué envío crear a continuación.
- **Ciclo de vida claro** — una solicitud nace **abierta** y puede terminar como **atendida** (el equipo gestor la está cubriendo con algún envío) o **cerrada** (ya no aplica: duplicada, resuelta por otra vía, o retirada por el propio solicitante).
- **El Solicitante puede editar o cancelar mientras esté abierta.** Una vez atendida o cerrada, queda fija (así el historial no se altera).

## Por qué importa

Sin este canal, el Administrador decide qué enviar a ciegas o por WhatsApp y llamadas sueltas. Con las solicitudes registradas dentro de la plataforma, cada envío tiene una **razón trazable**: se puede ver de dónde vino la necesidad y responder con criterio. Además, prepara el terreno para que el panel del Administrador (etapa siguiente) muestre las peticiones abiertas junto al progreso de los envíos.

## Qué queda fuera (por ahora)

- **No hay asignación automática** de solicitud a envío. El Administrador decide con su criterio; la plataforma solo le da la información ordenada.
- **No se pueden reabrir** solicitudes ya cerradas o atendidas. Si la necesidad persiste, se crea una nueva.
- **No hay mapas ni coordenadas GPS.** El sector es un texto libre (por ejemplo "Petare Sur"); una taxonomía formal de zonas llegaría cuando se conozcan mejor los patrones de uso.
- **No se adjuntan fotos ni documentos** aún.
- **No hay verificación** del solicitante todavía (llegará como módulo de apoyo); por ahora basta con estar registrado con ese rol.
- **Notificaciones** al solicitante cuando cambia el estado vienen en una etapa posterior.

## Resultado para el cliente

Al terminar, la plataforma **conecta la necesidad con la respuesta**: los solicitantes pueden pedir ayuda de forma estructurada, y el Administrador dispone de un tablero con todas las peticiones abiertas ordenadas por urgencia y sector. Es el insumo directo para decidir qué envío sale primero.
