# Feature 013 · Verificación de usuarios

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/013-verificacion-de-usuarios/`._

---

## En una frase

Dar **confianza**: permitir que el Administrador revise y apruebe (o rechace) a los **colaboradores** y **solicitantes**, para saber quién está detrás de un camión ofrecido o de una petición de ayuda antes de mover recursos reales.

## Qué aporta

Esta etapa incorpora la **verificación de personas** por parte del Administrador.

- **Todo colaborador y solicitante nace como "pendiente".** Al registrarse queda a la espera de revisión, pero puede seguir usando la plataforma con normalidad (aportar o pedir ayuda). La verificación suma confianza, no frena el uso.
- **El Administrador tiene una bandeja de revisión.** Ve las cuentas pendientes de colaboradores y solicitantes, con sus datos de contacto (cédula y teléfono) y su documento, y puede filtrar por rol y estado.
- **Aprobar o rechazar con un clic.** El Administrador revisa los datos y marca la cuenta como **verificada** o **rechazada**. Al rechazar puede dejar un motivo, para que quede constancia de por qué.
- **Distintivo de verificado.** Las cuentas aprobadas muestran una marca de confianza visible allí donde importa: junto a quien aporta transporte y junto a quien pide ayuda. Es una señal clara de que esa persona ya fue revisada.
- **Se puede reconsiderar.** Si alguien fue rechazado y luego corrige sus datos, el Administrador puede aprobarlo más adelante.

## Por qué importa

Sin verificación, cualquiera que se registre puede ofrecer un camión que nunca llega o abrir una petición falsa, y no hay forma de distinguir lo real de lo dudoso. Con este módulo, el Administrador filtra y respalda a las personas antes de que se muevan recursos, lo que **protege la operación y la reputación de la red**. Es la pieza que sube la confianza justo en los dos puntos más sensibles: quien pone el transporte y quien pide la ayuda.

## Cómo se relaciona con la aprobación de administradores

Es importante no confundir dos cosas parecidas:

- **Los administradores** los aprueba el **Superadministrador** (esa es otra etapa, la 015). Un administrador no aprobado no puede operar.
- **Los colaboradores y solicitantes** los aprueba el **Administrador** (esta etapa, la 013). Aquí "pendiente" no bloquea el uso: aporta confianza y prepara el terreno para futuros límites, pero no cierra la puerta.

Ambos casos usan el mismo semáforo de estados (pendiente, verificado, rechazado), pero con **responsables distintos** y **consecuencias distintas**.

## Qué queda fuera (por ahora)

- **No aprueba cuentas de administrador:** eso lo hace el Superadministrador en otra etapa (015).
- **No introduce la cédula ni el teléfono:** esos datos los aporta la etapa 017. Aquí simplemente se **revisan**.
- **No bloquea a los pendientes:** un colaborador o solicitante sin verificar sigue pudiendo participar. Los límites por estado, si se deciden, llegarían más adelante.
- **No hay verificación automática:** no se lee la cédula con un escáner ni se cruza con registros oficiales. La revisión la hace el Administrador con criterio.
- **No se suben fotos de documentos** todavía.
- **No se envían avisos** al usuario cuando su cuenta se aprueba o rechaza; eso llega con las Notificaciones (etapa 012).

## Resultado para el cliente

Al terminar, el Administrador dispone de un **filtro de confianza** sobre las personas que participan: una bandeja donde revisa y aprueba colaboradores y solicitantes, y un distintivo visible que señala a quién ya validó. La red gana credibilidad sin perder agilidad, porque la puerta sigue abierta mientras se construye esa confianza.
