---
name: feature-orchestrator
description: Orquesta la cola de features pendientes: prepara el prompt del siguiente agente cloud, una feature por ejecución, sin acumular contexto. Usar al iniciar o cerrar un ciclo de implementación.
---

# Orquestador de features (un agente por feature)

## Modelo de trabajo

```
Agente 1  →  feature 008  →  PR + NEXT_PROMPT  →  spawn agente 2  →  CIERRA agente 1
Agente 2  →  feature 015  →  PR + NEXT_PROMPT  →  spawn agente 3  →  CIERRA agente 2
… hasta vaciar queue.json
```

Cada agente implementa **una** feature con contexto fresco. **Lanzar el siguiente agente** es el último paso del cierre — no basta con dejar `NEXT_PROMPT.md` y parar.

## Archivos de estado

| Archivo | Rol |
|---------|-----|
| `.agents/feature-queue/queue.json` | Orden, estado (`pending` / `in_progress` / `done`) |
| `.agents/feature-queue/NEXT_PROMPT.md` | Prompt del próximo Cloud Agent |
| `scripts/spawn-next-feature-agent.mjs` | Dispara el siguiente agente (API o instrucciones manuales) |
| `.agents/skills/implement-feature/SKILL.md` | Qué hace cada agente implementador |

## Cómo lanzar el siguiente agente

Al terminar una feature, el agente ejecuta:

```bash
node scripts/spawn-next-feature-agent.mjs
```

| `CURSOR_API_KEY` | Resultado |
|------------------|-----------|
| Configurada (secret del Cloud Environment) | `POST https://api.cursor.com/v1/agents` con `NEXT_PROMPT.md` |
| No configurada | Imprime el prompt; operador crea **nuevo** agente en [cursor.com/agents](https://cursor.com/agents) |

Después **archiva** el agente que terminó.

Docs API: [Cloud Agents API](https://cursor.com/docs/cloud-agent/api/endpoints.md)

## Al crear la cola o reordenar

- El orden canónico está en `queue.json` → `order` y debe alinearse con `roadmap.md`.
- Cambios del cliente (015–019) van **antes** del backlog (009–014).

## Si un agente falla a mitad

1. No marques la feature como `done` en `queue.json`.
2. Deja `status: "in_progress"` con rama/PR anotados.
3. Reintenta con agente nuevo: «Continúa la feature NNN en la rama X».
