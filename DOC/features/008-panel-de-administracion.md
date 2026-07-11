# Feature 008 · Panel de administración

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/008-panel-de-administracion/`._

---

## En una frase

Dar al **Administrador** un tablero único desde el que ve **de un vistazo** el estado de los envíos, las peticiones abiertas y los aportes por confirmar, para decidir con criterio **qué envío sale primero**.

## Qué aporta

Hasta ahora, para saber cómo va la operación había que abrir cada módulo por separado (envíos, aportes, solicitudes, catálogo) y componerlo mentalmente. Este panel comprime esa lectura en una sola pantalla.

- **Métricas clave en tarjetas** — cuántos envíos hay en cada etapa (recolectando, listo, en tránsito), cuántas solicitudes están abiertas por nivel de urgencia, cuántos aportes esperan confirmación. Desde la feature 022, los números de envíos, prioridad y aportes pendientes cuentan **solo las actividades del administrador en sesión** (no las de toda la red).
- **"Qué envío sale primero"** — lista de los envíos aún en preparación, ordenada por **porcentaje completado** (los más cerca de salir, arriba), y con un indicador de cuántas solicitudes de ese sector están abiertas. Es información para decidir, no una decisión automática.
- **Sectores más demandados ahora** — los cinco sectores que aparecen más en las solicitudes abiertas, para que el Administrador sepa dónde se concentra la necesidad.
- **Accesos directos** — botones para crear un nuevo envío, un nuevo recurso o ver las solicitudes sin dar vueltas por el menú.
- **Solo lectura, todo se hace en cada módulo** — el panel no cambia nada por sí solo: cada botón lleva al lugar correcto (por ejemplo, "Aportes pendientes" abre la lista de aportes por confirmar, donde el Administrador los marca como recibidos).

## Por qué importa

Es la pieza que convierte a "un montón de módulos" en una **herramienta de trabajo diaria**. El Administrador entra una vez, entiende el estado global en segundos y decide qué atender primero. Además, en momentos de crisis con muchos envíos simultáneos, tener un lugar donde priorizar por urgencia y completitud es lo que evita que las cosas urgentes se pierdan de vista.

## Qué queda fuera (por ahora)

- **Nada de personalización** — el panel es opinado: mismas tarjetas y bloques para todo Administrador. No hay widgets movibles.
- **Sin gráficas complejas** — números grandes, listas ordenadas y barras de progreso. Nada de dashboards con librerías pesadas.
- **Sin tiempo real** — al recargar la página se actualiza. No hay notificaciones push ni auto-refresh; la lectura es sencilla y suficiente para el MVP.
- **Sin historial ni series temporales** — el panel muestra el estado actual; el rastro de cada envío llegará en la etapa de seguimiento.
- **Sin exportar a CSV/PDF** — por ahora, es una vista para leer, no para reportar.
- **Solo para el Administrador** — el tablero público con la información abierta al público es una etapa siguiente.

## Resultado para el cliente

Al terminar, el Administrador **abre un solo tablero y sabe qué hacer**: cuáles son los envíos por salir, dónde está la urgencia real, qué aportes tiene que confirmar y qué sectores están pidiendo más ayuda. Es la herramienta que hace del proyecto una operación gobernable, no una colección de pantallas sueltas.
