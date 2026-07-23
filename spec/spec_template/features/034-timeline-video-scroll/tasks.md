# 034 · Prueba de timeline con video controlado por scroll · Tareas

## Documentación

- [x] Spec y resumen de cliente aprobados.
- [x] Plan técnico creado.

## Implementación

- [x] Crear la ruta pública `/test` con metadata.
- [x] Extraer 216 fotogramas WebP a `public/videos/timeline-frames/` (24 fps, recortando la carga duplicada del original).
- [x] Crear el componente cliente con canvas sticky, precarga y scrubbing suavizado bidireccional.
- [x] Suavizar con Lenis (`SmoothScroll`), interpolación y mezcla entre fotogramas.
- [x] Anclar el scroll por escenas con Lenis Snap (etapas + cierre), off en movimiento reducido.
- [x] Añadir las tres etapas textuales fundidas y el cierre de la secuencia.
- [x] Añadir estados de carga con porcentaje, error y reduced motion.
- [x] Garantizar layout responsive sin scroll horizontal y contraste AA sobre escena clara.

## Pruebas y cierre

- [x] Cubrir las matemáticas del timeline con Vitest (progreso, fotograma, interpolación).
- [x] Ejecutar `pnpm test`.
- [x] Ejecutar `pnpm lint`.
- [x] Ejecutar `pnpm build`.
- [ ] Actualizar el estado de la feature y el roadmap.

