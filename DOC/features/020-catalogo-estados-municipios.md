# Feature 020 · Catálogo de estados y municipios de Venezuela

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/spec_template/features/020-catalogo-estados-municipios/`._

---

## En una frase

Que al indicar **dónde estás**, elijas el **estado** y el **municipio** de una lista oficial de Venezuela, en lugar de escribirlos a mano.

## Qué aporta

Hasta ahora el colaborador, el solicitante y el centro de acopio (administrador) escribían su ubicación como texto libre (estado y parroquia). Eso generaba nombres distintos para el mismo lugar y complicaba organizar la ayuda por zona. Con esta etapa:

- **Lista de 24 entidades** cargada en el sistema: los 23 estados y el Distrito Capital (sin Dependencias Federales).
- **Lista de 335 municipios** repartidos por entidad (por ejemplo La Guaira tiene 1: Vargas; Miranda tiene 21; Táchira tiene 29). El detalle completo está en la especificación técnica (`catalogo-venezuela.md`).
- **Selección en dos pasos**: primero el estado, después el municipio que corresponde a ese estado.
- Los datos viven en la **base de datos** y se cargan al preparar el entorno (`seed`); no hay que inventarlos en cada formulario.
- Se deja de pedir **parroquia** como texto libre; el nivel que se usa para ubicar es **municipio**.

## Por qué importa

Para coordinar envíos, centros de acopio y solicitudes hace falta saber **en qué estado y municipio** está cada persona u organización, con el mismo nombre para todos. Una lista oficial evita errores de escritura y permite, más adelante, filtrar y priorizar por zona con confianza.

## Qué queda fuera (por ahora)

- Lista de **parroquias** (tercer nivel territorial).
- Pantalla para que un administrador **edite** el catálogo de estados/municipios (los datos se cargan una vez y se usan tal cual).
- Filtros geográficos nuevos en el panel o en el tablero público: esta etapa solo deja la ubicación bien guardada; los filtros vendrán cuando esas pantallas los necesiten.
