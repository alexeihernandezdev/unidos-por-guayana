# Prompt — próximo Cloud Agent

> **Feature en cola:** `009-tablero-publico-de-transparencia`  
> **Generado:** tras completar `017-datos-de-contacto-obligatorios`.  
> **Instrucción:** crea un **nuevo** Cloud Agent, pega este prompt completo y archiva el agente anterior.

---

Implementa **una sola feature** del proyecto Unidos por la Guaira.

## Feature objetivo

- **ID:** 009
- **Nombre:** Tablero público de transparencia
- **Slug:** `009-tablero-publico-de-transparencia`
- **Spec:** `spec/spec_template/features/009-tablero-publico-de-transparencia/spec.md`
- **Plan:** `spec/spec_template/features/009-tablero-publico-de-transparencia/plan.md`
- **Tasks:** `spec/spec_template/features/009-tablero-publico-de-transparencia/tasks.md`

## Instrucciones obligatorias

1. Lee y sigue la skill `.agents/skills/implement-feature/SKILL.md` al pie de la letra.
2. Lee `AGENTS.md`, `spec/spec_template/README.md` y la guía Next.js 16 en `node_modules/next/dist/docs/`.
3. Crea la rama `cursor/tablero-transparencia-009-3b92` desde `main`.
4. Implementa solo esta feature según spec/plan/tasks.
5. Ejecuta `pnpm test`, `pnpm exec eslint src`, `pnpm build`.
6. Al cerrar: actualiza roadmap, DOC (`DOC/features/009-tablero-publico-de-transparencia.md`), `tasks.md`, `.agents/feature-queue/queue.json` y regenera este archivo para la **siguiente** feature (`010-seguimiento-del-envio`).
7. Abre PR draft contra `main` y **detente**. No implementes la feature 010 ni ninguna otra en esta ejecución.

## Contexto

- Proyecto SDD (Spec Driven Development). La constitución manda sobre el código.
- Arquitectura Clean + Screaming en `src/modules/`.
- Esta feature es una **vista pública sin login** con lo recolectado, progreso por actividad y destino de cada ayuda. Es la primera superficie visible al público general, así que cuida SEO básico y accesibilidad.
- Reutiliza los agregados de 006/008 (`ProgresoMetas`, cálculos de recibido/prometido) y no vuelvas a inventar el cálculo.
- Ojo con la nueva terminología: **actividad** (no "envío"). El tipo de actividad puede ser `ENVIO`, `JORNADA` o `EVENTO_SOCIAL` (feature 018) — el tablero debe reflejar los tres.
- Mantén `ayudas/domain` y `ayudas/application` puros; la vista pública consume solo lecturas.
