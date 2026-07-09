# 009 · Tablero público de transparencia — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server components, `revalidate`/
      ISR, `generateMetadata`, `notFound`) y repasar los módulos 005/006 y las agregaciones de 008.
- [ ] Levantar la base: `docker compose up -d`. Requiere datos de prueba (envíos en varios estados,
      metas, aportes `RECIBIDO`/`COMPROMETIDO`, algún recurso `MONETARIO`) para validar a ojo.

## 1. Verificaciones previas (sin cambios de schema)

- [ ] Comprobar que existen los índices necesarios: `Ayuda(estado)`, `Ayuda(fecha)`,
      `Aporte(ayudaId, recursoId, estado)`. Si falta alguno, **añadirlo en el módulo dueño**, no en
      `transparencia/`.

## 2. Lecturas agregadas en módulos dueños (solo si faltan)

### 005 · Ayudas
- [ ] `listarEnviosPublicos(deps)` (application): todos los envíos con su `porcentaje`, ordenados por
      `fecha` desc. Reutilizar/generalizar `listarPrioridadRecolectando` (008) o componer con
      `progresoDeAyuda` (006).
- [ ] Test unitario.

### 006 · Aportes
- [ ] `recolectadoPorRecurso(deps)` (application): suma de aportes `RECIBIDO` agrupada por recurso;
      `MONETARIO` agrupado además por moneda.
- [ ] Confirmar que `progresoDeAyuda(deps, ayudaId)` está disponible para el detalle.
- [ ] Tests unitarios.

> Si 006 aún no está implementado, montar contra la estructura de metas de 005 con
> `cantidadRecibida = 0` / agregados vacíos y completar cuando 006 aterrice. No bloquear 009.

## 3. Módulo `transparencia` — application

- [ ] `src/modules/transparencia/application/obtener-resumen-publico.ts` con
      `obtenerResumenPublico(deps)`; lecturas en paralelo (`Promise.all`); DTO **solo con campos
      publicables**.
- [ ] `src/modules/transparencia/application/obtener-detalle-publico.ts` con
      `obtenerDetallePublico(deps, ayudaId)`; metas + progreso global; marcador nulo si no existe.
- [ ] Tests:
      - `obtener-resumen-publico.test.ts`: agregados, `MONETARIO` por moneda, orden por fecha desc, y
        **aserción de que no hay datos personales** en el DTO.
      - `obtener-detalle-publico.test.ts`: metas y `porcentajeGlobal` correctos; sin datos personales;
        nulo cuando el envío no existe.
- [ ] Mantener `transparencia/application` puro (sin framework ni Prisma).

## 4. Presentación (pública)

- [ ] Ruta `src/app/transparencia/page.tsx` — server component **sin** `requireRol`; invoca
      `obtenerResumenPublico` y renderiza `ResumenTransparencia`. `generateMetadata` para SEO.
- [ ] Ruta `src/app/transparencia/[id]/page.tsx` — server component público; invoca
      `obtenerDetallePublico`; `notFound()` si es nulo.
- [ ] Componentes en `src/modules/transparencia/ui/`:
      - `ResumenTransparencia`, `TotalesImpacto`, `RecolectadoPorRecurso`, `ListaEnviosPublicos`,
        `TarjetaEnvioPublico`, `DetalleEnvioPublico`, `BarraProgreso`.
- [ ] Cada tarjeta de envío enlaza con `<Link />` a `/transparencia/[id]`.
- [ ] Recursos `MONETARIO`: mostrar monto agregado por moneda con nota de canal externo.
- [ ] Envíos `ENTREGADO` destacados como "entregado".
- [ ] Formatear fechas con Luxon (`es-VE`, `dd/MM/yyyy`); números con `numeric-tnum`.
- [ ] Enlace a `/transparencia` desde la landing (003) y/o el header público.
- [ ] Respetar estilo visual (`tech-stack.md`): paleta ocre/teal, sin em-dash en texto visible, sin
      eyebrows uppercase decorativos, móvil primero, `prefers-reduced-motion` en la barra.

## 5. Composición (wiring)

- [ ] Exponer fachada `@/shared/transparencia` (o equivalente) que componga los repos + casos de uso
      de 005/006 y ofrezca `obtenerResumenPublico` / `obtenerDetallePublico` listos. `app`/`ui` no
      importan `infrastructure`/`lib` directamente.

## 6. Cacheo (revisar tras medir)

- [ ] Medir latencia en dev con datos representativos.
- [ ] Si es alta, añadir `export const revalidate = 60` (o ISR) en las páginas públicas. **No**
      optimizar sin medir.

## 7. Tests (Vitest)

- [ ] `obtenerResumenPublico` y `obtenerDetallePublico` (ver arriba), incluida la aserción de "sin
      datos personales".
- [ ] Los tests unitarios de las nuevas lecturas viven en el módulo dueño.
- [ ] Todos en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base con datos representativos.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: **sin iniciar sesión**, abrir `/transparencia`; verificar totales, recolectado por
      recurso, lista de envíos con progreso y destino, y el detalle `/transparencia/[id]`. Confirmar
      que **no** aparece ningún dato personal y que `notFound()` responde ante un id inexistente.

## 9. Cierre

- [ ] Revisar que `transparencia/application` sigue puro (sin framework/Prisma) y que ningún DTO
      público expone datos personales.
- [ ] Generar/actualizar `DOC/features/009-tablero-publico-de-transparencia.md` para reflejar lo
      entregado.
- [ ] Mover `009 · Tablero público de transparencia` a **Hecho ✅** en `constitution/roadmap.md` y
      promover `010 · Seguimiento del envío` a **Siguiente 🔜**.
