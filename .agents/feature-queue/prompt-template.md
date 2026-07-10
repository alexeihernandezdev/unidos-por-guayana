# Plantilla — prompt para Cloud Agent (una feature)

Copia este bloque a un **nuevo** Cloud Agent. Sustituye los marcadores `{{…}}`.

---

Implementa **una sola feature** del proyecto Unidos por Guayana.

## Feature objetivo

- **ID:** {{FEATURE_ID}}
- **Nombre:** {{FEATURE_TITLE}}
- **Slug:** {{FEATURE_SLUG}}
- **Spec:** `{{SPEC_DIR}}/spec.md`
- **Plan:** `{{SPEC_DIR}}/plan.md`
- **Tasks:** `{{SPEC_DIR}}/tasks.md`

## Instrucciones obligatorias

1. Lee y sigue la skill `.agents/skills/implement-feature/SKILL.md` al pie de la letra.
2. Lee `AGENTS.md`, `spec/spec_template/README.md` y la guía Next.js 16 en `node_modules/next/dist/docs/`.
3. Crea la rama `cursor/{{BRANCH_NAME}}-3b92` desde `main`.
4. Implementa solo esta feature según spec/plan/tasks.
5. Ejecuta `pnpm test`, `pnpm lint`, `pnpm build`.
6. Al cerrar: actualiza roadmap, DOC, `tasks.md`, `.agents/feature-queue/queue.json` y regenera `.agents/feature-queue/NEXT_PROMPT.md` para la **siguiente** feature en la cola.
7. Abre PR draft contra `main` y **detente**. No implementes la siguiente feature.

## Contexto

Proyecto SDD (Spec Driven Development). La constitución manda sobre el código. Arquitectura Clean + Screaming en `src/modules/`.
