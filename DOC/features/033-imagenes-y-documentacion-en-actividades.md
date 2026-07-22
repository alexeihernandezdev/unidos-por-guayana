# Feature 033 · Imágenes y documentación en actividades

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/033-imagenes-y-documentacion-en-actividades/`._

---

## En una frase

Las actividades (envíos, jornadas y eventos) ahora llevan **fotos y documentos**, y el **tablero público de transparencia** se rediseña para mostrarlas: pasa de una lista de texto a una galería con cara e impacto.

## Qué aporta

- **Imagen principal.** El administrador dueño sube una foto que encabeza la actividad (la jornada, el reparto, la zona atendida). Se muestra destacada en el tablero público y en el detalle.
- **Documentación de apoyo.** Puede adjuntar hasta **10 documentos**: fotos adicionales, actas, listados, informes (imágenes, PDF o Word).
- **Transparencia con vitrina.** El tablero `/transparencia` se rediseña como galería editorial: una actividad destacada con su foto a lo ancho y el resto en tarjetas con imagen y progreso. El detalle público de cada actividad muestra su foto principal como portada, las metas y una galería con las fotos y documentos.
- **En cualquier momento.** A diferencia de las solicitudes, el administrador puede subir o quitar imágenes en cualquier estado de la actividad (incluso después de realizarla, para dejar constancia de lo hecho).

## Por qué importa

La transparencia es el norte del proyecto, pero hasta ahora el tablero público solo mostraba números y texto. Con fotos:

1. **La transparencia se vuelve creíble y humana**: ver la jornada o el reparto transmite el impacto mejor que un porcentaje.
2. **El administrador documenta públicamente lo que hizo**: fotos y actas dejan constancia de la ayuda entregada.
3. **El tablero invita a colaborar**: deja de ser una tabla y pasa a ser una vitrina de la operación.

## Cómo se usa

1. **Al crear la actividad**, en la misma pantalla, un panel permite elegir la imagen principal y los documentos con vista previa. Se suben automáticamente al pulsar "Crear".
2. **Después**, desde el detalle de la actividad, el administrador dueño puede añadir o quitar archivos en cualquier momento.
3. **Cualquiera**, sin iniciar sesión, ve las fotos en `/transparencia` y en el detalle público de cada actividad. El colaborador también las ve en el detalle dentro de la app.

## Qué queda fuera (por ahora)

- **Que un colaborador u otra persona suba o borre** archivos: solo el administrador dueño gestiona; el resto solo ve.
- **Vista previa incrustada de PDF o Word**: se ofrecen para abrir o descargar; las imágenes sí se muestran.
- **Fotos en las tarjetas de las listas de la app y del panel** (`/actividades`, `/panel/actividades`): el rediseño visual se limita, por ahora, a la transparencia y a los detalles.

## Resultado para el cliente

El tablero público deja de ser una tabla de datos y se convierte en una **vitrina visual de la operación**: se ve lo que se recolectó, a dónde fue y, ahora, **cómo se ve la ayuda en el terreno**. Más confianza, más ganas de participar.

## Nota técnica para el equipo

Las fotos de actividad se guardan en un **bucket público de Supabase Storage** (a diferencia de las solicitudes, que usan uno privado), porque se muestran en la transparencia sin sesión. Reutiliza la infraestructura de la feature 031. Requiere una variable de entorno adicional (`SUPABASE_STORAGE_BUCKET_PUBLICO`); ver `.env.example`. En desarrollo local, sin las variables `SUPABASE_*` se puede usar todo lo demás, pero no subir archivos.
