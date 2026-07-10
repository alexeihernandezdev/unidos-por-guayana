# Feature 016 · Perfil de administrador y centro de acopio

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/016-perfil-de-administrador-y-acopio/`._

---

## En una frase

Dar a cada **administrador** un perfil completo que lo identifica como **centro de acopio** de la red, con sus datos de contacto, ubicación y documento.

## Qué aporta

Un administrador no es solo quien gestiona las ayudas: también funciona como **centro de acopio**, un punto de referencia y confianza dentro de la red. Esta etapa le da una identidad clara:

- **Datos del centro de acopio:** nombre de la cuenta, estado del país y parroquia a los que pertenece, teléfono, correo y documento de identidad.
- **Documento jurídico o natural:** se distingue si el administrador es una **organización** (jurídico) o una **persona** (natural), con su número de documento.
- **Se captura al registrarse:** cuando alguien se registra como administrador, completa estos datos en el mismo momento; así el **superadministrador** los tiene a la vista para revisar antes de aprobar la cuenta.
- **Editable después:** una vez aprobado, el administrador puede ver y actualizar su perfil cuando lo necesite.
- **Base para sus puntos de acopio:** como cada administrador puede tener uno o varios puntos físicos de entrega, esos puntos parten por defecto del mismo estado y parroquia del perfil, evitando volver a escribir la ubicación.

## Por qué importa

Da **confianza y ubicación** a la red. El superadministrador necesita datos concretos para decidir si aprueba una cuenta de administrador, y la plataforma necesita saber dónde está cada centro de acopio para organizar la ayuda. Sin este perfil, un administrador sería solo un correo y una contraseña, sin forma de saber quién es ni desde dónde opera.

## Qué queda fuera (por ahora)

- La **gestión de los puntos de acopio** en sí (dirección exacta, horarios, qué reciben) llega en una etapa posterior; aquí solo se establece que cada administrador puede tener puntos y que estos heredan su ubicación.
- El **registro público de administradores y su aprobación por el superadministrador** se construyen en la etapa previa; esta etapa se apoya en ellos para capturar y mostrar el perfil.
- No se comprueba el documento contra registros oficiales: se captura y lo revisa una persona al aprobar la cuenta.

## Resultado para el cliente

Al terminar, **cada administrador queda registrado como un centro de acopio con nombre, ubicación, contacto y documento**, listos para que el superadministrador los revise al aprobar y para que la red sepa desde dónde opera cada quien. Es el paso que convierte a los administradores en centros de acopio identificables y confiables.
