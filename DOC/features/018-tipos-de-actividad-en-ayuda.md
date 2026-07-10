# Feature 018 · Tipos de actividad en Ayuda (envío / jornada / evento social)

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/018-tipos-de-actividad-en-ayuda/`._

---

## En una frase

Que una misma **actividad** de la plataforma pueda ser un **envío**, una **jornada** o un **evento
social**, eligiendo el tipo al crearla, sin cambiar cómo funciona por dentro.

## Qué aporta

Hasta ahora, el corazón de la plataforma eran los **envíos** de ayuda. El cliente pidió abrirlo a más
formas de colaborar: además de envíos, ahora se pueden organizar **jornadas** y **eventos sociales**.

- **Se elige el tipo al crear.** Cuando el Administrador va a crear una actividad, escoge de qué tipo es
  y la pantalla se adapta: el título y el botón pasan a decir "Crear envío", "Crear jornada" o "Crear
  evento social", según corresponda.
- **Todo lo demás funciona igual.** Sea envío, jornada o evento social, la actividad comparte lo mismo:
  se le fijan **metas de recursos** (qué se necesita y cuánto), los colaboradores pueden **aportar**, y
  avanza por las mismas etapas (Recolectando, Listo, En tránsito, Entregado). El tipo solo cambia cómo
  se **nombra y se presenta**, no cómo se gestiona.
- **Se ve y se filtra por tipo.** En la lista de actividades, cada una muestra su tipo, y el
  Administrador puede **filtrar por tipo** (por ejemplo, ver solo las jornadas), además del filtro por
  etapa que ya existía.
- **Las actividades anteriores quedan como "envío".** Todo lo creado antes de este cambio se marca
  automáticamente como **envío**, que es lo que eran. Nadie tiene que revisarlas una a una.

## Por qué importa

La ayuda no siempre es un camión que sale hacia un sector. A veces es una **jornada** (de recolección,
de atención) o un **evento social** que también moviliza recursos y voluntarios. Con un solo campo de
"tipo", la plataforma cubre esas tres realidades **sin duplicar** pantallas ni procesos: se reutiliza
todo lo ya construido (metas, aportes, seguimiento y transparencia), y el equipo aprende una sola forma
de trabajar.

## Qué queda fuera (por ahora)

- **No se cambia el tipo de una actividad ya creada.** El tipo se decide al crear y se mantiene; no hay
  opción de "convertir" un envío en jornada.
- **No hay reglas distintas por tipo.** Los tres tipos comparten las mismas etapas y la misma forma de
  fijar metas y recibir aportes; lo único que cambia es el vocabulario que se muestra.
- **No hay un diseño visual propio por tipo** (colores o pantallas distintas) más allá de los textos. Si
  más adelante se quiere diferenciar visualmente cada tipo, se aborda aparte.

## Resultado para el cliente

El Administrador puede organizar, con la **misma herramienta**, no solo envíos sino también **jornadas**
y **eventos sociales**: elige el tipo al crear, la pantalla se adapta al nombrarlo, y puede listar y
filtrar por tipo. La ayuda ya construida sigue intacta (queda registrada como "envío") y todo el flujo
de metas, aportes y seguimiento se aprovecha sin cambios.
