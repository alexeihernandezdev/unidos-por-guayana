# Feature 017 · Datos de contacto obligatorios (colaborador y solicitante)

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/017-datos-de-contacto-obligatorios/`._

---

## En una frase

Pedir **cédula y teléfono** a todo colaborador y solicitante al registrarse, para poder contactarlos y, más adelante, verificarlos.

## Qué aporta

Esta etapa completa el registro de las dos figuras que participan en el día a día de la ayuda:

- **Cédula obligatoria** — el documento de identidad (con su letra `V`, `E` o `J` y su número). La plataforma revisa que el formato sea correcto antes de aceptarlo.
- **Teléfono obligatorio** — un número de contacto venezolano válido, que también se revisa antes de guardarlo.
- **Datos ordenados** — la cédula y el teléfono se guardan siempre de la misma forma (sin puntos ni espacios sueltos), para que no haya dos maneras distintas de escribir lo mismo.
- **Sin cédulas repetidas** — no se permite que dos cuentas usen la misma cédula.

Esto aplica **solo a los Colaboradores y Solicitantes**. El Administrador tiene su propio conjunto de datos ampliados (otra etapa) y el Superadministrador no se registra por la app.

## Por qué importa

Sin un teléfono y una cédula, el administrador **no puede contactar** a quien ofrece un camión o pide ayuda, ni darle después un **sello de confianza**. Estos dos datos son la base para la verificación de usuarios que llega más adelante: son lo mínimo para saber con quién se está tratando en un momento de crisis.

## Qué pasa con las cuentas que ya existían

A las personas que se registraron **antes** de este cambio no se les inventan datos. La próxima vez que inicien sesión, la plataforma les pedirá **completar su cédula y su teléfono** una sola vez, y hasta que lo hagan no podrán seguir usando el resto de funciones. Es un paso rápido y obligatorio, pensado para no perder a nadie por el camino.

## Qué queda fuera (por ahora)

- **Verificar que la cédula sea real** (comprobarla contra un registro oficial) no entra aquí: por ahora solo se revisa que el **formato** sea correcto. El sello de confianza que da el administrador llega en una etapa posterior.
- Los **datos ampliados del administrador** (estado, parroquia, cuenta, documento) se tratan en otra etapa.
- Editar el resto del perfil más allá de estos dos datos obligatorios.

## Resultado para el cliente

Al terminar, **todo colaborador y solicitante tendrá cédula y teléfono válidos registrados**, tanto los nuevos como los que ya existían, dejando lista la información de contacto que la plataforma necesita para coordinar la ayuda y para el paso siguiente de verificación.
