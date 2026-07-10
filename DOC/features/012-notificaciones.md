# Feature 012 · Notificaciones

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/012-notificaciones/`._

---

## En una frase

Avisar **dentro de la plataforma** a las personas indicadas cuando pasa algo que les incumbe, cuando nace un envío que necesita recursos o cuando una meta se cumple, para que la ayuda llegue en el momento oportuno sin que nadie tenga que estar revisando el panel a cada rato.

## Qué aporta

Hasta ahora la plataforma era pasiva: un colaborador solo se enteraba de que había un envío al que aportar si entraba a mirar por su cuenta. Con esta etapa, el sistema **da el primer paso** y avisa.

- **Campana con contador** — todo usuario que inicia sesión ve una campana en la parte superior con el **número de avisos sin leer**. De un vistazo sabe si hay algo nuevo.
- **Bandeja de avisos** — una pantalla donde el usuario ve todos sus avisos, del más reciente al más antiguo, con la fecha y un enlace directo a lo relacionado (por ejemplo, el envío que lo motivó).
- **Aviso de nuevo envío** — cuando el Administrador crea un envío con sus metas, los **colaboradores verificados** reciben un aviso de que hay un envío que necesita recursos. Así saben dónde pueden ayudar.
- **Aviso de meta cumplida** — cuando los aportes recibidos completan una meta (por ejemplo, ya se juntó toda el agua que pedía un envío), se avisa al Administrador dueño y a los colaboradores que aportaron a esa meta. Es un cierre positivo: lo que se pidió, se logró.
- **Marcar como leído** — el usuario marca un aviso como leído, o todos de una vez, y el contador baja. Simple y sin complicaciones.

## Por qué importa

Los avisos **acercan la acción al momento oportuno**. En una emergencia, que un colaborador se entere hoy (y no la semana que viene) de que hay un envío que necesita camiones o medicinas puede marcar la diferencia. Y avisar cuando una meta se cumple refuerza la confianza: la gente ve que su aporte sirvió y que el objetivo se alcanzó.

Todo ocurre **dentro de la app**, sin depender de correos o mensajes externos que se pierden o se retrasan con mala señal. Esto respeta dos ideas centrales del proyecto: que sea **fácil de usar** y que **funcione con conexión limitada**.

## Qué queda fuera (por ahora)

- **Correo, SMS y notificaciones push** del navegador o el teléfono: en esta etapa los avisos son solo dentro de la plataforma. Los canales externos se contemplan como una mejora futura.
- **Avisos en tiempo real** (que "salten" solos sin recargar): por ahora el contador se actualiza al entrar o moverse por la app.
- **Preferencias por usuario** (elegir qué avisos recibir o silenciarlos): todos reciben los dos tipos definidos.
- **Otros avisos** como "tu solicitud fue atendida", cambios de estado del envío (en tránsito, entregado) o "tu cuenta fue aprobada": son tipos que se pueden sumar más adelante reutilizando el mismo mecanismo.
- **Archivar o borrar avisos**, o limpiar automáticamente los viejos.

## Resultado para el cliente

Al terminar, la plataforma **avisa sola** a quien corresponde en los dos momentos que más importan: cuando hay un envío que necesita ayuda y cuando una meta se logra. Cada usuario tiene su campana con el conteo de novedades y su bandeja para revisarlas. El sistema deja de ser un tablero que hay que vigilar y pasa a llamar la atención cuando de verdad hace falta, sin agregar dependencias externas ni complejidad para el usuario.
