# Feature 011 · Puntos de acopio

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/011-puntos-de-acopio/`._

---

## En una frase

Dar a cada administrador la posibilidad de registrar sus **centros físicos de entrega** (dónde, en qué horario y qué reciben), para que el colaborador sepa exactamente a dónde llevar lo que aporta.

## Qué aporta

Cada administrador funciona como centro de acopio de la red. Esta etapa le permite gestionar sus **puntos de acopio**: los lugares concretos donde se recibe la ayuda.

- **Puntos con datos claros:** cada punto tiene un nombre, una dirección, sus horarios de atención y la lista de recursos que recibe (agua, alimentos, medicinas).
- **Cada punto tiene dueño:** un punto de acopio pertenece siempre al administrador que lo crea. Un administrador puede tener uno o varios puntos, y solo gestiona los suyos.
- **La ubicación se completa sola:** el estado y la parroquia se toman por defecto del perfil del administrador (su centro de acopio), y se pueden cambiar si el punto está en otra zona. Menos que escribir, menos errores.
- **Se archiva, no se borra:** si un punto deja de operar, se archiva (desaparece de las opciones nuevas) pero se conserva para no perder el historial de entregas.
- **Se conecta con los aportes:** al registrar un aporte, el colaborador podrá elegir a qué punto de acopio lo va a llevar, escogiéndolo de la lista de puntos activos.

## Por qué importa

Un colaborador con ganas de ayudar necesita una respuesta simple: **"¿a dónde llevo esto y en qué horario?"**. Sin puntos de acopio, esa respuesta no existe en la plataforma. Con ellos, cada aporte tiene un destino físico claro, el administrador organiza mejor la recepción, y más adelante la transparencia puede mostrar por dónde pasó cada ayuda. Es la pieza que conecta el mundo digital (registrar un aporte) con el mundo real (entregarlo).

## Qué queda fuera (por ahora)

- **Mapa y geolocalización** (ubicar los puntos en un mapa interactivo) queda para más adelante; por ahora se registra la dirección como texto.
- **Reserva de cupos o agenda por franja horaria**: los horarios se indican como texto, sin sistema de citas.
- El **perfil del administrador como centro de acopio** (sus datos ampliados) se define en otra etapa; aquí se usa esa información para completar la ubicación de los puntos.
- No hay borrado definitivo de puntos (solo archivar).

## Resultado para el cliente

Al terminar, cada administrador dispone de sus **puntos de acopio listados y gestionables**: puede crearlos, editarlos y archivarlos, y el colaborador ya puede indicar en qué punto entregará su aporte. La ayuda deja de ser una intención abstracta y pasa a tener una dirección y un horario concretos.
