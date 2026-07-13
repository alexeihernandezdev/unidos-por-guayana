# 027 · Modal genérico para formularios pequeños y scrollbar global

> Estado: **Planificada** · Depende de: `026 · Guía de diseño y layout consistente` (componentes `Panel*`, `ui-guidelines.md`) y `011 · Puntos de acopio` (patrón modal de referencia) · Roadmap: `constitution/roadmap.md`
>
> _Feature de **experiencia y consistencia visual**: no introduce entidades, dominio ni permisos nuevos. Extrae el patrón modal de "Puntos de acopio" a un componente reutilizable con bordes más redondos, define un estilo global de scrollbar sin flechas, y migra las altas/ediciones de entidades pequeñas desde subpáginas a modales sobre el listado._

## Qué hace

Hoy el espacio logeado mezcla dos patrones para crear o editar datos:

1. **Modal en el listado** — Puntos de acopio abre alta/edición en un `Dialog` sobre la misma pantalla; al guardar se cierra y se refresca el listado. No hay rutas `/nuevo` ni `/editar`.
2. **Subpágina dedicada** — Recursos, medios de donación e ingresos monetarios navegan a rutas `nuevo` / `[id]/editar` con `PanelPageSubHeader` y un formulario a página completa.

Esa divergencia rompe el ritmo de trabajo: el admin sale del listado, pierde contexto y debe volver con "Volver al catálogo". Para formularios con pocos campos, el modal es más rápido y coherente con el patrón que ya funciona en Puntos de acopio.

Esta feature:

1. **Crea un modal genérico** (`<PanelFormModal>`) inspirado en el de Puntos de acopio, con **bordes más redondos** que el `Dialog` base (`rounded-lg` → `rounded-2xl`), scroll interno cuando el contenido crece, y API estable (título, descripción opcional, tamaño, children).
2. **Define un scrollbar global** sin flechas de subida/bajada, aplicado a **toda la aplicación** (espacio logeado y páginas públicas), alineado a los tokens de color del proyecto.
3. **Migra las altas/ediciones de entidades pequeñas** al patrón modal-en-listado, eliminando la navegación a subpáginas para esos flujos.
4. **Refactoriza Puntos de acopio** para consumir el modal genérico (sin cambio funcional visible, solo unificación).

## Por qué

- **Menos fricción en tareas frecuentes.** Crear un recurso o un medio de donación son acciones de pocos campos que no justifican una pantalla entera ni un viaje de ida y vuelta.
- **Un solo patrón mental.** Si Puntos de acopio ya demostró que el modal funciona, las demás entidades "ligeras" deben seguir la misma regla.
- **Scrollbar coherente en todo el sitio.** Los scrollbars nativos de Windows muestran flechas y estilos dispares; un estilo global discreto (sin flechas, thumb fino, colores de marca) unifica la sensación de pulido.
- **Componente > copia.** Hoy el modal de Puntos de acopio ensambla `Dialog` + clases a mano; centralizarlo evita que cada módulo reinvente bordes, scroll y cabecera.

## Decisiones tomadas

- **`<PanelFormModal>` vive en `src/shared/ui/panel/`**, junto al resto de componentes de layout de la feature 026. Es un wrapper de cliente sobre el `Dialog` de Shadcn/Radix existente; **no** se crea una librería de modales aparte.
- **Bordes más redondos que el `Dialog` base:** el contenido del modal usa `rounded-2xl` (16px) frente al `rounded-lg` (8px) del `DialogContent` genérico. El overlay, animaciones y botón de cerrar se conservan del `Dialog` actual.
- **El scrollbar es global** — se aplica en `globals.css` sobre `html` (o el elemento raíz de scroll del documento), no solo dentro del modal. Afecta sidebar, listados, modales y páginas públicas.
- **Sin flechas en el scrollbar** — en WebKit (`::-webkit-scrollbar-button { display: none }`) y en Firefox (`scrollbar-width: thin` no muestra flechas). El thumb es fino y usa colores derivados de `--border` / `--muted-foreground`.
- **Criterio "entidad pequeña":** formulario que cabe razonablemente en un modal con scroll interno (`max-h-[90dvh]`), sin mapas embebidos ni bloques dinámicos extensos (listas de metas, tablas editables, etc.). Campos orientativos: **≤ 8 campos** o equivalente visual.
- **Entidades incluidas en la migración:**
  - **Recursos** — alta y edición (`RecursoForm`, 4 campos).
  - **Medios de donación** — alta y edición (`MedioDonacionForm`, ~6 campos).
  - **Ingreso monetario externo** — solo alta (`RegistroIngresoForm`, ~7 campos con selects).
  - **Puntos de acopio** — refactor al modal genérico (ya es modal; incluye mapa pero queda como excepción documentada por ser la referencia original).
- **Entidades excluidas** (siguen en subpágina):
  - **Actividades** — nueva/edición con metas, tipo, punto de acopio opcional, fechas.
  - **Solicitudes** — nueva/edición con recursos múltiples y narrativa.
  - **Aportar**, **proponer recurso** (solicitante), **completar perfil**, **mi perfil** y formularios de onboarding.
- **Las rutas `nuevo` / `editar` de las entidades migradas se eliminan** (o redirigen al índice padre). La UX canónica es modal desde el listado; no se mantienen dos caminos paralelos.
- **Los formularios existentes (`RecursoForm`, `MedioDonacionForm`, etc.) se reutilizan** tal cual; solo cambia el contenedor y el callback de éxito (`onExito` cierra modal + `router.refresh()` en lugar de `router.push` al listado).
- **Sin dependencias npm nuevas.** Solo CSS nativo de scrollbar + componentes ya presentes.

## Alcance

**Incluye**

- **`<PanelFormModal>`** en `src/shared/ui/panel/`:
  - Props: `open`, `onOpenChange`, `title`, `description?`, `size?` (`default` | `wide`), `children`.
  - Contenido con `rounded-2xl`, `max-h-[90dvh]`, `overflow-y-auto`, cabecera (`DialogHeader` / `DialogTitle` / `DialogDescription`) y slot para el formulario.
  - `size="wide"` para formularios que necesitan más ancho (p. ej. Puntos de acopio con mapa: `sm:max-w-2xl`, como hoy).
- **Estilos globales de scrollbar** en `globals.css`:
  - Firefox: `scrollbar-width: thin`, `scrollbar-color` con tokens.
  - WebKit: `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, `::-webkit-scrollbar-thumb`, sin botones/flechas.
  - Documentación breve en `constitution/ui-guidelines.md` (nueva sección "Scrollbar global").
- **Migración a modal-en-listado:**
  - `RecursosTabla` + página índice `/panel/recursos`: botones "Nuevo recurso" y "Editar" abren modal; eliminar `/panel/recursos/nuevo` y `/panel/recursos/[id]/editar`.
  - `MediosDonacionTabla` + `/panel/donaciones`: "Nuevo medio" y "Editar" en modal; eliminar `/panel/donaciones/nuevo` y `/panel/donaciones/[id]/editar`.
  - Sección ingresos en `/panel/donaciones`: "Registrar ingreso" en modal; eliminar `/panel/donaciones/ingresos/nuevo`.
  - `PuntosAcopioGestion`: sustituir `Dialog` directo por `<PanelFormModal>`.
- **Ajuste de formularios** donde hoy hacen `router.push` al guardar: aceptar `onExito?: () => void` y usarlo en contexto modal (patrón ya presente en `PuntoAcopioForm`).
- **Actualizar enlaces rotos** — `AccesosDirectos`, `PropuestasTabla` (si enlaza a editar recurso), grep de rutas eliminadas.
- Tests (Vitest) de piezas puras si las hay (p. ej. mapa `size → max-w` del modal).

**No incluye**

- **Migrar actividades, solicitudes, aportes ni flujos de colaborador/solicitante** a modal.
- **Cambiar campos, validaciones, server actions ni permisos** de ninguna entidad.
- **Modal anidado** (modal sobre modal) ni drawer/sheet como alternativa.
- **Scrollbar solo dentro del modal** — el estilo es global por decisión explícita.
- **Dark mode específico del scrollbar** — usa los tokens actuales; si en el futuro hay tema oscuro, se ajusta entonces.
- **Rediseño del `Dialog` base** usado fuera de `<PanelFormModal>` (p. ej. confirmaciones puntuales en otros módulos).

## Criterios de aceptación

- [ ] Existe `<PanelFormModal>` exportado desde `src/shared/ui/panel/` con bordes `rounded-2xl`, scroll interno y tamaños `default` / `wide`.
- [ ] `globals.css` define scrollbar global **sin flechas** visible en Chrome/Edge (WebKit) y Firefox; el thumb es fino y legible sobre fondo claro.
- [ ] `constitution/ui-guidelines.md` documenta la regla del scrollbar global y cuándo usar `<PanelFormModal>` vs subpágina.
- [ ] **Recursos:** crear y editar desde `/panel/recursos` en modal; las rutas `/panel/recursos/nuevo` y `/panel/recursos/[id]/editar` ya no existen (o redirigen al índice).
- [ ] **Donaciones — medios:** crear y editar desde `/panel/donaciones` en modal; rutas `nuevo` y `[id]/editar` eliminadas o redirigidas.
- [ ] **Donaciones — ingresos:** registrar ingreso desde `/panel/donaciones` en modal; ruta `ingresos/nuevo` eliminada o redirigida.
- [ ] **Puntos de acopio** usa `<PanelFormModal>`; el comportamiento (alta, edición, refresh) se mantiene.
- [ ] Al guardar con éxito en modal, este se cierra y el listado se actualiza (`router.refresh()`) sin navegación a otra ruta.
- [ ] Ningún enlace interno apunta a las rutas eliminadas (grep / revisión manual).
- [ ] `pnpm test` en verde, `pnpm exec eslint src` sin errores, `pnpm build` sin errores.
- [ ] Validación a ojo (`ADMIN`): flujos crear/editar de recursos, medios, ingreso y puntos de acopio en desktop y móvil; scrollbar visible al desplazar listados largos y contenido del modal.

## Notas y riesgos

- **Puntos de acopio con mapa en modal `wide`.** Es la excepción al criterio "sin mapas"; se mantiene porque ya funciona y es la referencia. No usar esto como precedente para actividades u otras entidades pesadas.
- **Registro de ingreso y datos del servidor.** Hoy la página `ingresos/nuevo` precarga recursos monetarios, medios y actividades en el server component. Al pasar a modal, esos datos deben llegar al componente de gestión (props desde la página índice, igual que Puntos de acopio) o cargarse al abrir el modal; decidir en `plan.md` sin duplicar fetch.
- **Edición profunda por URL.** Si alguien tenía bookmark `/panel/recursos/[id]/editar`, la redirección al índice es aceptable; opcionalmente abrir el modal de edición vía query (`?editar=id`) queda fuera de alcance salvo que se decida en plan.
- **Formularios con `router.push` al éxito.** Hay que unificar con `onExito` para no navegar tras guardar en contexto modal (mismo patrón que `PuntoAcopioForm`).
- **Scrollbar en macOS.** Safari oculta scrollbars hasta scroll; el estilo aplica cuando el scrollbar es visible. Comportamiento esperado.
- **Accesibilidad del modal.** Conservar foco atrapado, `DialogTitle` obligatorio y cierre con Escape del `Dialog` de Radix; no regresar.
