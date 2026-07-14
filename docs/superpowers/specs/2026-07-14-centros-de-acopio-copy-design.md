# Cambio de nomenclatura visible: Centros de Acopio

## Objetivo

Sustituir la denominación visible «Punto de Acopio» / «Puntos de Acopio» por «Centro de Acopio» / «Centros de Acopio» en toda la aplicación, para que la interfaz use la nomenclatura solicitada por el cliente de forma consistente.

## Alcance

- Cambiar títulos de página, navegación, pestañas, botones, encabezados, textos de ayuda, estados vacíos, filtros, etiquetas accesibles y mensajes de error que pueda ver una persona usuaria.
- Cambiar metadatos SEO visibles asociados a las páginas del directorio y del panel.
- Usar singular o plural según el contexto y respetar la capitalización propia de cada frase.
- Incluir los textos visibles del registro, actividades, afiliaciones, landing y gestión de acopio.

## Fuera de alcance

- No cambiar rutas como `/puntos-acopio`.
- No renombrar archivos, componentes, funciones, variables, tipos, modelos Prisma ni tablas.
- No alterar comentarios internos, documentación histórica, nombres de features ni contratos de datos.
- No cambiar lógica, permisos, persistencia ni comportamiento de la aplicación.

## Implementación

Se editarán únicamente literales de interfaz y metadatos dentro de `src/`. La entidad técnica seguirá siendo `PuntoAcopio`; «Centro de Acopio» será su nombre de presentación.

## Validación

1. Buscar en `src/` todas las variantes de «punto(s) de acopio» y confirmar que cualquier aparición restante sea exclusivamente técnica o un comentario interno.
2. Revisar singular, plural, concordancia y capitalización de los textos modificados.
3. Ejecutar lint sobre los archivos afectados y el build del proyecto.

## Criterios de aceptación

- La interfaz no muestra «Punto de Acopio» ni «Puntos de Acopio» en ninguna variante de mayúsculas.
- Todos los lugares equivalentes muestran «Centro de Acopio» o «Centros de Acopio» según corresponda.
- Las rutas y contratos técnicos existentes continúan funcionando sin cambios.
- Lint y build finalizan correctamente, salvo fallos preexistentes documentados.
