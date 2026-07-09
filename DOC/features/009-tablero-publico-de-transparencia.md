# Feature 009 · Tablero público de transparencia

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/009-tablero-publico-de-transparencia/`._

---

## En una frase

Abrir al público, **sin necesidad de iniciar sesión**, una pantalla que muestra **qué se recolectó**, **cómo va cada envío** y **a dónde fue cada ayuda**, para que cualquiera pueda ver y confiar en lo que hace el proyecto.

## Qué aporta

La transparencia es uno de los principios centrales de "Unidos por Guayana": cualquiera debería poder ver qué se recolectó, cuánto falta y a dónde fue cada ayuda. Hasta ahora esa información vivía dentro del panel privado del Administrador. Esta pantalla la saca a la luz.

- **Totales de impacto** — de un vistazo: cuántos envíos hay, cuántos ya se entregaron y cuánto se ha recolectado en total. Es la foto grande del esfuerzo.
- **Qué se ha recolectado, por recurso** — cuánta agua, cuántas cajas de alimentos, cuántos vehículos, cuántas personas voluntarias, etc., sumando lo que ya se confirmó como recibido.
- **Cada envío y su progreso** — la lista de envíos con su destino, su fecha, en qué etapa está y una barra que muestra qué porcentaje de sus metas ya se cumplió. Los que ya llegaron aparecen marcados como "entregado".
- **El detalle de cada envío** — al abrir un envío se ve, recurso por recurso, cuánto se necesitaba y cuánto se ha reunido.
- **Abierto a todos** — no hace falta cuenta ni contraseña. Es una página pública, pensada para donantes, comunidad, prensa o autoridades que quieran comprobar por sí mismos cómo va todo.

## Por qué importa

Es la pieza que convierte la transparencia de una promesa a algo **comprobable**. Un donante que puede ver que lo recolectado efectivamente llega a destino tiene una razón concreta para aportar; la comunidad puede auditar sin pedir permiso; y el proyecto gana credibilidad al rendir cuentas de forma abierta. En un contexto de crisis, esa confianza pública es tan importante como la logística misma.

## Qué queda fuera (por ahora)

- **Ningún dato personal** — la pantalla nunca muestra quién aportó ni quién solicitó ayuda: solo cantidades y estados. La privacidad de las personas se cuida de forma estricta.
- **No se puede hacer nada desde aquí** — es solo para ver. Aportar, crear envíos o gestionar solicitudes se sigue haciendo en las pantallas correspondientes, con cuenta iniciada.
- **Sin la línea de tiempo de cada envío** — por ahora se muestra la etapa actual de cada envío; el historial paso a paso con evidencia de entrega llega en una etapa posterior (seguimiento).
- **Sin las solicitudes de ayuda** — el tablero rinde cuentas de lo recolectado y entregado; no expone quién pidió qué.
- **Sin gráficas complejas ni descargas** — números grandes, listas y barras de progreso. Nada de exportar a Excel/PDF por ahora.
- **Sin tiempo real** — la información se actualiza al recargar; no hay avisos automáticos.

## Resultado para el cliente

Al terminar, el proyecto tiene una **cara pública que rinde cuentas**: cualquier persona entra a la pantalla de transparencia, sin registrarse, y comprueba en segundos qué se ha recolectado, cómo avanza cada envío y a dónde llegó cada ayuda. Es la prueba visible de que lo donado se usa bien, y una herramienta para atraer más apoyo con confianza.
