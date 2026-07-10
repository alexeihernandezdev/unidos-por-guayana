# Feature 014 · Donaciones monetarias externas

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/014-donaciones-monetarias-externas/`._

---

## En una frase

Mostrar al público **cómo donar dinero** (cuenta bancaria, Pago Móvil, PayPal, Zelle, etc.) y permitir al **Administrador registrar los montos que ya llegaron por fuera**, para que la transparencia refleje el dinero recibido. La aplicación **no cobra ni procesa pagos**: solo muestra los medios y anota lo recibido.

## Qué aporta

- **Un lugar donde publicar los medios para donar** — el Administrador da de alta los canales por los que se puede aportar dinero (una cuenta bancaria, un Pago Móvil, un Zelle, un PayPal, efectivo en un punto de acopio…), con el titular, los datos y una nota de instrucciones. Puede activarlos u ocultarlos, y ordenarlos. El público los ve donde se invita a donar.
- **Registro de lo que ya se recibió** — cuando entra dinero por cualquiera de esos canales, el Administrador lo **registra a mano**: cuánto, en qué moneda, por qué medio, en qué fecha y una referencia. Ese ingreso queda contado como "recibido" y se refleja en la transparencia.
- **Sirve tanto para donaciones con nombre como anónimas** — si un colaborador ya registrado hizo la transferencia, se le puede asociar; si fue una donación anónima o de alguien no registrado, el Administrador la anota igual y queda constancia de quién la cargó.
- **Se puede atar a un envío o ir a la caja general** — un ingreso monetario puede sumar a la meta de dinero de un envío concreto, o simplemente contar como donación general del proyecto.
- **La transparencia lo muestra por moneda** — el tablero público refleja el total de dinero recibido agrupado por moneda (dólares, bolívares…), con la aclaración de que el pago se hizo por fuera de la app. Nunca se muestran datos personales del donante.

## Por qué importa

Sin esta feature hay dos huecos: nadie sabe **a dónde transferir** para donar, y aunque llegue dinero por fuera, **no aparece** en la transparencia. Esta etapa cierra ambos: publica los medios de forma clara y deja constancia de cada monto recibido, de modo que la comunidad vea que la ayuda económica también llega y se rinde cuentas de ella. Y lo hace respetando una regla que no se negocia: la plataforma es una vitrina y un registro, **no un cajero**.

## Lo que esta feature NO hace (a propósito)

- **No procesa pagos.** No hay botón que cobre, ni pasarela, ni tarjetas, ni saldos, ni checkout. El pago siempre ocurre por fuera de la aplicación (transferencia, PayPal, Zelle, efectivo…). La app solo **muestra** el medio y **anota** lo que ya se recibió.
- **No convierte monedas.** El dinero se cuenta por moneda (dólares por un lado, bolívares por otro); no se calcula un total único con tasa de cambio.
- **No hace conciliación bancaria automática** ni lee estados de cuenta: el registro es manual.
- **No emite recibos ni facturas** al donante.
- **No expone datos personales del donante** en la vista pública: la transparencia muestra solo montos agregados por moneda.

## Resultado para el cliente

Al terminar, el proyecto tiene una forma clara de **invitar a donar dinero** (con los medios visibles y actualizables por el Administrador) y de **dar cuenta del dinero que efectivamente llegó**, integrado en la transparencia pública junto al resto de la ayuda. Todo sin que la aplicación toque un solo pago: sigue siendo una herramienta de organización y transparencia, no una pasarela financiera.
