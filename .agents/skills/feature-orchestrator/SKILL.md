---
name: feature-orchestrator
description: Orquesta la cola de features pendientes: prepara el prompt del siguiente agente cloud, una feature por ejecución, sin acumular contexto. Usar al iniciar o cerrar un ciclo de implementación.
---

# Orquestador de features (un agente por feature)

## Modelo de trabajo

```
Agente N  →  implementa feature X  →  PR + actualiza queue  →  CIERRA
Agente N+1  →  lee NEXT_PROMPT.md  →  implementa feature Y  →  …
```

Cada agente arranca con contexto fresco. El estado vive en el repo, no en la conversación.

## Archivos de estado

| Archivo | Rol |
|---------|-----|
| `.agents/feature-queue/queue.json` | Orden, estado (`pending` / `in_progress` / `done`) y metadatos por feature |
| `.agents/feature-queue/NEXT_PROMPT.md` | Prompt copiable para lanzar el próximo Cloud Agent |
| `.agents/feature-queue/prompt-template.md` | Plantilla del prompt |
| `.agents/skills/implement-feature/SKILL.md` | Instrucciones que debe seguir cada agente implementador |

## Cómo lanzar el siguiente agente

1. Abre [cursor.com/agents](https://cursor.com/agents) (o Agents en el IDE).
2. Crea un **nuevo** Cloud Agent sobre `main` (rama limpia).
3. Pega el contenido completo de `.agents/feature-queue/NEXT_PROMPT.md`.
4. Deja que el agente trabaje hasta PR + actualización de `queue.json` y `NEXT_PROMPT.md`.
5. **Archiva o cierra** ese agente antes de lanzar el siguiente.

Alternativa programática: [Cloud Agents API](https://cursor.com/docs/cloud-agent/api/endpoints.md) — un `POST /v1/agents` por feature, luego `archive`.

## Al crear la cola o reordenar

- El orden canónico está en `queue.json` → `order` y debe alinearse con `roadmap.md`.
- Cambios del cliente (015–019) van **antes** del backlog (009–014), como en el roadmap.

## Si un agente falla a mitad

1. No marques la feature como `done` en `queue.json`.
2. Deja `status: "in_progress"` con la rama/PR parcial anotados.
3. El siguiente intento puede reanudar la misma rama o abrir agente nuevo con: «Continúa la feature NNN en la rama X; revisa tasks.md y el diff existente.»
