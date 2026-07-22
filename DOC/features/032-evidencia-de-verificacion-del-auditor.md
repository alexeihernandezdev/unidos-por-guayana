# Feature 032 · Evidencia de verificación del auditor

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en el módulo `src/modules/auditoria/`._

---

## En una frase

Permite que el **auditor adjunte evidencia física** (fotos, capturas, video o PDF) mientras verifica una solicitud, como respaldo interno de su dictamen.

## Qué aporta

- **Evidencia junto al dictamen.** Mientras el auditor tiene una solicitud en revisión, puede subir la evidencia que sustenta su comprobación: fotos del lugar, capturas de una llamada o chat, un video corto, un PDF.
- **Soporta video.** A diferencia de los archivos del solicitante (imágenes y documentos), la evidencia del auditor admite **video** (MP4, WEBM, MOV), además de imágenes y PDF, con un límite de **50 MB** por archivo y hasta **15** por solicitud.
- **Es interna.** La evidencia la ven **solo auditores y administradores**. El solicitante **no** la ve (ni en su detalle ni en la transparencia pública). Complementa la "nota interna" del dictamen con pruebas visuales.
- **Ligada a la revisión.** Solo el auditor que tomó la solicitud (mientras está `EN_REVISION` suya) puede subir o quitar evidencia. Queda registrado el ciclo de auditoría en que se aportó.

## Por qué importa

El respaldo del auditor era hasta ahora solo texto (método, nota interna, explicación). Con evidencia visual:

1. **Las decisiones quedan mejor sustentadas** ante una revisión posterior o una auditoría de la auditoría.
2. **La administración puede contrastar** el dictamen con las pruebas antes de actuar sobre la solicitud.
3. **Menos ambigüedad**: una foto o un video comunican lo que un párrafo no siempre logra.

## Cómo se usa

1. El auditor toma una solicitud de la cola (queda `EN_REVISION` a su nombre).
2. En la pantalla de revisión, junto al formulario de dictamen, aparece **"Evidencia de verificación"**: añade fotos, capturas, video o PDF (se suben al momento) y puede quitarlos.
3. Emite el dictamen. La evidencia queda asociada a la solicitud y a ese ciclo de auditoría.
4. Otros auditores y la administración ven la evidencia en solo lectura, con enlace para abrirla o descargarla.

## Qué queda fuera (por ahora)

- **Que el solicitante vea la evidencia**: es interna por diseño.
- **Que aparezca en la transparencia pública**.
- **Editar evidencia tras el dictamen**: solo se gestiona mientras la solicitud está en revisión del auditor.
- **Vista previa incrustada de video/PDF**: se ofrecen para abrir o descargar.

## Resultado para el cliente

La verificación deja de apoyarse solo en texto: el auditor respalda su dictamen con **pruebas visuales internas**, y la administración decide con más elementos, sin exponer material sensible al solicitante ni al público.

## Nota técnica para el equipo

La evidencia se guarda en el **mismo bucket privado de Supabase Storage** que los archivos del solicitante (feature 031), bajo el prefijo `auditoria/`. Como admite video, el bucket debe permitir un tamaño de **50 MB** (tope del plan Free de Supabase; se subiría si se pasa a Pro) y los MIME de imagen, video (mp4/webm/quicktime) y PDF (ver `.env.example`). Requiere aplicar la migración `20260721200000_auditoria_evidencia` (`pnpm db:migrate`). El modelo es `ArchivoEvidenciaAuditoria` (tabla `archivos_evidencia_auditoria`), separado de `ArchivoSolicitud` para garantizar que la evidencia nunca se filtre al solicitante.
