# Feature 005 · Ayudas / Envío

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/005-ayudas-envio/`._

---

## En una frase

Permitir al equipo gestor **crear los envíos de ayuda** y definir **cuánto se necesita de cada cosa**, con un ciclo de vida claro desde que se recolecta hasta que se entrega.

## Qué aporta

Esta etapa introduce el **corazón de la plataforma**: la **Ayuda** (un envío concreto hacia un sector).

- **El Administrador crea envíos** — indica el **destino**, la **fecha de salida** y **qué se necesita**: por ejemplo, 500 litros de agua, 200 cajas de alimentos y 1 camión. Cada necesidad es una **meta**, medida con los recursos del catálogo (feature anterior).
- **Un ciclo de vida claro** — cada envío avanza, en un solo sentido, por cuatro etapas: **Recolectando → Listo → En tránsito → Entregado**. El Administrador lo hace avanzar (normalmente pasa a "Listo" cuando las metas se cumplen). No se puede retroceder ni saltarse pasos.
- **Metas ajustables al principio** — mientras el envío está en "Recolectando", el Administrador puede añadir, cambiar o quitar metas. Una vez pasa a "Listo", las metas quedan fijas para poder medir el progreso con seriedad.
- **Vista de gestión** — lista de todos los envíos con su estado, y un detalle con sus metas.

## Por qué importa

Es la pieza **contra la que todo se mide**. Los colaboradores aportarán **a un envío**, las solicitudes ayudarán a decidir **qué envío crear**, y los tableros mostrarán el **progreso de sus metas**. Sin los envíos y sus metas, no hay forma de organizar la ayuda ni de demostrar a dónde llega.

## Qué queda fuera (por ahora)

- Los **aportes** de los colaboradores y el **cálculo del progreso** real de cada meta llegan en la etapa siguiente. Aquí se definen los objetivos; todavía no se suma lo aportado.
- El **historial de seguimiento** (registro de cada cambio de estado con nota y evidencia de entrega) es una etapa posterior.
- El **panel del administrador** y el **tablero público** que muestran todo esto de forma visual vienen después.
- No se pueden retroceder estados ni editar metas de un envío ya avanzado.

## Resultado para el cliente

Al terminar, el Administrador puede **planificar y seguir cada envío de principio a fin**: definir qué se necesita, cuánto, hacia dónde y en qué etapa está. Es la base sobre la que se registrarán los aportes y se construirá la transparencia.
