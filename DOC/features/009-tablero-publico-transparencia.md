# Feature 009 · Tablero público de transparencia

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/009-tablero-publico-transparencia/` (se creará al iniciar la feature)._

---

## En una frase

La **vista abierta al público**, sin necesidad de registrarse, donde cualquier persona puede ver **qué se recolectó, cuánto falta y a dónde fue cada ayuda**.

## Qué aporta

Es la "vitrina" del proyecto. Con solo entrar al enlace, un vecino, un donante o un periodista puede consultar:

- **Envíos activos** — cada envío en marcha con su fecha estimada, destino y estado (recolectando, listo, en tránsito, entregado).
- **Progreso de las metas** — cuánto se ha reunido de cada recurso (agua, medicinas, alimentos, transporte, voluntarios…) y cuánto falta.
- **Envíos ya entregados** — el histórico de lo que llegó a destino, con la evidencia de entrega asociada al seguimiento.
- **Totales acumulados** — una cifra global de lo recolectado hasta la fecha, por tipo de recurso.
- **Montos monetarios recibidos por fuera de la app** — reflejados por el administrador (la app **no** procesa pagos), para que quien dona por transferencia o Zelle también vea reflejada su contribución.

Todo se muestra en **lenguaje claro** y sin datos personales sensibles: se trata de rendir cuentas, no de exponer a la gente.

## Por qué importa

La transparencia es uno de los cuatro principios del proyecto. Sin este tablero, la promesa de "cualquiera puede ver qué se recolectó y a dónde fue" se queda en el papel. Con él:

- **Genera confianza** en quien está pensando en donar: ve resultados concretos antes de aportar.
- **Rinde cuentas** a la comunidad y a los sectores afectados.
- **Reduce el desgaste** de tener que explicar caso por caso qué está pasando: el enlace habla por sí solo.

## Qué queda fuera (por ahora)

- **No muestra datos personales** de colaboradores ni de solicitantes; los aportes se agregan de forma anónima o con identificación mínima.
- **No permite acciones** — es solo lectura; para aportar o pedir ayuda hay que registrarse.
- **No es un dashboard analítico** con filtros avanzados, cruces personalizados ni exportaciones; su meta es claridad, no análisis experto.
- **No incluye APIs públicas** para terceros en esta etapa (podría venir después si hay demanda).

## Resultado para el cliente

Al terminar, **el proyecto puede compartir un enlace único que resume su impacto en tiempo real**. Cualquiera —sin cuenta, sin fricción— entiende qué se está haciendo, cuánto se ha logrado y qué falta. La transparencia deja de ser una promesa y se vuelve algo que se puede señalar con el dedo.
