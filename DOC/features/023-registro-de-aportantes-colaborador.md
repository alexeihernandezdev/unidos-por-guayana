# Feature 023 · Registro de aportantes visible al colaborador

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/023-registro-de-aportantes-colaborador/`._

---

## En una frase

Que el **colaborador pueda ver quién ha aportado** a una actividad: el registro de aportes con el nombre de
las personas, qué aportaron y en qué estado.

## Qué aporta

Hasta ahora, un colaborador solo veía **sus propios** aportes. No tenía forma de saber si alguien más
estaba colaborando en la misma actividad. Esta feature añade, dentro de la actividad, un **registro de
quiénes han aportado**.

- **Lista de aportantes.** En el detalle de una actividad, una sección "Quiénes han aportado" muestra, por
  cada aporte: el **nombre** de la persona, el **recurso**, la **cantidad** y el **estado**
  (comprometido o recibido).
- **Se ve el esfuerzo colectivo.** El colaborador comprueba que no está solo: otras personas también están
  sumando, lo que anima a participar y da sensación de comunidad.
- **Solo el nombre, nada de datos privados.** Se muestra el nombre de quien aportó, nunca su cédula,
  teléfono ni correo. Los datos de contacto siguen siendo privados.
- **Para personas con cuenta.** El registro con nombres es para usuarios que han iniciado sesión. La
  página de transparencia pública (abierta a cualquiera, sin cuenta) sigue **sin** mostrar nombres de
  personas.
- **Ordenado y claro.** Los aportes aparecen del más reciente al más antiguo, con la fecha en formato
  venezolano. Si aún no hay aportes, se ve un mensaje que invita a ser el primero.

## Por qué importa

Aportar es un acto social: la gente colabora más cuando **ve** que otros también lo hacen. Hoy el
colaborador aporta "a ciegas", sin saber si alguien más respondió. La transparencia pública da totales
pero oculta a las personas (y con razón, es abierta a todo el mundo). Faltaba un punto intermedio: para
quien **ya tiene cuenta** y participa, mostrar **quién** ha aportado convierte el aporte en una historia
colectiva y refuerza la confianza en que la ayuda es real y hay gente moviéndose. El cliente lo pidió
así: "el colaborador podrá ver el registro de aporte, qué personas son las que han aportado".

## Qué queda fuera (por ahora)

- **Mostrar datos de contacto** de los aportantes (cédula, teléfono, correo): se excluyen por privacidad.
- **Nombres en la transparencia pública**: esa página sigue siendo anónima.
- **Acciones sobre los aportes** desde esta vista (marcar como recibido, editar): siguen siendo tarea del
  administrador en su panel. Aquí el colaborador solo **consulta**.
- **Rankings o perfiles de colaboradores**: solo el registro por actividad, no un "top de aportantes".

## Resultado para el cliente

Un colaborador con sesión abre una actividad y ve **quiénes han aportado**, con nombre, recurso, cantidad
y estado, de forma clara y respetando la privacidad (solo el nombre). Aportar deja de ser un acto aislado
y pasa a sentirse como parte de un esfuerzo colectivo, mientras la transparencia pública se mantiene
anónima.
