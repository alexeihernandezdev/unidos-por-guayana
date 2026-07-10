# Feature 022 · Actividades por administrador (aislamiento por dueño)

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/022-actividades-por-administrador/`._

---

## En una frase

Que **cada administrador vea y gestione solo sus propias actividades** (envíos, jornadas y eventos), sin
cruzarse con las de los demás administradores.

## Qué aporta

Hasta ahora, cualquier administrador veía en su panel las actividades de **todos** los administradores, y
podía abrir o modificar las ajenas. Esta feature pone orden: cada actividad **tiene un dueño** y cada
administrador trabaja solo con lo suyo.

- **Cada actividad pertenece a quien la crea.** Al crear un envío, jornada o evento, queda asociado al
  administrador que lo hizo. Ese dueño no cambia después.
- **Tu panel muestra solo lo tuyo.** El listado de actividades del panel enseña únicamente las del
  administrador que ha iniciado sesión. Nada de otros administradores.
- **No se puede tocar lo ajeno.** Si un administrador intenta abrir o editar por la fuerza (por URL) una
  actividad de otro, el sistema no lo permite: responde "no encontrada".
- **Tus números son tuyos.** Las métricas del panel (envíos por estado, aportes pendientes, qué sale
  primero) cuentan solo tu operación, no la de la red entera. Así tu tablero refleja tu realidad.
- **Lo público no cambia.** Los colaboradores siguen viendo **todas** las actividades de la red para poder
  aportar donde quieran, y la página de transparencia pública sigue mostrando el panorama completo. El
  aislamiento es solo dentro del área de gestión de cada administrador.
- **Las actividades anteriores no se pierden.** Todo lo creado antes de este cambio (que no tenía dueño) se
  asigna a un administrador para que nada quede huérfano.

## Por qué importa

En "Unidos por la Guaira" cada administrador es un centro de acopio independiente. Ver y poder modificar
las actividades de otro genera confusión ("¿por qué aparece un envío que yo no creé?"), riesgo de tocar
algo ajeno por error, y estadísticas que no representan el trabajo de cada quien. Atar cada actividad a su
dueño devuelve a cada administrador **su** panel, **sus** envíos y **su** control, sin quitarle al
colaborador la vista completa de la red.

## Qué queda fuera (por ahora)

- **Pasar una actividad de un administrador a otro** (transferir la propiedad): no se contempla.
- **Una vista global para el superadministrador** con todas las actividades de la red: se deja la base
  preparada, pero la pantalla es un trabajo aparte.
- **Aislar también aportes, solicitudes o recursos**: aquí solo se separan las **actividades**. El
  catálogo de recursos sigue siendo compartido y el colaborador sigue aportando a toda la red.

## Resultado para el cliente

Cada administrador entra a su panel y ve **solo sus actividades**, con métricas que reflejan **solo su
operación**, sin posibilidad de tropezar con o modificar las de otro centro de acopio. El colaborador y la
transparencia pública, en cambio, siguen viendo la red completa, como debe ser.
