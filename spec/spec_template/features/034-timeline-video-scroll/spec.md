# 034 · Prueba de timeline con video controlado por scroll

> Estado: **Especificada** · Depende de: `003 · Landing` · Ruta experimental: `/test`

## Qué hace

Añade una página pública y aislada en `/test` para validar una experiencia narrativa donde el
video `public/videos/timeline.mp4` permanece fijado al viewport y avanza o retrocede según la
posición de scroll del usuario.

La prueba representa tres momentos del proceso logístico: **Caja abierta**, **Caja preparada** y
**Envío en camino**. Los textos avanzan sobre el video mientras la posición del scroll se traduce
de forma continua al tiempo de reproducción.

## Por qué

El proyecto necesita validar si una animación de empaque y envío puede comunicar el proceso
logístico de forma clara y memorable antes de incorporarla a una página pública definitiva. Una
ruta de prueba permite medir fluidez, legibilidad, comportamiento móvil y coste de descarga sin
alterar la landing ni otros recorridos existentes.

## Decisiones tomadas

- **Ruta aislada:** la experiencia vive únicamente en `/test` y no modifica la navegación ni la
  landing de producción.
- **Scrubbing nativo:** se usa un elemento `<video>` con MP4 H.264. El progreso de scroll de la
  sección se convierte en `currentTime` del video.
- **Video fijado:** la escena ocupa el viewport mediante una capa sticky dentro de una sección de
  scroll extendida. Al terminar la sección, la página continúa con normalidad.
- **Actualización suavizada:** el controlador aproxima el tiempo visible al tiempo objetivo dentro
  de `requestAnimationFrame`, evitando escrituras de tiempo innecesarias y saltos bruscos.
- **Dependencias existentes:** se aprovecha Motion, ya instalado, para observar el progreso de
  scroll. No se añaden paquetes.
- **Composición:** `src/app/test/page.tsx` mantiene la ruta fina y compone un componente cliente de
  `src/modules/landing/ui` que encapsula la reproducción y el scroll.
- **Accesibilidad:** con `prefers-reduced-motion: reduce` no se fuerza el scrubbing; se presenta una
  escena estática legible con el contenido textual disponible.
- **Video decorativo:** el elemento no tiene audio, usa `muted` y `playsInline`, queda fuera del
  foco y no sustituye la información comunicada por los textos.

## Alcance

**Incluye**

- Ruta pública `/test`.
- Video a pantalla completa y fijado durante la secuencia.
- Scrubbing bidireccional vinculado al scroll.
- Tres etapas textuales visibles y semánticas.
- Estado inicial mientras cargan los metadatos y estado de error si el video no está disponible.
- Diseño responsive desde 320 px, usando `100dvh` y recorte controlado con `object-fit: cover`.
- Contraste suficiente entre texto y video mediante una capa tonal discreta.
- Respeto de `prefers-reduced-motion`.
- Limpieza de suscripciones y cuadros de animación al desmontar el componente.

**No incluye**

- Integración en la landing u otra ruta de producción.
- Panel de administración, datos dinámicos o persistencia.
- Controles tradicionales de reproducción, audio o reproducción autónoma.
- Generación automática de versiones optimizadas del MP4.
- Secuencia de imágenes o canvas como alternativa.
- Nuevas dependencias.

## Flujo de interacción

1. El usuario entra a `/test` y ve la primera escena mientras cargan los metadatos.
2. Al desplazarse por la sección, su progreso entre 0 y 1 determina el tiempo objetivo entre 0 y la
   duración total del video.
3. El video permanece fijado y los tres mensajes aparecen en sus respectivos tramos.
4. Si el usuario desplaza hacia arriba, la animación retrocede de forma equivalente.
5. Al finalizar la sección, el video deja de estar fijado y aparece un cierre breve de la prueba.

## Manejo de fallos y degradación

- Antes de conocer la duración, la primera escena o superficie de carga permanece visible.
- Si el video falla, se muestra una superficie estática con el título y las tres etapas; la página
  sigue siendo comprensible.
- Si el usuario solicita movimiento reducido, se evita sincronizar `currentTime` continuamente.
- La implementación tolera duraciones desconocidas, valores no finitos y cambios de viewport sin
  producir errores de ejecución.

## Criterios de aceptación

- [ ] `/test` carga sin autenticación y sin modificar la landing.
- [ ] El video usa `/videos/timeline.mp4`, está silenciado, se reproduce inline y no muestra
      controles nativos.
- [ ] Mientras se recorre la sección, el video permanece fijado al viewport.
- [ ] El inicio del tramo corresponde aproximadamente al inicio del video y el final al último
      fotograma disponible.
- [ ] Desplazarse hacia arriba hace retroceder el video.
- [ ] Se muestran las etapas «Caja abierta», «Caja preparada» y «Envío en camino» en orden.
- [ ] Los textos mantienen contraste WCAG AA sobre la escena.
- [ ] La ruta no produce scroll horizontal desde 320 px.
- [ ] En móvil se usa la altura dinámica del viewport y el video se reproduce inline.
- [ ] Con movimiento reducido, la información permanece disponible sin scrubbing continuo.
- [ ] Un fallo al cargar el MP4 muestra un fallback comprensible y no rompe la página.
- [ ] No se añaden dependencias ni lógica de dominio.
- [ ] `pnpm lint`, `pnpm test` y `pnpm build` finalizan sin errores atribuibles a la feature.

## Riesgos y mitigaciones

- **Saltos al buscar en el MP4:** dependen de la frecuencia de keyframes. Se recomienda H.264 sin
  audio, fast-start y keyframes cada 0,25 a 0,5 segundos.
- **Peso en conexiones móviles:** el activo debe comprimirse y, antes de producción, conviene crear
  una variante móvil de aproximadamente 720p.
- **Recorte vertical:** el sujeto principal debe permanecer en una zona central segura porque
  `object-fit: cover` recorta distinto en pantallas verticales.
- **Políticas de iOS:** `muted` y `playsInline` son obligatorios. El fallback cubre navegadores que
  no entreguen fotogramas durante búsquedas antes de una interacción.
- **Costo de escrituras a `currentTime`:** se limita a un ciclo de animación y se evita actualizar
  cuando la diferencia con el tiempo objetivo es insignificante.

