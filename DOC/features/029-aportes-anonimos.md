# Feature 029 · Aportes anónimos

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/029-aportes-anonimos/`._

---

## En una frase

Permite **contabilizar donaciones sin exponer quién las hizo**: el organizador registra donaciones
directas de personas sin cuenta, y un colaborador puede aportar de forma anónima; en ambos casos el
nombre no se muestra al público, pero el organizador conserva la información para verificar.

## Qué aporta

- **Donación directa registrada por el organizador.** Mucha gente entrega ayuda directamente al
  organizador de una actividad sin tener cuenta: insumos, transporte, dinero o trabajo. Ahora el
  organizador puede **registrar ese aporte a mano** desde su actividad, contra cualquiera de sus metas. El
  aporte queda como **"Anónimo"** y cuenta de inmediato en el progreso, sin que parezca que la donación la
  hizo el propio organizador.
- **Colaborador que aporta de forma anónima.** Al aportar, un colaborador con cuenta puede marcar una
  casilla **"Aportar de forma anónima"**. Su nombre **no aparece** ante otros usuarios ni en la web
  pública, pero el **organizador sí lo ve** en su panel, porque necesita contactarlo para confirmar que la
  donación llegó.
- **El anonimato es hacia afuera, no hacia el organizador.** En el registro de aportantes que ven las
  personas con cuenta, y en la página pública de transparencia, un aporte anónimo se muestra como
  "Anónimo". El organizador dueño de la actividad conserva el nombre y el correo para verificar.
- **Se sigue viendo el esfuerzo colectivo.** El aporte anónimo no se esconde: aparece en la lista como una
  fila más ("Anónimo"), con su recurso, cantidad y estado, y suma a los totales.

## Por qué importa

Dos situaciones reales que hoy no estaban bien resueltas:

1. **No toda donación viene de una cuenta.** Si no hay forma de registrar la ayuda que alguien entrega en
   mano, o no se cuenta (y el progreso parece menor de lo real), o el organizador la carga a su nombre (y
   entonces en los reportes parece que donó él). Con la donación directa anónima, la ayuda se contabiliza
   y no se atribuye a quien no corresponde.
2. **Aportar debe poder ser discreto.** Hay quien quiere ayudar sin figurar. Pero el organizador necesita
   saber quién es para confirmar la entrega. Esta feature cubre las dos cosas a la vez: discreción hacia
   el público, identidad hacia quien debe verificar.

## Qué queda fuera (por ahora)

- **Guardar la identidad del donante directo** en la aplicación: no se pide (no la hay); el organizador
  puede anotar una referencia en la nota del aporte si lo desea.
- **Mostrar nombres en la transparencia pública**: esa página sigue siendo anónima.
- **Cambiar el anonimato de un aporte después** de haberlo creado: se decide al momento de aportar.
- **Elegir la fecha de una donación directa**: se registra con la fecha del momento (el flujo de dinero
  externo, que sí permite elegir fecha, no cambia).

## Resultado para el cliente

El progreso de cada actividad refleja **toda** la ayuda recibida, incluida la que llega de personas sin
cuenta, sin que parezca que la donó el organizador. Y quien quiera ayudar puede hacerlo de forma anónima
de cara al público, mientras el organizador mantiene los datos que necesita para verificar. La
transparencia pública se mantiene, como siempre, sin nombres de personas.
