# 009 · Tablero público de transparencia — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server components, `revalidate`/
      ISR, `generateMetadata`, `notFound`) y repasar los módulos 005/006 y las agregaciones de 008.
- [x] Levantar la base: `docker compose up -d`. Requiere datos de prueba (envíos en varios estados,
      metas, aportes `RECIBIDO`/`COMPROMETIDO`, algún recurso `MONETARIO`) para validar a ojo.

## 1. Verificaciones previas (sin cambios de schema)

- [x] Comprobar que existen los índices necesarios: `Ayuda(estado)`, `Ayuda(fecha)`,
      `Aporte(ayudaId, recursoId, estado)`. Si falta alguno, **añadirlo en el módulo dueño**, no en
      `transparencia/`.

## 2. Lecturas agregadas en módulos dueños (solo si faltan)

### 005 · Ayudas
- [x] `listarEnviosPublicos(deps)` (application): todos los envíos con su `porcentaje`, ordenados por
      `fecha` desc. Reutilizar/generalizar `listarPrioridadRecolectando` (008) o componer con
      `progresoDeAyuda` (006).
- [x] Test unitario.

### 006 · Aportes
- [x] `recolectadoPorRecurso(deps)` (application): suma de aportes `RECIBIDO` agrupada por recurso;
      `MONETARIO` agrupado además por moneda.
- [x] Confirmar que `progresoDeAyuda(deps, ayudaId)` está disponible para el detalle.
- [x] Tests unitarios.

> Si 006 aún no está implementado, montar contra la estructura de metas de 005 con
> `cantidadRecibida = 0` / agregados vacíos y completar cuando 006 aterrice. No bloquear 009.

## 3. Módulo `transparencia` — application

- [x] `src/modules/transparencia/application/obtener-resumen-publico.ts` con
      `obtenerResumenPublico(deps)`; lecturas en paralelo (`Promise.all`); DTO **solo con campos
      publicables**.
- [x] `src/modules/transparencia/application/obtener-detalle-publico.ts` con
      `obtenerDetallePublico(deps, ayudaId)`; metas + progreso global; marcador nulo si no existe.
- [x] Tests:
      - `obtener-resumen-publico.test.ts`: agregados, `MONETARIO` por moneda, orden por fecha desc, y
        **aserción de que no hay datos personales** en el DTO.
      - `obtener-detalle-publico.test.ts`: metas y `porcentajeGlobal` correctos; sin datos personales;
        nulo cuando el envío no existe.
- [x] Mantener `transparencia/application` puro (sin framework ni Prisma).

## 4. Presentación (pública)

- [x] Ruta `src/app/transparencia/page.tsx` — server component **sin** `requireRol`; invoca
      `obtenerResumenPublico` y renderiza `ResumenTransparencia`. `generateMetadata` para SEO.
- [x] Ruta `src/app/transparencia/[id]/page.tsx` — server component público; invoca
      `obtenerDetallePublico`; `notFound()` si es nulo.
- [x] Componentes en `src/modules/transparencia/ui/`:
      - `ResumenTransparencia`, `TotalesImpacto`, `RecolectadoPorRecurso`, `ListaEnviosPublicos`,
        `TarjetaEnvioPublico`, `DetalleEnvioPublico`, `BarraProgreso`.
- [x] Cada tarjeta de envío enlaza con `<Link />` a `/transparencia/[id]`.
- [x] Recursos `MONETARIO`: mostrar monto agregado por moneda con nota de canal externo.
- [x] Envíos `ENTREGADO` destacados como "entregado".
- [x] Formatear fechas con Luxon (`es-VE`, `dd/MM/yyyy`); números con `numeric-tnum`.
- [x] Enlace a `/transparencia` desde la landing (003) y/o el header público.
- [x] Respetar estilo visual (`tech-stack.md`): paleta ocre/teal, sin em-dash en texto visible, sin
      eyebrows uppercase decorativos, móvil primero, `prefers-reduced-motion` en la barra.

## 5. Composición (wiring)

- [x] Exponer fachada `@/shared/transparencia` (o equivalente) que componga los repos + casos de uso
      de 005/006 y ofrezca `obtenerResumenPublico` / `obtenerDetallePublico` listos. `app`/`ui` no
      importan `infrastructure`/`lib` directamente.

## 6. Cacheo (revisar tras medir)

- [x] Medir latencia en dev con datos representativos.
- [x] Si es alta, añadir `export const revalidate = 60` (o ISR) en las páginas públicas. **No**
      optimizar sin medir. _(Sin caché en el MVP; las rutas son dinámicas y la latencia en dev fue aceptable.)_

## 7. Tests (Vitest)

- [x] `obtenerResumenPublico` y `obtenerDetallePublico` (ver arriba), incluida la aserción de "sin
      datos personales".
- [x] Los tests unitarios de las nuevas lecturas viven en el módulo dueño.
- [x] Todos en verde.

## 8. Validación final

- [x] `docker compose up -d` y base con datos representativos.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: **sin iniciar sesión**, abrir `/transparencia`; verificar totales, recolectado por
      recurso, lista de envíos con progreso y destino, y el detalle `/transparencia/[id]`. Confirmar
      que **no** aparece ningún dato personal y que `notFound()` responde ante un id inexistente.

## 9. Cierre

- [x] Revisar que `transparencia/application` sigue puro (sin framework/Prisma) y que ningún DTO
      público expone datos personales.
- [x] Generar/actualizar `DOC/features/009-tablero-publico-de-transparencia.md` para reflejar lo
      entregado.
- [x] Mover `009 · Tablero público de transparencia` a **Hecho ✅** en `constitution/roadmap.md` y
      promover `010 · Seguimiento del envío` a **Siguiente 🔜**.
