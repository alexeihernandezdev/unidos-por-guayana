# Feature 026 · Guía de diseño y layout consistente del espacio logeado

_Documento de cliente. Explica en lenguaje llano qué aporta esta feature y por qué. El detalle técnico vive en `spec/features/026-guia-de-diseno-y-layout-consistente/`._

---

## En una frase

Hacer que **todas las pantallas de trabajo** (las que se ven al iniciar sesión) tengan el **mismo aspecto**: mismos márgenes, mismo ancho, mismos títulos y el mismo estilo de encabezado que ya tiene "Puntos de acopio", que es el que gusta.

## Qué aporta

Hoy las secciones internas "parecen hechas por manos distintas": unas tienen más margen que otras, los títulos cambian de tamaño, y solo un par de pantallas ("Puntos de acopio" y "Mi perfil") lucen un encabezado destacado, mientras el resto usa un título plano. Esta feature ordena todo eso:

- **Un mismo marco para todas las pantallas** — mismo margen, mismo ancho y mismo ritmo entre bloques en cada sección del panel. Se acaba la sensación de que cada página sigue sus propias reglas.
- **El estilo que te gusta, en todas partes** — el encabezado destacado de "Puntos de acopio" (con su icono y su descripción) pasa a ser el estándar de las pantallas principales de cada sección.
- **Encabezado más sobrio en las pantallas de detalle y formularios** — cuando entras a crear o editar algo, el encabezado es más ligero (título y un "volver"), para no recargar y dejar el foco en lo que estás completando.
- **Los listados se ven como en "Puntos de acopio"** — hoy la mayoría de las listas (recursos, actividades, solicitudes, aportes, donaciones…) se muestran como tablas, y Puntos de acopio las muestra como tarjetas en fila (con su icono, su etiqueta de estado y sus datos), que además se leen bien en el móvil. Todas las listas pasan a ese mismo estilo, sin perder ningún dato ni acción.
- **Una guía de diseño escrita** — se documenta una sola vez cómo deben verse las páginas (márgenes, tamaños, encabezados, listas), para que todo lo que se construya de aquí en adelante nazca consistente y no vuelva a divergir.

## Por qué importa

La consistencia es lo que hace que un producto se sienta **cuidado y confiable**, incluso sin cambiar el contenido. Cuando cada pantalla respeta los mismos márgenes y el mismo estilo de título, la herramienta se lee como una sola pieza y es más fácil de usar. Además, al centralizar el diseño en una guía y en componentes reutilizables, un cambio futuro ("subir un poco el margen de todo el panel") se hace **una vez**, no pantalla por pantalla.

## Qué queda fuera (por ahora)

- **No se rediseña el contenido** — las tablas, formularios, mapas y textos de cada pantalla se conservan; solo cambia el marco que los rodea.
- **No cambia lo que cada rol puede hacer** — sin cambios de permisos, datos ni direcciones.
- **Las páginas públicas no se tocan** — la página de bienvenida, el tablero de transparencia y las pantallas de inicio de sesión tienen su propio lenguaje y quedan como están.
- **Sin modo oscuro ni temas** — la guía documenta el modo claro actual.

## Resultado para el cliente

Al terminar, recorrer el panel (como administrador, colaborador, solicitante o superadministrador) se siente **uniforme**: mismos márgenes, mismos títulos y el estilo de "Puntos de acopio" en todas las secciones principales. La herramienta se percibe más profesional y ordenada, y queda una guía escrita para que las próximas pantallas se mantengan alineadas.
