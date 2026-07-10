# Feature 017 · Datos de contacto obligatorios (colaborador y solicitante)

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/spec_template/features/017-datos-de-contacto-obligatorios/`._

---

## En una frase

Pedirle a cada **colaborador** y **solicitante** su **cédula**, **teléfono** y **ubicación** al registrarse, con un flag de **WhatsApp** para saber por qué canal contactarlo.

## Qué aporta

Hasta ahora un colaborador o solicitante podía registrarse solo con nombre, correo y contraseña. El administrador no tenía forma de saber quién estaba detrás ni cómo contactarlo. Con esta etapa:

- **Cédula obligatoria**: se pide el documento de identidad venezolano (con prefijo `V`, `E` o `J`). Se valida el formato, se guarda normalizado y **no se admiten cédulas repetidas** entre cuentas.
- **Teléfono obligatorio**: número venezolano de 11 dígitos, validado por operadora (móviles `0412`, `0414`, `0416`, `0424`, `0426` y fijos por código de área). Acepta `+58` y separadores en la entrada; se guarda solo con dígitos.
- **WhatsApp sí/no**: al lado del teléfono, una casilla indica si ese número recibe WhatsApp. Sirve tanto al administrador (para saber cómo contactar) como al centro de acopio en su perfil.
- **Ubicación**: estado y parroquia del colaborador o solicitante, del mismo modo que el centro de acopio ya declara la suya. Habilita filtrar por zona y coordinar logística.
- **Simetría para el administrador**: el registro público del administrador también incluye el mismo flag de WhatsApp para su teléfono de contacto (se guarda en su perfil de centro de acopio).
- **Cuentas antiguas**: los usuarios ya registrados sin estos datos son redirigidos a una pantalla obligatoria de **Completar perfil** al iniciar sesión; no pueden operar hasta rellenarla.
- **Mi perfil**: colaboradores y solicitantes pueden **editar** su contacto y ubicación en cualquier momento desde `/mi-perfil` (enlazado en el menú de usuario).

## Por qué importa

Para poder **confiar** en quien aporta ayuda o pide ayuda, el administrador necesita saber a **quién** contacta y **dónde** está. Sin cédula ni teléfono no hay verificación posible (la verificación real la aborda una etapa posterior); sin ubicación, no hay logística fina. Esta feature es el prerrequisito de datos para toda la parte de confianza y coordinación.

## Qué queda fuera (por ahora)

- La **verificación real** de que la cédula y el teléfono corresponden a la persona: aquí solo se valida el **formato** y la **unicidad**, no la existencia del documento.
- **Catálogo cerrado** de estados y parroquias: por ahora se guardan como texto libre, igual que ya lo hace el centro de acopio del administrador. Si el cliente lo pide, se cambiará a un catálogo sin re-migrar los datos.
- Cambiar **email** o **contraseña** desde `/mi-perfil`: fuera de alcance.
- Cargar la **foto de la cédula** para verificación por el administrador: es parte de la etapa de verificación, no de esta captura de datos.
