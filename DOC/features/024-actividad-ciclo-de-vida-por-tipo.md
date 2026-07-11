# Feature 024 · Actividad: nombre correcto y ciclo de vida por tipo

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/024-actividad-ciclo-de-vida-por-tipo/`._

---

## En una frase

Que la entidad central se llame **Actividad** en todo el sistema (no "Ayuda"), y que **cada tipo de
actividad avance con el vocabulario que le corresponde**: un envío no es lo mismo que una jornada o un
evento social.

## Qué aporta

- **Un solo nombre, coherente en todos lados.** El nombre interno pasa de "Ayuda" a **Actividad**, que es
  como ya se habla del proyecto en la misión, en la web y en las pantallas. Antes había que traducir
  mentalmente entre "lo que dice el sistema" y "lo que ve la gente"; ahora coinciden. Las direcciones web
  de gestión pasan de `/ayudas` a `/actividades`.
- **Cada tipo avanza como debe.** Un **envío** sigue su camino de siempre: Recolectando, Listo, En
  tránsito, Entregado. Una **jornada** o un **evento social** ahora avanzan con palabras que sí tienen
  sentido: Recolectando, Lista, En curso, Realizada. Ya no se fuerza el vocabulario de un camión en ruta
  sobre un evento comunitario.
- **Hora de fin opcional.** Una jornada o evento puede indicar a qué hora termina (por ejemplo, "de 9:00 a
  13:00"). Un envío no la necesita.
- **Punto de acopio opcional.** Al crear o editar una actividad, el administrador puede asociarle uno de
  **sus** puntos de acopio (dónde se recibe el aporte o dónde ocurre el evento). Solo puede elegir puntos
  propios y activos; el sistema rechaza asociar el punto de otro administrador.
- **Nada se pierde.** Las actividades creadas antes de este cambio se conservan. Las jornadas y eventos que
  tuvieran un estado del vocabulario de envío se pasan a su estado equivalente automáticamente.

## Por qué importa

El proyecto siempre habló de "actividades" (envíos, jornadas, eventos), pero por dentro el código seguía
diciendo "ayuda". Esa doble forma de nombrar lo mismo confunde y, con cada función nueva, obliga a arrastrar
el desajuste. Además, mostrarle a un administrador que su jornada de salud está "en tránsito" no tiene
sentido. Corregir el nombre y el ciclo de vida ahora deja la base limpia para lo que viene (afiliaciones y
avisos), sin heredar la confusión.

## Qué queda fuera (por ahora)

- **Cambiar cómo funcionan las metas y los aportes.** Siguen igual; solo cambia el nombre interno del
  vínculo.
- **Un campo dedicado de "cuántos voluntarios se necesitan".** Eso se resuelve con una meta normal sobre un
  recurso de tipo Personal (por ejemplo, "Voluntarios"), sin inventar un campo aparte.
- **Mostrar el punto de acopio en la transparencia pública.** Sigue siendo información de gestión.

## Resultado para el cliente

El sistema habla de **Actividades** de principio a fin, cada tipo avanza con su propio lenguaje, y el
administrador puede indicar la hora de fin y el punto de acopio de sus jornadas y eventos, todo sin perder
ninguna actividad ya registrada.
