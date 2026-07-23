# 034 · Prueba de timeline con video controlado por scroll

> Estado: **Especificada** · Depende de: `003 · Landing` · Ruta experimental: `/test`

## Qué hace

Añade una página pública y aislada en `/test` para validar una experiencia narrativa donde una
secuencia de imágenes derivada de `public/videos/timeline.mp4` permanece fijada al viewport y
avanza o retrocede fotograma a fotograma según la posición de scroll del usuario.

La prueba representa tres momentos del proceso logístico: **Caja abierta**, **Caja preparada** y
**Envío en camino**. Los textos avanzan sobre el video mientras la posición del scroll se traduce
de forma continua al tiempo de reproducción.

## Por qué

El proyecto necesita validar si una animación de empaque y envío puede comunicar el proceso
logístico de forma clara y memorable antes de incorporarla a una página pública definitiva. Una
ruta de prueba permite medir fluidez, legibilidad, comportamiento móvil y coste de descarga sin
alterar la landing ni otros recorridos existentes.

## Decisiones tomadas

- **Ruta aislada:** la experiencia vive únicamente en `/test`, oculta el header global para ocupar
  el viewport completo y no modifica la navegación ni la landing de producción.
- **Scrubbing fotograma a fotograma:** se descartó escribir `currentTime` sobre un `<video>` H.264
  porque el decodificador salta al keyframe más cercano y el scrubbing se veía a tirones. En su
  lugar, `public/videos/timeline.mp4` se convierte a una secuencia de 216 imágenes WebP a 1280px y
  24 fps (`public/videos/timeline-frames/`) que se dibujan en un `<canvas>`. Cada fotograma ya está
  decodificado, así que el desplazamiento es fluido y determinista.
- **Recorte del original:** el MP4 generado por IA repetía la carga de la caja en la furgoneta con
  dos tomas; se eliminó la toma en primer plano duplicada para que la narración avance una sola vez.
- **Suavizado del scroll:** se reutiliza `SmoothScroll` (Lenis, ya en la landing) para dar inercia
  al gesto; el progreso de scroll define un fotograma objetivo y un bucle de `requestAnimationFrame`
  interpola el fotograma actual hacia él. Además, el dibujo mezcla el fotograma base con el siguiente
  según la parte fraccional, eliminando el "escalón" entre imágenes.
- **Anclaje por escenas:** con el módulo `Snap` de Lenis (`lenis/snap`, sin dependencias nuevas), al
  soltar el scroll la vista se asienta en el punto de reposo de cada etapa y en el cierre, de modo que
  la narración avanza escena por escena reproduciendo los fotogramas intermedios. Se desactiva con
  movimiento reducido.
- **Escena fijada:** el canvas ocupa el viewport mediante una capa sticky dentro de una sección de
  scroll extendida. Al terminar la sección, la página continúa con normalidad.
- **Legibilidad sobre escena clara:** la grabación es de estudio y casi blanca, por lo que el texto
  es oscuro (`--foreground`) con acentos `--primary` y un velo tonal del color de fondo desde el
  borde inferior que garantiza contraste AA sin ensuciar la imagen.
- **Dependencias existentes:** se aprovecha Motion, ya instalado, para observar el progreso de
  scroll y fundir los rótulos. La secuencia de imágenes se genera una sola vez con una herramienta
  descartable (no se añaden paquetes al repositorio) y se sirve como activos estáticos.
- **Composición:** `src/app/test/page.tsx` mantiene la ruta fina y compone un componente cliente de
  `src/modules/landing/ui` que encapsula la reproducción y el scroll.
- **Accesibilidad:** con `prefers-reduced-motion: reduce` no se fuerza el scrubbing; se presenta una
  escena estática legible con el contenido textual disponible.
- **Video decorativo:** el elemento no tiene audio, usa `muted` y `playsInline`, queda fuera del
  foco y no sustituye la información comunicada por los textos.

## Alcance

**Incluye**

- Ruta pública `/test`.
- Escena a pantalla completa y fijada durante la secuencia, dibujada en un `<canvas>`.
- Secuencia de 216 fotogramas WebP servidos como activos estáticos.
- Scrubbing bidireccional y suavizado (Lenis + interpolación + mezcla entre fotogramas).
- Anclaje por escenas al soltar el scroll (Lenis Snap), desactivado con movimiento reducido.
- Tres etapas textuales visibles y semánticas que se funden en su lugar.
- Estado de carga con porcentaje mientras se precargan los fotogramas y estado de error si la
  secuencia no está disponible.
- Diseño responsive desde 320 px, usando `100dvh` y recorte tipo `cover` calculado en el canvas.
- Contraste AA entre el texto oscuro y la escena clara mediante un velo tonal discreto.
- Respeto de `prefers-reduced-motion` con una escena estática y los tres textos legibles.
- Limpieza de suscripciones, observadores y cuadros de animación al desmontar el componente.

**No incluye**

- Integración en la landing u otra ruta de producción.
- Panel de administración, datos dinámicos o persistencia.
- Controles tradicionales de reproducción, audio o reproducción autónoma.
- Scrubbing directo de `currentTime` sobre `<video>` (descartado por los saltos entre keyframes).
- Generación de la secuencia en tiempo de ejecución o en el pipeline de build.
- Nuevas dependencias en el repositorio.

## Flujo de interacción

1. El usuario entra a `/test`, ve el primer fotograma en cuanto carga y un indicador de progreso
   mientras se precarga el resto de la secuencia.
2. Al desplazarse por la sección, su progreso entre 0 y 1 determina el fotograma objetivo entre el
   primero y el último de la secuencia.
3. La escena permanece fijada y los tres mensajes se funden en sus respectivos tramos.
4. Si el usuario desplaza hacia arriba, la animación retrocede de forma equivalente.
5. Al finalizar la sección, la escena deja de estar fijada y aparece un cierre breve de la prueba.

## Manejo de fallos y degradación

- Mientras se precarga la secuencia, el primer fotograma disponible y una superficie de carga con
  porcentaje permanecen visibles.
- Si la secuencia falla, se muestra una superficie estática con el título y las tres etapas; la
  página sigue siendo comprensible.
- Si el usuario solicita movimiento reducido, no se ejecuta el bucle de scrubbing: se dibuja un
  fotograma estático y los tres textos se listan de forma legible.
- La implementación tolera fotogramas aún no cargados (usa el más cercano disponible), valores no
  finitos y cambios de viewport sin producir errores de ejecución.

## Criterios de aceptación

- [ ] `/test` carga sin autenticación y sin modificar la landing.
- [ ] La escena usa la secuencia `/videos/timeline-frames/frame_NNN.webp` dibujada en un `<canvas>`.
- [ ] Mientras se recorre la sección, la escena permanece fijada al viewport.
- [ ] El inicio del tramo corresponde al primer fotograma y el final al último de la secuencia.
- [ ] Desplazarse hacia arriba hace retroceder la animación.
- [ ] Se muestran las etapas «Caja abierta», «Caja preparada» y «Envío en camino» en orden.
- [ ] Los textos mantienen contraste WCAG AA sobre la escena clara.
- [ ] La ruta no produce scroll horizontal desde 320 px.
- [ ] En móvil se usa la altura dinámica del viewport.
- [ ] Con movimiento reducido, la información permanece disponible sin scrubbing continuo.
- [ ] Un fallo al cargar la secuencia muestra un fallback comprensible y no rompe la página.
- [ ] No se añaden dependencias ni lógica de dominio.
- [ ] `pnpm lint`, `pnpm test` y `pnpm build` finalizan sin errores atribuibles a la feature.

## Riesgos y mitigaciones

- **Peso de la secuencia:** 216 fotogramas WebP a 1280px suman ~4,5 MB. Se precargan en segundo
  plano tras mostrar el primer fotograma; antes de producción conviene revisar el número y tamaño
  de fotogramas para conexiones móviles.
- **Memoria del cliente:** mantener 216 imágenes decodificadas tiene coste; se limita el `devicePixelRatio`
  a 2 y se dibuja en un único canvas. Un recuento mayor requeriría descarga bajo demanda.
- **Recorte vertical:** el sujeto principal debe permanecer en una zona central segura porque el
  dibujo tipo `cover` recorta distinto en pantallas verticales.
- **Fotogramas aún no cargados:** el dibujo cae al fotograma cargado más cercano, evitando huecos
  durante la precarga.
- **Costo del scrubbing:** un solo bucle de `requestAnimationFrame` interpola hacia el objetivo y se
  detiene al alcanzarlo, evitando trabajo por cuadro cuando la escena está en reposo.
