# 027 · Modal genérico y scrollbar global — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` y
> `constitution/ui-guidelines.md`. **Sin dependencias npm nuevas.**

## Enfoque general

Es una feature de **chrome/UX**, no de dominio. Orden de trabajo:

1. **Scrollbar global** en `globals.css` + documentar en `ui-guidelines.md`.
2. **Construir `<PanelFormModal>`** y exportarlo desde el barril `panel/`.
3. **Refactorizar Puntos de acopio** como piloto (valida el componente contra la referencia).
4. **Migrar Recursos** (índice + tabla → modal; eliminar subpáginas).
5. **Migrar Donaciones** (medios + ingreso; eliminar subpáginas).
6. **Limpieza de enlaces** y validación por rol.

> ⚠️ Antes de tocar componentes cliente de Next 16, leer `node_modules/next/dist/docs/` (AGENTS.md).

## 1. Modelo de datos y migración

- **Sin cambios.** No hay tablas, enums ni columnas. No hay migración Prisma.

## 2. Scrollbar global (`globals.css`)

Añadir al final de `src/app/globals.css` (o en un bloque dedicado comentado):

### 2.1 Firefox

```css
html {
  scrollbar-width: thin;
  scrollbar-color: oklch(from var(--muted-foreground) l c h / 0.45) transparent;
}
```

Si `oklch(from …)` no es compatible con el target de browsers del proyecto, usar valores fijos derivados de la paleta actual o `color-mix(in oklch, var(--muted-foreground) 45%, transparent)`.

### 2.2 WebKit (Chrome, Edge, Safari cuando muestra scrollbar)

```css
html::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

html::-webkit-scrollbar-track {
  background: transparent;
}

html::-webkit-scrollbar-thumb {
  background-color: color-mix(in oklch, var(--muted-foreground) 40%, transparent);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}

html::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
```

- **Sin flechas:** `::-webkit-scrollbar-button { display: none }` es el requisito explícito del cliente.
- **Alcance `html`:** afecta el scroll del documento entero (sidebar + contenido). Los scroll internos de modales y listas con `overflow-y-auto` heredan el mismo estilo en WebKit cuando el elemento scrolleable no redefine scrollbar (comportamiento estándar en la mayoría de navegadores para scrollbars de área).

### 2.3 Documentación

Añadir en `constitution/ui-guidelines.md` una sección **"Scrollbar global"** con: dónde vive el CSS, que no debe duplicarse por componente, y que las flechas están prohibidas.

## 3. Componente `<PanelFormModal>`

**Archivo:** `src/shared/ui/panel/panel-form-modal.tsx` (`"use client"`).

### 3.1 API

```tsx
type PanelFormModalSize = "default" | "wide";

type PanelFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: PanelFormModalSize;
  children: React.ReactNode;
  className?: string;
};
```

### 3.2 Implementación

- Compone `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` de `@/shared/ui/dialog`.
- **No modificar** el `DialogContent` compartido globalmente; pasar `className` que **sobrescriba** el radio y el ancho:

| Prop    | Clases adicionales sobre `DialogContent`                          |
| ------- | ----------------------------------------------------------------- |
| default | `rounded-2xl sm:max-w-lg max-h-[90dvh] overflow-y-auto`           |
| wide    | `rounded-2xl sm:max-w-2xl max-h-[90dvh] overflow-y-auto`          |

- El `rounded-2xl` debe ganar al `rounded-lg` base de `DialogContent` (orden en `cn()` o `!rounded-2xl` si hace falta).
- Estructura interna fija:

```
Dialog
  DialogContent (rounded-2xl, scroll)
    DialogHeader
      DialogTitle
      DialogDescription? 
    {children}   ← formulario
```

- Exportar mapa puro `PANEL_FORM_MODAL_MAX_W` (análogo a `PANEL_MAX_W` de 026) para testear en Vitest si se desea.

### 3.3 Barril

Añadir export en `src/shared/ui/panel/index.ts`.

## 4. Patrón de gestión en listado (cliente)

Replicar el patrón de `PuntosAcopioGestion`:

```tsx
type ModalAbierto =
  | { modo: "nuevo" }
  | { modo: "editar"; entidad: EntidadDTO }
  | null;

const [modal, setModal] = useState<ModalAbierto>(null);

function cerrarYRefrescar() {
  setModal(null);
  router.refresh();
}
```

- Los **server actions** siguen llegando como props desde el `page.tsx` (server component).
- Los botones del listado (`PanelListToolbar`, `PanelListRow`) llaman `setModal(...)` en lugar de `<Link href=".../nuevo">`.
- El componente de gestión pasa a ser `"use client"` o se extrae un wrapper cliente (`RecursosGestion`, `DonacionesGestion`) si la página índice debe seguir siendo server component que solo fetch + props.

## 5. Migraciones por módulo

### 5.1 Puntos de acopio (piloto)

**Archivo:** `src/modules/acopio/ui/PuntosAcopioGestion.tsx`

- Sustituir `<Dialog>` + `<DialogContent className="...">` por `<PanelFormModal size="wide">`.
- Conservar ramas `modal?.modo === "nuevo" | "editar"` y `PuntoAcopioForm` con `onExito={cerrarYRefrescar}`.
- Revisar a ojo: mismos textos, mismo ancho, bordes más redondos.

### 5.2 Recursos

**Nuevo:** `src/modules/recursos/ui/RecursosGestion.tsx` (cliente), o refactor de `RecursosTabla` para incluir estado modal.

**Página:** `(admin)/panel/recursos/page.tsx` — fetch de listado + pasar `crearAction` / `editarAction` al gestor.

**Formulario:** `RecursoForm` — añadir prop opcional `onExito?: () => void`. Si existe, llamarla tras `ok` en lugar de (o además de) `router.push("/panel/recursos")`.

**Eliminar:**

- `src/app/(admin)/panel/recursos/nuevo/page.tsx`
- `src/app/(admin)/panel/recursos/[id]/editar/page.tsx`

**Enlaces a actualizar:**

- `RecursosTabla` — "Editar" → `onEditar(recurso)` callback.
- `PropuestasTabla` — si enlaza a `/panel/recursos/[id]/editar`, cambiar a callback o link al índice (las propuestas pueden abrir edición en modal del catálogo solo si el recurso ya está aprobado; si no aplica, dejar solo vista en propuestas).
- `AccesosDirectos` — quitar o cambiar `href="/panel/recursos/nuevo"` por ancla al índice (el CTA real vive en el listado).

### 5.3 Donaciones — medios

**Nuevo:** `src/modules/donaciones/ui/DonacionesGestion.tsx` (o extensión de la página con componente cliente).

**Formulario:** `MedioDonacionForm` — `onExito?: () => void` igual que Recursos.

**Eliminar:**

- `(admin)/panel/donaciones/nuevo/page.tsx`
- `(admin)/panel/donaciones/[id]/editar/page.tsx`

**Página índice:** `(admin)/panel/donaciones/page.tsx` — toolbar con modales para medio nuevo, editar medio, registrar ingreso.

### 5.4 Donaciones — ingreso monetario

**Datos precargados:** hoy `ingresos/nuevo/page.tsx` hace `Promise.all` de recursos monetarios, medios y actividades `RECOLECTANDO`. Mover esa lógica al **server component** de `/panel/donaciones/page.tsx` y pasar props al gestor cliente:

```tsx
<DonacionesGestion
  medios={...}
  ingreso={{
    recursos,
    medios,
    ayudas: ayudasConMetaMonetaria,
    fechaHoy,
  }}
  registrarIngresoAction={registrarAporteExternoAction}
  ...
/>
```

**Formulario:** `RegistroIngresoForm` — `onExito?: () => void`.

**Eliminar:** `(admin)/panel/donaciones/ingresos/nuevo/page.tsx`

**Modal de ingreso:** título "Registrar ingreso monetario", `size="default"` (o `wide` si los selects se sienten apretados en móvil).

## 6. Rutas eliminadas y redirecciones (opcional)

Recomendado: **eliminar** las páginas. Si se prefiere no romper bookmarks:

- `next.config` redirects de `/panel/recursos/nuevo` → `/panel/recursos`, etc.

Fuera de alcance: abrir modal automático con query string.

## 7. Formularios — contrato `onExito`

Unificar el patrón de `PuntoAcopioForm`:

```tsx
type Props = {
  action: ...
  onExito?: () => void;
  ...
};

// Tras result.ok:
onExito?.() ?? router.push("/panel/...");
router.refresh(); // solo si no hay onExito y se navega, o siempre en onExito del padre
```

El padre modal es quien llama `router.refresh()` en `cerrarYRefrescar` para no duplicar.

## 8. Tests (Vitest)

- `PANEL_FORM_MODAL_MAX_W` o función pura de clases por `size` (si se extrae).
- Sin tests E2E obligatorios; la validación es visual + build.

## 9. Validación

| Rol   | Flujo                                                                 |
| ----- | --------------------------------------------------------------------- |
| ADMIN | Recursos: nuevo + editar en modal                                     |
| ADMIN | Donaciones: nuevo medio + editar + registrar ingreso en modal         |
| ADMIN | Puntos de acopio: nuevo + editar (sin regresión)                      |
| —     | Scroll en listado largo y en modal con muchos campos (sin flechas Win) |

`pnpm test`, `pnpm exec eslint src`, `pnpm build`.
