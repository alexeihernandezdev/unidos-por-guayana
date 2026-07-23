# 034 · Prueba de timeline con video controlado por scroll · Plan

> Implementación de `spec.md` sin dependencias nuevas. La ruta permanece aislada en `/test`.

## Enfoque

1. Mantener `src/app/test/page.tsx` como Server Component estático con metadata propia.
2. Extraer una vez `public/videos/timeline.mp4` a 24 fps y recortar la toma de carga duplicada,
   dejando 216 fotogramas WebP a 1280px en `public/videos/timeline-frames/` con una herramienta
   descartable (no se añade nada al repo).
3. Envolver `/test` con `SmoothScroll` (Lenis, ya existente) para dar inercia al gesto y encapsular
   los APIs del navegador, Motion y el `<canvas>` en `src/modules/landing/ui/TimelineScrollVideo.tsx`.
4. Traducir `scrollYProgress` a un fotograma objetivo e interpolar el fotograma actual hacia él en un
   único bucle de `requestAnimationFrame`, guardando valores transitorios en refs para evitar renders
   por scroll. Dibujar con recorte tipo `cover` y mezclar el fotograma base con el siguiente según la
   parte fraccional para un movimiento continuo.
5. Presentar tres etapas semánticas que se funden en su lugar sobre una escena sticky.
6. Degradar a una escena estática con contenido legible en reduced motion o error de carga.
7. Probar las funciones puras de normalización, mapeo de fotograma e interpolación, y validar la app.

## Archivos

- `src/app/test/page.tsx`: ruta pública estática y metadata.
- `src/modules/landing/ui/TimelineScrollVideo.tsx`: canvas, precarga, scroll, estados y presentación.
- `src/modules/landing/ui/timelineScroll.ts`: matemáticas puras (progreso, fotograma, interpolación).
- `src/modules/landing/ui/timelineScroll.test.ts`: cobertura de límites, mapeo e interpolación.
- `public/videos/timeline-frames/frame_001..216.webp`: secuencia de imágenes servida como estática.

## Rendimiento

- Un solo listener de Motion y un solo bucle de animación que se detiene en reposo.
- Progreso y fotograma objetivo/actual en refs; sin estado React por cuadro.
- Precarga en segundo plano tras mostrar el primer fotograma; dibujo del fotograma cargado más cercano.
- `devicePixelRatio` acotado a 2 y redibujo mediante `ResizeObserver`.
- Cancelación del cuadro pendiente y del observador al desmontar.

## Validación

- `pnpm test`
- `pnpm lint`
- `pnpm build`
- Revisión manual de `/test` en desktop mediante capturas a distintas alturas de scroll (hecha).
