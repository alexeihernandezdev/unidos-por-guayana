# Feature 012 · Notificaciones

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/012-notificaciones/`._

---

## En una frase

Avisar a las personas indicadas cuando pasa algo que les incumbe, cuando nace una actividad que necesita recursos o cuando una meta se cumple, por dos vías: **dentro de la plataforma** (campana y bandeja) y por **WhatsApp**, para que la ayuda llegue en el momento oportuno sin que nadie tenga que estar revisando el panel.

## Qué aporta

Hasta ahora la plataforma era pasiva: un colaborador solo se enteraba de que había una actividad a la que aportar si entraba a mirar. Con esta etapa, el sistema **da el primer paso** y avisa por dos canales complementarios.

- **Campana con contador** (in-app) — todo usuario con sesión ve una campana en la parte superior con el número de avisos sin leer.
- **Bandeja de avisos** (in-app) — una pantalla (`/notificaciones`) con todos sus avisos, del más reciente al más antiguo, con fecha y enlace directo a lo relacionado.
- **Aviso de nueva actividad** — cuando el administrador crea una actividad con metas, se avisa a su **red apta**: los colaboradores verificados afiliados a ese centro cuya categoría coincide con algún recurso pedido.
- **Aviso de meta cumplida** — cuando los aportes recibidos completan una meta, se avisa al administrador dueño y a los colaboradores que aportaron a esa meta.
- **WhatsApp** — el mismo aviso se envía además por WhatsApp a quienes tengan un número marcado como WhatsApp. Es opcional y **se enciende con solo colocar las credenciales de Meta** (ver abajo).
- **Marcar como leído** — el usuario marca un aviso, o todos, y el contador baja.
- **Teléfono con país** — el formulario de teléfono ahora incluye un selector de país; el número se guarda en formato internacional (E.164), listo para WhatsApp.

## Por qué importa

Los avisos acercan la acción al momento oportuno. En una emergencia, que un colaborador se entere hoy (y no la semana que viene) de que hay una actividad que necesita camiones o medicinas puede marcar la diferencia. WhatsApp es el canal de mensajería dominante en Venezuela: llega a la persona sin que tenga que abrir la app. Y el canal in-app no depende de nadie externo, así que siempre hay un registro fiable.

## WhatsApp: qué falta para encenderlo (plug-n-play)

El código ya está listo. Para activar el envío por WhatsApp solo hay que:

1. **Crear la app de WhatsApp en Meta** (Meta for Developers > WhatsApp) y obtener el **token de acceso** y el **ID del número emisor**.
2. **Crear y aprobar dos plantillas** de mensaje en Meta (idioma español, categoría _Utility_). Textos sugeridos:
   - Plantilla **nueva actividad** (una variable): 
     `Unidos por la Guaira: hay una nueva actividad en {{1}} que necesita recursos. Entra a la plataforma para ver cómo ayudar.`
   - Plantilla **meta cumplida** (dos variables): 
     `Unidos por la Guaira: la meta de {{1}} se cumplió en la actividad de {{2}}. Gracias por hacerlo posible.`
3. **Colocar las variables de entorno** (ver `.env.example`, sección WhatsApp):
   - `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_TEMPLATE_NUEVA_ACTIVIDAD` y `WHATSAPP_TEMPLATE_META_CUMPLIDA` con el **nombre exacto** de cada plantilla aprobada.
   - Opcionales: `WHATSAPP_API_VERSION` (por defecto `v21.0`), `WHATSAPP_LANG` (por defecto `es`).

Mientras esas variables estén vacías, la plataforma funciona igual con el canal in-app y **no intenta** enviar WhatsApp (no hay errores). Al colocarlas, se activa solo. Si falta la plantilla de un tipo, ese aviso no sale por WhatsApp pero el otro sí.

> Referencia técnica del envío (Graph API de Meta), a modo ilustrativo:
>
> ```
> POST https://graph.facebook.com/v21.0/<PHONE_NUMBER_ID>/messages
> Authorization: Bearer <ACCESS_TOKEN>
> {
>   "messaging_product": "whatsapp",
>   "to": "584121234567",
>   "type": "template",
>   "template": {
>     "name": "nueva_actividad",
>     "language": { "code": "es" },
>     "components": [
>       { "type": "body", "parameters": [ { "type": "text", "text": "Catia La Mar" } ] }
>     ]
>   }
> }
> ```

## Qué queda fuera (por ahora)

- **Correo, SMS ni notificaciones push** del navegador: los canales son in-app y WhatsApp.
- **Reintentos, cola o auditoría del envío de WhatsApp**: el envío es "best effort" (si falla, se registra y se sigue; nunca frena la operación).
- **Confirmaciones de entrega o lectura de WhatsApp** (webhooks de Meta) ni respuestas entrantes.
- **Avisos en tiempo real** (que "salten" solos sin recargar): el contador se actualiza al navegar.
- **Preferencias por usuario** (elegir qué avisos recibir o silenciarlos).
- **Otros avisos** ("tu solicitud fue atendida", cambios de estado, "tu cuenta fue aprobada"): se pueden sumar más adelante reutilizando el mismo mecanismo.
- **Selector de país en el teléfono de los puntos de acopio**: por ahora solo en el contacto de usuarios y administradores.

## Resultado para el cliente

Al terminar, la plataforma **avisa sola** a quien corresponde en los dos momentos que más importan, por la campana in-app y, en cuanto se configure Meta, también por WhatsApp. El teléfono se captura con país y se guarda en formato internacional, de modo que el día que se enchufe WhatsApp, todo funciona sin retocar datos.
