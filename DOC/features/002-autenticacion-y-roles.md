# Feature 002 · Autenticación y roles

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/002-autenticacion-y-roles/`._

---

## En una frase

Permitir que las personas **se registren, inicien sesión** y que cada quien vea y haga **solo lo que le corresponde** según su rol.

## Qué aporta

Esta etapa abre la puerta de entrada a la plataforma y establece las reglas de "quién puede hacer qué":

- **Registro** — una persona se da de alta con su correo y una contraseña, y elige si participa como **Colaborador** (quiere aportar ayuda) o **Solicitante** (necesita pedir ayuda).
- **Inicio y cierre de sesión** — acceso seguro con correo y contraseña.
- **Roles y permisos** — la plataforma reconoce tres tipos de usuario (**Administrador**, **Colaborador**, **Solicitante**) y habilita a cada uno solo las acciones que le tocan.
- **Seguridad de las contraseñas** — nunca se guardan tal cual: se almacenan de forma cifrada.

El rol de **Administrador** no se puede elegir libremente al registrarse (es una figura de gestión y confianza): se asigna de forma controlada.

## Por qué importa

Es la base de **confianza y orden** de toda la plataforma. Sin ella, no habría forma de saber quién es cada persona ni de proteger las decisiones importantes (como crear o gestionar envíos, que solo debe poder hacer el administrador). Todas las funcionalidades siguientes se apoyan en esta.

## Qué queda fuera (por ahora)

- La **verificación de usuarios** (dar un sello de confianza a quien aporta camiones o pide ayuda) llega en una etapa posterior; aquí todos entran como "pendientes de verificar" sin que eso les impida usar la plataforma.
- Recuperación de contraseña, confirmación por correo o ingreso con redes sociales no entran en esta etapa.
- Las pantallas de negocio (bienvenida, panel de administración, envíos…) se construyen en etapas siguientes; aquí solo se entrega el acceso y una protección demostrable.

## Resultado para el cliente

Al terminar, **la plataforma tiene un acceso seguro y por roles**: las personas pueden registrarse e iniciar sesión, y cada rol queda limitado a lo suyo, dejando el terreno listo para construir las funcionalidades reales sobre una base segura.
