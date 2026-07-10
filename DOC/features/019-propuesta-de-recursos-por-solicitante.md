# Feature 019 · Propuesta de recursos por el solicitante

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/019-propuesta-de-recursos-por-solicitante/`._

---

## En una frase

Permitir que **quien pide ayuda proponga recursos nuevos al catálogo** cuando lo que necesita todavía no existe, y que el equipo gestor los **revise, apruebe o rechace** antes de que se puedan usar.

## Qué aporta

Hasta ahora, la lista de recursos (agua, medicinas, alimentos, transporte, voluntarios, donaciones) la mantenía únicamente el Administrador. Si un solicitante necesitaba algo que no estaba en esa lista, no tenía forma de expresarlo. Esta etapa abre esa puerta con control:

- **El solicitante puede proponer** — mientras registra su petición de ayuda, si el recurso que necesita no aparece en el catálogo, puede **proponerlo** (nombre, unidad de medida, categoría y una descripción opcional). La propuesta queda marcada como "propuesta" a la espera de revisión.
- **El Administrador revisa** — dispone de una **bandeja de propuestas** donde ve qué se propuso, quién lo propuso y cuándo. Desde ahí puede **aprobar** la propuesta (pasa a formar parte del catálogo activo) o **rechazarla** (se conserva registrada, pero no se usa). También puede ajustar los datos antes de aprobar.
- **El Administrador sigue creando recursos directamente** — cuando el Administrador da de alta un recurso, entra ya aprobado y disponible de inmediato, como hasta ahora.
- **Nada se usa sin aprobar** — un recurso solo **propuesto** o **rechazado** no aparece cuando se definen las metas de un envío ni cuando un colaborador registra un aporte. Solo los recursos **aprobados** se pueden seleccionar. Así el catálogo se mantiene limpio y confiable.

## Por qué importa

Recoge la **voz de quien está en el terreno** sin perder el orden. Las necesidades reales no siempre encajan en una lista pensada de antemano: alguien puede necesitar una medicina concreta o un insumo específico que nadie había previsto. Dejar que el solicitante lo proponga hace la petición más precisa; que el Administrador lo revise garantiza que el catálogo no se llene de duplicados ni de entradas confusas. Es un equilibrio entre **escuchar la necesidad** y **mantener la consistencia** de todo lo que la plataforma mide.

## Qué queda fuera (por ahora)

- **Avisar al solicitante** de si su propuesta fue aprobada o rechazada llegará con las notificaciones, en una etapa posterior.
- **Los colaboradores no proponen recursos**; solo el solicitante (y el alta directa del Administrador).
- Una propuesta **rechazada no se reactiva**: si vuelve a hacer falta, se propone de nuevo.
- **No hay límites de cuántas propuestas** puede enviar un solicitante; se asume buena fe y el filtro es la revisión del Administrador.
- No se guarda un vínculo formal entre la petición y el recurso propuesto: el recurso pasa a ser parte del catálogo general.

## Nota sobre los datos existentes

Todos los recursos que ya existen en el catálogo (los que el Administrador creó hasta ahora) se consideran **aprobados** automáticamente al aplicar este cambio. Nada de lo ya definido en envíos o aportes se ve afectado.

## Resultado para el cliente

Al terminar, el solicitante tiene una forma de **pedir que se añada lo que necesita** y el Administrador un **flujo claro de revisión** para aceptarlo o descartarlo. El catálogo crece con aportes del terreno, pero siempre bajo el control del equipo gestor y sin perder la confiabilidad que sostiene la transparencia.
