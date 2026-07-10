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

## Cursor Cloud specific instructions

Standard commands live in `README.md` / `package.json` (`pnpm dev`, `pnpm test`, `pnpm build`, `pnpm db:migrate`, `pnpm db:seed`). Only the non-obvious caveats below are specific to the Cursor Cloud VM.

- **PostgreSQL runs natively, not via Docker.** Docker is not available in this VM, so the DB from `docker-compose.yml` is replaced by a local PostgreSQL 16 cluster (installed via apt). It is **not** started automatically on boot — start it before running migrations/seed/dev with `sudo pg_ctlcluster 16 main start` (or `sudo service postgresql start`). The `unidos_por_la_guaira` database, the `laguaira`/`laguaira` role, applied migrations and seeded users persist in the VM snapshot; you normally only need to (re)start the cluster.
- **`.env` uses port 5432, not 5435.** The README's 5435 exists only to avoid a host Postgres conflict that doesn't happen here. The VM's `.env` (git-ignored, already present) sets `DATABASE_URL=postgresql://laguaira:laguaira@localhost:5432/unidos_por_la_guaira?schema=public`. Seeded ADMIN: `admin@unidosporlaguaira.org` / `Admin1234!` (test COLABORADOR and SOLICITANTE users are also seeded — see `.env`).
- **`pnpm lint` fails on pre-existing, non-app files.** Committed helper scripts under `.claude/skills/**/scripts/*.cjs` trigger `@typescript-eslint/no-require-imports` errors unrelated to the application. To lint only the app, run `pnpm exec eslint src` (clean).
- **Seeding needs `jiti`.** `pnpm db:seed` runs `jiti prisma/seed.ts`; `jiti` is declared as a devDependency so the script works after `pnpm install`.
