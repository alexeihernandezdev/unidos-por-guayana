# Cola de features — un agente por feature

Evita saturar el contexto: **cada Cloud Agent implementa exactamente una feature** y cierra.

## Inicio rápido

1. El agente implementa **una** feature y al cerrar ejecuta `node scripts/spawn-next-feature-agent.mjs`
2. Se archiva ese agente; el siguiente arranca con `NEXT_PROMPT.md` (API o manual)
3. Repetir hasta que no queden features `pending` en `queue.json`

### Primera vez (cola ya preparada, falta agente 2)

La feature **008** ya está hecha en el PR #3, pero **nadie lanzó el agente 2**. Para continuar ahora:

```bash
node scripts/spawn-next-feature-agent.mjs
```

O pega `.agents/feature-queue/NEXT_PROMPT.md` en un **nuevo** Cloud Agent (feature **015**).

## Archivos

- `queue.json` — estado de la cola
- `NEXT_PROMPT.md` — prompt listo para el próximo agente
- `prompt-template.md` — plantilla interna

## Skills relacionadas

- `.agents/skills/implement-feature/SKILL.md` — qué hace cada agente implementador
- `.agents/skills/feature-orchestrator/SKILL.md` — cómo orquestar el ciclo
