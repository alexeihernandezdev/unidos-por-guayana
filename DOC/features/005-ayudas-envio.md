# Feature 005 · Ayudas / Envío

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/005-ayudas-envio/`._

---

## En una frase

Permitir al equipo gestor **crear los envíos de ayuda** y definir **cuánto se necesita de cada cosa**, con un ciclo de vida claro desde que se recolecta hasta que se entrega.

## Qué aporta

Esta etapa introduce el **corazón de la plataforma**: la **Ayuda** (un envío concreto hacia un sector).

- **El Administrador crea envíos** con un **título breve** que los identifica, un **destino**, una **fecha de salida** y **qué se necesita**: por ejemplo, 500 litros de agua, 200 cajas de alimentos y 1 camión. Cada necesidad es una **meta**, medida con los recursos del catálogo (feature anterior).
- **Un ciclo de vida claro** — cada envío avanza, en un solo sentido, por cuatro etapas: **Recolectando, Listo, En tránsito y Entregado**. El Administrador lo hace avanzar (normalmente pasa a "Listo" cuando las metas se cumplen). No se puede retroceder ni saltarse pasos.
- **Metas ajustables al principio** — mientras el envío está en "Recolectando", el Administrador puede añadir, cambiar o quitar metas, y también corregir destino o fecha. Una vez pasa a "Listo", todo queda fijo para poder medir el progreso con seriedad.
- **Envíos aún en preparación se pueden descartar** — si un envío se creó por error o ya no tiene sentido, el Administrador puede eliminarlo mientras siga en "Recolectando". A partir de "Listo" ya no se elimina, porque forma parte del historial.
- **Vista de gestión** — lista de los envíos **del administrador en sesión** con su estado (con filtro por etapa) y un detalle con sus metas y el objetivo de cada una. Desde la feature 022 cada actividad tiene dueño: un admin no gestiona las de otro.

## Por qué importa

Es la pieza **contra la que todo se mide**. Los colaboradores aportarán **a un envío**, las solicitudes ayudarán a decidir **qué envío crear**, y los tableros mostrarán el **progreso de sus metas**. Sin los envíos y sus metas, no hay forma de organizar la ayuda ni de demostrar a dónde llega.

## Qué queda fuera (por ahora)

- Los **aportes** de los colaboradores y el **cálculo del progreso** real de cada meta llegan en la etapa siguiente. Aquí se definen los objetivos; todavía no se suma lo aportado.
- El **historial de seguimiento** (registro de cada cambio de estado con nota y evidencia de entrega) es una etapa posterior.
- El **panel del administrador** y el **tablero público** que muestran todo esto de forma visual vienen después.
- No se pueden retroceder estados, editar metas de un envío ya avanzado, ni eliminar envíos que ya salieron de "Recolectando".

## Resultado para el cliente

Al terminar, el Administrador puede **planificar y seguir cada envío de principio a fin**: definir qué se necesita, cuánto, hacia dónde y en qué etapa está. Es la base sobre la que se registrarán los aportes y se construirá la transparencia.
