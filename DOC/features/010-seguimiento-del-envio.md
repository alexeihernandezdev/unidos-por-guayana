# Feature 010 · Seguimiento del envío

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/010-seguimiento-del-envio/`._

---

## En una frase

Guardar el **recorrido completo de cada envío** (cada cambio de etapa, con fecha, nota y foto de respaldo), para poder mostrar de dónde salió, por dónde pasó y que efectivamente **llegó a su destino**.

## Qué aporta

Hoy el sistema sabe en qué etapa está un envío, pero **no guarda cómo llegó hasta ahí**. Esta feature añade la memoria de ese recorrido: una línea de tiempo por envío.

- **Registro automático de cada paso** — cada vez que el Administrador avanza un envío (de "recolectando" a "listo", a "en tránsito", a "entregado"), el sistema anota el momento en que ocurrió. Nada se pierde.
- **Nota y evidencia** — al avanzar un envío, el Administrador puede añadir una nota ("salió del acopio de San Félix") y una **evidencia** (el enlace a una foto). En el paso más importante, la **entrega**, el sistema pide especialmente esa foto de respaldo.
- **Línea de tiempo del envío** — en el detalle de cada envío se ve su historia ordenada: cuándo pasó a cada etapa, con qué nota y con qué evidencia.
- **Traza pública** — en el tablero público de transparencia, cualquiera puede ver ese mismo recorrido (etapas, fechas y fotos de entrega), **sin datos personales**. Es la prueba visible de que la ayuda llegó.
- **Historial que no se altera** — una vez registrado, un paso queda como un hecho: no se edita ni se borra por separado. Eso es justamente lo que le da valor como prueba.

## Por qué importa

La **trazabilidad** es uno de los principios del proyecto: cada envío debe ser auditable de origen a destino. Sin esta feature, "la ayuda llegó" es solo una afirmación; con ella, es algo que **cualquiera puede comprobar**, con fechas y fotos. Para un donante, ver el recorrido y la evidencia de entrega es la mejor razón para volver a confiar y aportar de nuevo.

## Qué queda fuera (por ahora)

- **Subir fotos desde el dispositivo** — por ahora la evidencia se añade como un enlace a una foto ya publicada; el sistema de carga de imágenes propio llega en una etapa posterior.
- **Mapa del recorrido** — se muestran las etapas y el sector de destino, no un mapa con ubicación en tiempo real.
- **Retroceder o saltar etapas** — el envío avanza en un solo sentido, paso a paso, igual que hasta ahora.
- **Avisos automáticos** — que el envío avance no dispara notificaciones todavía; eso llega con la feature de notificaciones.
- **Editar la historia** — los pasos registrados no se modifican; si algo se corrige, se hace con un paso nuevo, no reescribiendo el pasado.

## Resultado para el cliente

Al terminar, cada envío tiene una **historia comprobable**: cuándo salió, cómo avanzó y la evidencia de que llegó a destino. El Administrador la registra casi sin esfuerzo (al avanzar el envío) y el público la ve en el tablero de transparencia. Es la pieza que convierte la promesa de "seguimos cada ayuda de origen a destino" en algo que se puede mostrar y auditar.
