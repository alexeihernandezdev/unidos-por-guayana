# Feature 020 · Estado y municipio seleccionables (catálogo de Venezuela)

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/spec_template/features/020-catalogo-ubicacion-estados-municipios/`._

---

## En una frase

Que el **estado** y el **municipio** (antes "parroquia") se elijan de una **lista** con toda la
división de Venezuela, en vez de escribirlos a mano.

## Qué aporta

Hasta ahora la ubicación (estado y parroquia) se escribía como **texto libre**, tanto para el
colaborador y el solicitante como para el centro de acopio del administrador. Eso permite errores y
variantes del mismo lugar ("Miranda", "miranda", "Edo. Miranda") que luego impiden agrupar o filtrar
bien. Con esta etapa:

- **Se elige, no se escribe**: el estado y el municipio se seleccionan de **desplegables**. Primero se
  elige el estado; el desplegable de municipio muestra **solo** los municipios de ese estado.
- **Catálogo oficial de Venezuela**: la plataforma trae cargados los **24 estados** (entidades
  federales) y sus **municipios** (alrededor de 335), incluido **La Guaira** (antes Vargas), de donde
  salen los envíos.
- **Parroquia pasa a ser municipio**: el segundo nivel de ubicación deja de llamarse "parroquia" y
  pasa a ser **"municipio"**, un nivel más manejable y suficiente para la logística.
- **Datos consistentes**: al venir de una lista cerrada, todas las ubicaciones quedan escritas igual;
  esto habilita filtrar y agrupar por zona de forma fiable en el panel y en la transparencia.
- **Aplica a todos**: usa el mismo selector el registro del colaborador y del solicitante, la pantalla
  de "completar/editar mi perfil", el registro del administrador y la edición de su centro de acopio.

## Por qué importa

Para coordinar bien la ayuda, el administrador necesita saber con exactitud **de dónde** es cada
persona y cada centro de acopio. Con texto libre, dos personas del mismo lugar podían quedar
registradas distinto y no aparecer juntas al filtrar. Un catálogo cerrado y seleccionable garantiza
datos limpios, evita errores de tecleo y deja lista la base para los **puntos de acopio** (que heredan
la ubicación del administrador) y para los **filtros por zona**.

## Qué queda fuera (por ahora)

- **Parroquias, urbanizaciones o sectores**: el catálogo llega hasta **municipio**. El sector de
  destino de un envío o de una solicitud sigue escribiéndose libremente (no es parte del catálogo).
- **Filtros nuevos por estado/municipio** en el panel o en la transparencia: esta etapa deja los datos
  listos, pero añadir esos filtros es trabajo de otras features.
- **Editar el catálogo desde la app**: la lista de estados y municipios se mantiene internamente; no
  hay una pantalla para crear o borrar estados/municipios.
- **Otros países**: solo Venezuela.

## Nota sobre las cuentas ya registradas

Las ubicaciones que se habían escrito a mano no se convierten automáticamente (no hay forma segura de
adivinar a qué municipio exacto correspondían). Esas cuentas quedarán sin ubicación y, al iniciar
sesión, se les pedirá **volver a seleccionarla** en la pantalla de completar perfil, igual que ya
ocurre cuando faltan datos de contacto.
