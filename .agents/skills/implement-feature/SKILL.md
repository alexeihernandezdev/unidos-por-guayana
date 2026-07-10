---
name: implement-feature
description: Implementa exactamente UNA feature del roadmap de Unidos por la Guaira siguiendo spec/plan/tasks. Usar cuando un agente cloud debe entregar una feature completa, validarla y cerrar sin continuar con la siguiente.
---

# Implementar una feature (un agente = una feature)

Cada ejecución de agente implementa **una sola feature** y **termina**. No encadenes la siguiente: el contexto debe quedar limpio para el próximo agente.

## Antes de escribir código

1. Leer `.agents/feature-queue/queue.json` y confirmar cuál feature está `in_progress` o cuál es la primera `pending` en `order`.
2. Leer en este orden:
   - `spec/spec_template/constitution/mission.md`
   - `spec/spec_template/constitution/tech-stack.md`
   - `spec/spec_template/constitution/roadmap.md`
   - `spec/spec_template/features/NNN-nombre/{spec,plan,tasks}.md`
3. Leer `AGENTS.md` y la guía de Next.js 16 en `node_modules/next/dist/docs/` (APIs pueden diferir de tu entrenamiento).
4. Revisar módulos ya implementados en `src/modules/` para copiar convenciones (Clean + Screaming, deps, fakes, fachadas `@/shared/…`).
5. Activar skills: `vercel-react-best-practices` (React/Next) y `frontend-design` (solo si hay UI nueva relevante).

## Durante la implementación

- Sigue `plan.md` y marca progreso en `tasks.md` conforme avances.
- Respeta capas: `domain` → `application` → `infrastructure` → `ui`; la app importa vía `@/shared/<modulo>`.
- No añadas dependencias npm sin avisar (límite duro en tech-stack).
- Tests con Vitest en la capa `application` usando fakes en memoria.
- Una feature por rama: `cursor/<nombre-descriptivo>-3b92`.

## Validación obligatoria

```bash
docker compose up -d   # si la feature toca BD
pnpm test
pnpm lint
pnpm build
```

Corrige fallos antes de cerrar.

## Cierre (handoff) — obligatorio

Al terminar **solo esta feature**:

1. Marca todos los ítems aplicables en `tasks.md` como hechos (`[x]`).
2. Actualiza `spec/spec_template/constitution/roadmap.md`:
   - Mueve la feature a **Hecho ✅**.
   - Promueve la siguiente en `order` a **Siguiente 🔜**.
3. Actualiza o crea `DOC/features/NNN-nombre.md` (lenguaje llano para el cliente).
4. Actualiza `.agents/feature-queue/queue.json`:
   - Feature actual → `"status": "done"`, `completedAt`, `branch`, `pr`.
   - Siguiente feature → `"status": "pending"` (no la implementes en este agente).
5. Regenera `.agents/feature-queue/NEXT_PROMPT.md` con el prompt del **siguiente** agente (plantilla en `prompt-template.md`).
6. Commit descriptivo, `git push -u origin <branch>`, abre PR draft contra `main`.
7. **Dispara el siguiente agente** (obligatorio para completar el ciclo que pidió el usuario):
   ```bash
   node scripts/spawn-next-feature-agent.mjs
   ```
   - Con `CURSOR_API_KEY` en el entorno del Cloud Agent → lanza el siguiente run vía API.
   - Sin API key → el script imprime el prompt; el operador crea un **nuevo** agente en [cursor.com/agents](https://cursor.com/agents) y lo pega.
8. **Para aquí.** No implementes la siguiente feature en esta misma ejecución.

El pipeline completo es: **agente N implementa → cierra → agente N+1 arranca** (contexto fresco cada vez). Repetir hasta que `queue.json` no tenga `pending`.

## Qué NO hacer

- No implementar dos features en un solo agente.
- No modificar `constitution/mission.md` ni `tech-stack.md` salvo que la spec lo exija explícitamente.
- No dejar `roadmap.md` desincronizado del código entregado.
- No omitir tests de casos de uso nuevos en `application/`.
