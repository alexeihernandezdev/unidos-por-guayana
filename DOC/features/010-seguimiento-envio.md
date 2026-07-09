# Feature 010 · Seguimiento del envío

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/010-seguimiento-envio/` (se creará al iniciar la feature)._

---

## En una frase

La **historia de vida de cada envío**, de principio a fin: en qué etapa está, cuándo cambió y con qué evidencia se entregó.

## Qué aporta

Cada envío deja de ser una "caja negra" y pasa a tener una **línea de tiempo** clara y auditable. Para cada Ayuda/Envío se registra:

- **Cambios de estado** — el paso por las etapas `recolectando → listo → en tránsito → entregado`, con fecha y hora de cada transición.
- **Quién marcó el cambio** — el administrador o la persona autorizada responsable de esa transición.
- **Notas y contexto** — comentarios breves cuando aporten información útil (p. ej. "camión sale mañana temprano").
- **Evidencia de entrega** — al llegar al estado `entregado`, se adjunta la prueba (foto, acta de recepción o firma) que confirma que la ayuda efectivamente llegó a destino.

Esta línea de tiempo alimenta tanto al **panel de administración** (para operar) como al **tablero público de transparencia** (para rendir cuentas).

## Por qué importa

Es la traducción concreta del principio de **trazabilidad**: no basta con decir que la ayuda se entregó, hay que **poder mostrarlo**. Este seguimiento:

- **Cierra el círculo de confianza** — quien donó puede ver que su aporte llegó y con qué evidencia.
- **Ayuda al administrador** a detectar dónde se atascan los envíos y por qué.
- **Deja un registro auditable** que sirve ante cualquier persona u organización que quiera verificar cómo se manejó una ayuda.

## Qué queda fuera (por ahora)

- **No es GPS en tiempo real** — no rastrea la ubicación del camión minuto a minuto; se apoya en los cambios de estado que registra la persona responsable.
- **No es un sistema de firmas digitales certificadas** — la evidencia de entrega es una foto o documento cargado, no un contrato criptográficamente firmado.
- **No sustituye la logística real** — no coordina rutas, combustible ni tiempos de camión; se ocupa de dejar constancia, no de operar el transporte.
- **No integra transportistas externos** en esta etapa; podría venir después si el proyecto crece.

## Resultado para el cliente

Al terminar, **cada envío tiene su propia línea de tiempo verificable**: se sabe cuándo empezó a recolectarse, cuándo salió, cuándo llegó y con qué prueba se cerró. La plataforma no solo organiza la ayuda: **demuestra** que llegó. La transparencia gana profundidad y la operación gana un registro histórico útil para aprender de cada envío.
