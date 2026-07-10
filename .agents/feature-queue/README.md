# Cola de features — un agente por feature

Evita saturar el contexto: **cada Cloud Agent implementa exactamente una feature** y cierra.

## Inicio rápido

1. Abre `.agents/feature-queue/NEXT_PROMPT.md`
2. Crea un **nuevo** Cloud Agent en [cursor.com/agents](https://cursor.com/agents)
3. Pega el prompt completo
4. Cuando termine (PR + `queue.json` actualizado), **archiva** ese agente
5. Repite con el nuevo `NEXT_PROMPT.md` generado

## Archivos

- `queue.json` — estado de la cola
- `NEXT_PROMPT.md` — prompt listo para el próximo agente
- `prompt-template.md` — plantilla interna

## Skills relacionadas

- `.agents/skills/implement-feature/SKILL.md` — qué hace cada agente implementador
- `.agents/skills/feature-orchestrator/SKILL.md` — cómo orquestar el ciclo
