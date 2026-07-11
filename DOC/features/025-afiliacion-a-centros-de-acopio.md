# Feature 025 · Afiliación a centros de acopio y categorías de aporte

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/025-afiliacion-a-centros-de-acopio/`._

---

## En una frase

Que cada colaborador diga **qué tipo de ayuda puede dar** y **a qué centros de acopio quiere unirse**, para
que cada administrador vea **su red** y sepa a quién convocar cuando crea una actividad.

## Qué aporta

- **El colaborador declara qué puede aportar.** Al registrarse elige, de forma obligatoria, al menos una de
  las cuatro categorías: suministros, transporte, personal (voluntariado) o aporte monetario. Es una
  característica de la persona y puede cambiarla cuando quiera desde su perfil.
- **El colaborador se une a los centros que quiera.** Desde "Mi perfil" ve la lista de centros de acopio
  verificados (filtrable por estado y con la opción de desplegar sus puntos de acopio), y se afilia a los
  que quiera con un clic. Es opcional: puede registrarse sin unirse a ninguno y hacerlo después.
- **Unirse es inmediato y reversible.** No hace falta aprobación del administrador. El colaborador puede
  unirse a varios centros a la vez y dejarlos cuando quiera.
- **El administrador ve "su red".** En la nueva sección "Mi red" del panel, el administrador ve a los
  colaboradores afiliados a su centro: nombre, qué pueden aportar, si están verificados y su teléfono o
  WhatsApp para contactarlos. Puede filtrar por categoría y remover a alguien de su red (esa persona puede
  volver a unirse después si quiere).
- **Ayuda a decidir a quién pedir.** Al crear una actividad y elegir el recurso de una meta, el sistema
  muestra cuántas personas de la red del administrador podrían aportar ese tipo de recurso (solo el
  número).
- **No limita la solidaridad.** La afiliación es solo informativa: cualquier colaborador puede aportar a
  cualquier actividad, esté o no afiliado a ese centro. Unirse solo sirve para visibilidad y convocatoria.

## Por qué importa

El administrador necesitaba saber, sin preguntar uno por uno, quién de su comunidad puede poner un camión,
quién puede llevar suministros y quién puede aportar dinero. Antes no existía el concepto de "red": todos
los colaboradores eran igual de anónimos para todos los centros. Con esta feature, cada colaborador se
clasifica una sola vez (por categorías, no recurso por recurso, para que no quede desactualizado) y elige
con qué centros quiere colaborar, sin que eso le impida ayudar donde haga falta.

## Qué queda fuera (por ahora)

- **Que unirse a un centro dé permisos o restrinja aportes.** No: aportar sigue siendo libre para todos.
- **Aprobar afiliaciones.** No hay bandeja ni espera: unirse es inmediato.
- **El envío del aviso automático.** Esta feature ya calcula **a quién** hay que avisar cuando se crea una
  actividad (los afiliados verificados cuya categoría coincide). El envío del aviso en sí es parte de la
  feature de Notificaciones (012), que nacerá usando esta lista de destinatarios.
- **Mostrar la red o las categorías en la transparencia pública.** Es información de gestión del
  administrador.

## Resultado para el cliente

El colaborador declara qué puede aportar y a qué centros se une; el administrador ve su red con datos de
contacto y, al planificar una actividad, sabe de un vistazo con cuánta gente apta cuenta para cada tipo de
recurso. Todo sin poner barreras a que cualquiera ayude donde quiera.
