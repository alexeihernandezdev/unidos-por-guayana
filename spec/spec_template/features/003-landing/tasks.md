# 003 · Landing — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (raíz `/`, composición
      server/client components y API de metadata).
- [ ] Confirmar que las rutas `/login` y `/registro` y el helper de sesión de la feature 002 están
      disponibles (o dejar las CTAs enlazando a esas rutas y degradar el bloque "según sesión").

## 1. Estructura del módulo

- [ ] Crear `src/modules/landing/ui/` para las secciones de la landing.
- [ ] (Opcional) Añadir barril `index.ts` para exportar las secciones.

## 2. Contenido

- [ ] Redactar textos en español (qué es, roles, principios) derivados de `mission.md`.
- [ ] Definir el propósito en una frase para el hero (alineado con `DOC/resumen-general.md`).

## 3. Componentes de UI (`src/modules/landing/ui`)

- [ ] `HeroSection` — título, propósito y CTAs principales.
- [ ] `ComoFuncionaSection` — los tres roles y qué aporta cada uno.
- [ ] `PrincipiosSection` — transparencia y trazabilidad (enganche al tablero futuro).
- [ ] `CtaFinalSection` — cierre con las llamadas a la acción.
- [ ] `SiteHeader` / `SiteFooter` — navegación mínima y pie con nombre + nota de alcance.
- [ ] Reutilizar primitivos de Shadcn desde `src/shared/ui` (añadir `Button`, etc. si faltan).

## 4. Composición en `page.tsx`

- [ ] Reescribir `src/app/page.tsx` (quitar el placeholder de Next) como server component que
      compone las secciones; mantenerlo fino y sin lógica de negocio.
- [ ] Verificar que `/` es pública (no cubierta por el middleware de la feature 002).

## 5. Comportamiento según sesión

- [ ] Leer el usuario actual con el helper de servidor de la feature 002.
- [ ] Con sesión: mostrar acceso al área del usuario. Sin sesión: mostrar registro/login.
- [ ] Fallback elegante si el helper aún no existe.

## 6. Metadatos

- [ ] Exportar `metadata`/`generateMetadata` con título y descripción de la landing (Next 16).

## 7. Estilo, responsive y tema

- [ ] Diseño móvil primero que escale a escritorio (Tailwind v4, tokens de `globals.css`).
- [ ] Respetar modo claro/oscuro sin hardcodear colores fuera de los tokens.
- [ ] Optimizar activos (imágenes en `public/`, `next/image` si aplica) para conexión limitada.

## 8. Validación final

- [ ] `pnpm dev`: `/` muestra la landing sin pedir login.
- [ ] CTAs correctas: "Quiero colaborar" → registro (`COLABORADOR`), "Necesito ayuda" → registro
      (`SOLICITANTE`), "Iniciar sesión" → `/login`.
- [ ] Con sesión activa, la landing ofrece acceso al área del usuario.
- [ ] Responsive (móvil/escritorio) y modo claro/oscuro verificados.
- [ ] Metadatos (título/descripción) presentes en el `<head>`.
- [ ] `pnpm lint` / `pnpm build` sin errores.

## 9. Cierre

- [ ] Revisar que no se introdujo lógica de dominio en `src/app` ni en la UI (límites de la
      constitución respetados).
- [ ] Verificar que `DOC/features/003-landing.md` refleja lo entregado.
- [ ] Mover `003 · Landing` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `004 · Catálogo de recursos` a **Siguiente 🔜**.
