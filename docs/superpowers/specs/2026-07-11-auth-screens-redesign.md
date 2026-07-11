# Rediseño de pantallas de autenticación

## Objetivo

Rediseñar `/login` y `/registro` para que compartan una experiencia visual reconocible como parte de Unidos por la Guaira. La pantalla debe transmitir coordinación comunitaria y confianza, facilitar la lectura de formularios y conservar intacta la lógica actual de autenticación, registro, roles y validación.

## Dirección visual

La interfaz seguirá una dirección editorial documental inspirada en la landing. En escritorio se dividirá en un panel fotográfico y un panel funcional. La fotografía mostrará ayuda comunitaria real y tendrá un tratamiento cinematográfico sobrio que preserve su contenido. El formulario se presentará directamente sobre un fondo claro, sin una tarjeta flotante.

### Tokens de referencia

- Petróleo: `#126B69`, para acciones y foco.
- Ocre: `#C8933F`, usado como firma de marca.
- Carbón: `#202122`, para texto principal.
- Blanco frío: `#F7FAF9`, para el plano funcional.
- Gris de borde: `#DDE4E2`, para divisores y campos.
- EB Garamond: títulos y frase editorial.
- Geist: controles, etiquetas y texto funcional.
- Geist Mono: referencia territorial discreta.

Los valores finales deben reutilizar los tokens CSS existentes siempre que exista un equivalente, evitando duplicar el sistema de color.

## Composición

### Escritorio

La pantalla utilizará una división aproximada de `46/54`:

```text
┌──────────────────────────┬────────────────────────────────┐
│ fotografía documental    │ marca / volver                │
│                          │                                │
│ frase editorial          │ título                        │
│ línea ocre vertical      │ descripción                   │
│ La Guaira · Venezuela    │ formulario                    │
│                          │ enlace de flujo alternativo   │
└──────────────────────────┴────────────────────────────────┘
```

El panel fotográfico permanecerá estable mientras el formulario de registro puede desplazarse. El login se centrará verticalmente dentro de su panel. El encabezado global no debe duplicar innecesariamente la navegación de autenticación; la composición tendrá una salida clara hacia el inicio.

### Móvil

La imagen pasa a ser una cabecera de entre `180px` y `220px`, seguida del formulario en flujo normal. No habrá alturas fijas que impidan acceder a controles. Las agrupaciones de dos columnas se convertirán en una sola cuando el ancho disponible no garantice etiquetas y campos legibles.

## Firma visual

Una línea ocre vertical conectará una frase breve sobre coordinación comunitaria con la referencia `La Guaira · Venezuela`. Este será el único gesto decorativo dominante. El resto de la pantalla será tipográficamente preciso y visualmente tranquilo.

## Componentes

- `AuthShell`: estructura compartida para fotografía, identidad, contenido y comportamiento responsive.
- `AuthVisualPanel`: imagen optimizada con `next/image`, overlay de contraste, frase editorial y referencia territorial.
- Páginas `/login` y `/registro`: proporcionan título, descripción, mensajes de estado, formulario y enlace al flujo alternativo.
- `LoginForm` y `RegistroForm`: conservan sus contratos actuales y reciben únicamente ajustes visuales y de ergonomía.
- Control de contraseña: botón con icono familiar, nombre accesible y estado mostrar/ocultar. No modifica el valor ni la validación del campo.

Los componentes compartidos deben mantenerse dentro del módulo de usuarios o de una frontera de autenticación específica, sin introducir dependencias desde el dominio hacia la UI.

## Movimiento

Al cargar, el panel visual aparecerá con una transición corta y el contenido funcional entrará después con un desplazamiento vertical mínimo. Las transiciones durarán aproximadamente entre `400ms` y `550ms` usando la curva existente `--ease-out-emil`.

Los botones tendrán una respuesta breve de presión y los campos una transición de foco clara. No habrá carruseles, fondos en movimiento ni animaciones repetitivas. Con `prefers-reduced-motion: reduce`, la composición aparecerá sin transformaciones ni secuencias.

## Contenido y estados

- Login mantiene los mensajes de cuenta creada y cuenta de administrador pendiente.
- Registro mantiene los tres roles, sus campos condicionales y el aviso de aprobación para administradores.
- Los errores de campo permanecen asociados al control correspondiente.
- Los errores del servidor usan `role="alert"` y los estados informativos usan `role="status"`.
- Durante el envío, el botón conserva su estado deshabilitado y una etiqueta que describe la acción en curso.
- El flujo alternativo entre login y registro permanece visible al final del contenido.

## Accesibilidad

- Contraste mínimo WCAG AA para texto y controles.
- Foco visible en todos los elementos interactivos.
- Orden de tabulación equivalente al orden visual.
- Texto alternativo de la fotografía contextual, o vacío si la misma información ya está expresada junto a ella.
- Botones de icono con nombre accesible y tooltip cuando sea útil.
- La imagen no debe competir con el contenido ni provocar saltos de layout.

## Límites

Incluye la presentación de `/login`, `/registro`, sus formularios y los estilos compartidos necesarios. No incluye cambios en credenciales, NextAuth, server actions, reglas de negocio, recuperación de contraseña, verificación de correo ni nuevos pasos de onboarding.

## Criterios de aceptación

1. Login y registro comparten una estructura visual documental coherente con la landing.
2. En escritorio hay un panel fotográfico y un panel funcional claramente diferenciados.
3. En móvil, imagen y formulario se apilan sin contenido cortado ni desplazamiento horizontal.
4. El registro largo puede recorrerse por completo y todos los campos condicionales siguen funcionando.
5. Login, mensajes de registro y errores conservan su comportamiento actual.
6. Las contraseñas pueden mostrarse u ocultarse mediante un control accesible.
7. Las animaciones respetan `prefers-reduced-motion`.
8. La interfaz pasa lint y build, y se verifica visualmente en escritorio y móvil.

## Validación

- Ejecutar el lint dirigido a `src`.
- Ejecutar las pruebas relacionadas con usuarios si los cambios afectan componentes cubiertos.
- Ejecutar el build de producción.
- Revisar `/login` y `/registro` en viewport de escritorio y móvil.
- Comprobar estados vacío, error de validación, error de servidor, envío y campos por rol.
- Confirmar que no existe solapamiento, recorte de texto ni cambio de layout causado por la imagen.
