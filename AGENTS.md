<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Estructura del proyecto (Spec Driven Development)

Revisar `spec/spec_template/README.md`: ahí se encuentra la estructura a trabajar.

## Skills

Las skills del proyecto se encuentran en `.agents/skills/`
(`frontend-design`, `vercel-react-best-practices`, `implement-feature`, `feature-orchestrator`).

## Implementación por features (agentes cloud)

Un **agente = una feature**. No encadenar varias en la misma conversación.

1. Cola y estado: `.agents/feature-queue/queue.json`
2. Prompt del próximo agente: `.agents/feature-queue/NEXT_PROMPT.md`
3. Skill del implementador: `.agents/skills/implement-feature/SKILL.md`
4. Cómo orquestar: `.agents/skills/feature-orchestrator/SKILL.md`

Al cerrar una feature, el agente actualiza roadmap, DOC, `queue.json` y regenera `NEXT_PROMPT.md` para la siguiente.
