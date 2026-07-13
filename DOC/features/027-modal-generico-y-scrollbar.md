# Feature 027 · Modal genérico y scrollbar global

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/027-modal-generico-y-scrollbar/`._

---

## En una frase

Unificar cómo se **crean y editan cosas sencillas** (recursos, medios de donación, ingresos) en un **modal sobre el listado**, como ya pasa con Puntos de acopio, y pulir el **scroll de toda la página** para que se vea limpio y sin flechas.

## Qué aporta

Hoy, según qué pantalla entres, crear o editar algo te lleva a otra página o te abre una ventana encima del listado. Para datos cortos (pocos campos), la ventana encima es más rápida y no te saca del contexto.

- **Un modal estándar para formularios pequeños** — mismo aspecto en todo el panel: bordes más redondeados que el cuadro genérico actual, título claro y scroll interno si hace falta. Es el mismo patrón que ya funciona en Puntos de acopio, pero reutilizable.
- **Scrollbar uniforme en todo el sitio** — barras de desplazamiento discretas, sin las flechas de subir/bajar del estilo clásico de Windows, alineadas con los colores de la marca.
- **Recursos y donaciones sin “viaje” extra** — dar de alta un recurso, un medio de pago o un ingreso monetario, o editarlos, se hace desde la misma pantalla del listado, sin pantallas intermedias de “nuevo” o “editar”.
- **Puntos de acopio al mismo estándar** — siguen abriéndose en modal; solo adoptan el componente común para que todo se vea igual.

## Por qué importa

Cuando gestionas el catálogo o las donaciones, lo normal es entrar, tocar “nuevo”, rellenar cuatro o seis campos y volver al listado. Obligarte a cambiar de página para eso suma clics y sensación de app “a trozos”. El modal mantiene el listado detrás, cierra al guardar y actualiza la tabla: menos fricción y un solo hábito en todo el panel.

El scrollbar global es un detalle pequeño pero visible: en Windows las flechas del scroll nativo se ven anticuadas y distintas según el navegador. Un estilo único hace que la herramienta se perciba más cuidada.

## Qué queda fuera (por ahora)

- **Actividades, solicitudes y aportes** — siguen en pantallas completas porque tienen muchos campos, metas o flujos más largos.
- **No cambia qué datos se piden ni quién puede hacer qué** — solo cómo se muestra el formulario.
- **No se abren modales dentro de modales** ni se sustituyen por paneles laterales.
- **Enlaces guardados** a rutas antiguas del tipo “/recursos/nuevo” dejarán de existir; la forma correcta es entrar al listado y pulsar el botón correspondiente.

## Resultado para el cliente

Al terminar, crear o editar un **recurso**, un **medio de donación** o un **ingreso monetario** se siente igual que en **Puntos de acopio**: ventana encima del listado, bordes redondeados, guardar y listo. Y al desplazarte por cualquier parte de la aplicación, el scroll se ve **consistente y sin flechas**, en línea con el resto del diseño del panel.
