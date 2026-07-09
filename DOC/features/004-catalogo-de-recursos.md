# Feature 004 · Catálogo de recursos

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/004-catalogo-de-recursos/`._

---

## En una frase

Crear la **lista maestra de todo lo que se puede aportar o necesitar** (agua, medicinas, alimentos, transporte, voluntarios, donaciones…), para que todo el sistema hable el mismo idioma.

## Qué aporta

Antes de poder pedir ayuda o registrar aportes, la plataforma necesita saber **qué cosas existen** y **cómo se miden**. Esta etapa entrega ese catálogo:

- **Un catálogo ordenado** — cada recurso tiene un nombre claro (p. ej. "Agua"), una unidad de medida (litros, cajas, unidades, personas, USD…) y una categoría: **suministros**, **transporte**, **personal** (voluntarios) o **monetario** (donaciones que se reciben por fuera).
- **Lo administra el equipo gestor** — solo el **Administrador** crea, edita o archiva recursos, manteniendo la lista limpia y sin duplicados.
- **Se archiva, no se borra** — si un recurso deja de usarse, se **archiva** (desaparece de las opciones nuevas) pero se conserva para no perder el historial.
- **Base para todo lo demás** — sobre este catálogo se definirán después las **metas** de cada envío y se registrarán los **aportes**, y así se podrá calcular el progreso ("faltan 200 de 500 litros de agua").

## Por qué importa

Es la **pieza que da consistencia** al resto. Si cada persona escribiera los nombres a mano, sería imposible sumar aportes o saber cuánto falta para una meta: "agua", "Agua" y "botellones" quedarían como cosas distintas. Un catálogo único garantiza que todo se mida igual y que la transparencia sea fiable.

## Qué queda fuera (por ahora)

- Las **metas de cada envío** (cuánto se necesita de cada recurso) llegan en la etapa siguiente.
- Los **aportes** de los colaboradores contra esos recursos vienen después.
- El **registro de dinero recibido** y los medios de donación externos son una etapa posterior; aquí "monetario" es solo una categoría del catálogo.
- No hay borrado definitivo de recursos (solo archivar), ni carga masiva, ni imágenes.

## Resultado para el cliente

Al terminar, el Administrador dispone de un **catálogo de recursos claro y reutilizable**: la base ordenada sobre la que se construirán los envíos, los aportes y, más adelante, el tablero de transparencia.
