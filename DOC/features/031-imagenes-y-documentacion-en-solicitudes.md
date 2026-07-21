# Feature 031 · Imágenes y documentación en solicitudes

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/031-imagenes-y-documentacion-en-solicitudes/`._

---

## En una frase

Permite que quien pide ayuda **adjunte una imagen principal y documentos de apoyo** a su solicitud, para que el organizador vea y verifique la situación real, no solo el texto.

## Qué aporta

- **Imagen principal.** El solicitante puede subir una foto que encabeza su solicitud (por ejemplo, la zona afectada o el estado de una vivienda). Se muestra destacada en el detalle.
- **Documentación de apoyo.** Puede adjuntar hasta **10 documentos**: imágenes, PDF o documentos de Word (presupuestos, informes, listados, fotos adicionales).
- **Se ve donde importa.** Tanto el solicitante dueño como el administrador que evalúa la solicitud ven la imagen y pueden abrir o descargar los documentos.
- **Solo mientras la solicitud está abierta.** Se pueden añadir o quitar archivos mientras la solicitud sigue `ABIERTA`; una vez atendida o cerrada, quedan como están.

## Por qué importa

Hasta ahora una solicitud era solo texto (sector, urgencia, descripción y recursos). El organizador no tenía forma de **ver** ni **respaldar** la situación:

1. **Una imagen comunica la urgencia** mejor que un párrafo.
2. **Los documentos sustentan la decisión**: con un presupuesto o un informe, el administrador prioriza con evidencia.
3. **Más confianza y transparencia**, que es el norte del proyecto: lo que se pide se puede respaldar.

## Cómo se usa

1. El solicitante crea su solicitud como siempre.
2. Desde la **edición** de la solicitud añade la imagen principal y los documentos (se suben al momento, con vista previa).
3. El administrador los ve en el detalle de la solicitud, en su panel.

## Qué queda fuera (por ahora)

- **Ver los archivos sin iniciar sesión**: no hay página pública de solicitudes; solo se ven dentro de la aplicación.
- **Mostrar estos archivos en la transparencia pública**: esa página no cambia.
- **Que el administrador suba o borre** archivos de la solicitud: para él son de solo lectura.
- **Vista previa incrustada de PDF o Word**: se ofrecen para abrir o descargar; las imágenes sí se muestran.

## Resultado para el cliente

Las solicitudes dejan de ser solo texto: ahora llevan **evidencia visual y documental**. El organizador entiende y verifica mejor cada petición, y la persona que pide ayuda puede mostrar su situación de forma clara y privada (los archivos no son públicos en internet).

## Nota técnica para el equipo

Los archivos se guardan en **Supabase Storage** (almacenamiento privado). Para que funcione hay que configurar tres variables de entorno (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`); ver `.env.example`. En desarrollo local, sin esas variables se puede usar todo lo demás de la solicitud, pero no subir archivos.
