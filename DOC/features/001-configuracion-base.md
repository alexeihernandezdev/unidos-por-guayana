# Feature 001 · Configuración base

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/001-configuracion-base/`._

---

## En una frase

Preparar los cimientos técnicos del proyecto para poder construir, a partir de aquí, las funcionalidades que usará la gente (envíos, aportes, solicitudes…).

## Qué aporta

Esta primera etapa **no tiene pantallas visibles para el usuario final**: es la puesta a punto del "taller" donde se construirá la plataforma. Deja listo:

- **La base de datos** — el lugar donde se guardará toda la información (envíos, aportes, usuarios…), funcionando tanto en las máquinas de desarrollo como en la nube.
- **Un entorno de trabajo reproducible** — cualquier persona del equipo puede levantar el proyecto en su computadora de la misma forma, sin instalaciones manuales complicadas, gracias a Docker.
- **Las herramientas base** — las librerías con las que se construirán los formularios, las pantallas y la conexión con la información, ya instaladas y probadas.
- **Una forma de verificar la calidad** — un sistema de pruebas automáticas que ayuda a detectar errores temprano.
- **La organización interna del código** — una estructura ordenada que hace el proyecto más fácil de mantener y escalar.

## Por qué importa

Invertir en una base sólida al inicio hace que **todo lo que venga después sea más rápido, más seguro y más barato de construir**. Evita improvisaciones, reduce errores y permite que varias personas trabajen sin pisarse. Es el equivalente a preparar bien los cimientos antes de levantar las paredes.

## Qué queda fuera (por ahora)

- No incluye todavía ninguna pantalla ni funcionalidad de uso (eso empieza en las siguientes etapas: acceso por roles, página de bienvenida, envíos, etc.).
- No crea aún la estructura concreta de la información (los "envíos", "aportes" y demás se definen cuando se construya cada módulo).

## Resultado para el cliente

Al terminar esta etapa, **la plataforma tiene bases técnicas listas y verificadas**: el equipo puede empezar a construir funcionalidades reales sobre un terreno firme y ordenado.
