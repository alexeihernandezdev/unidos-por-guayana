# Prompt — próximo Cloud Agent

> **Feature en cola:** `015-superadmin-y-registro-de-administradores`  
> **Generado:** tras completar `008-panel-de-administracion`  
> **Instrucción:** crea un **nuevo** Cloud Agent, pega este prompt completo y archiva el agente anterior.

---

Implementa **una sola feature** del proyecto Unidos por Guayana.

## Feature objetivo

- **ID:** 015
- **Nombre:** Rol SUPERADMIN y registro público de administradores
- **Slug:** `015-superadmin-y-registro-de-administradores`
- **Spec:** `spec/spec_template/features/015-superadmin-y-registro-de-administradores/spec.md`
- **Plan:** `spec/spec_template/features/015-superadmin-y-registro-de-administradores/plan.md`
- **Tasks:** `spec/spec_template/features/015-superadmin-y-registro-de-administradores/tasks.md`

## Instrucciones obligatorias

1. Lee y sigue la skill `.agents/skills/implement-feature/SKILL.md` al pie de la letra.
2. Lee `AGENTS.md`, `spec/spec_template/README.md` y la guía Next.js 16 en `node_modules/next/dist/docs/`.
3. Crea la rama `cursor/superadmin-registro-admin-015-3b92` desde `main` (tras merge del PR de 008 si aún no está en main).
4. Implementa solo esta feature según spec/plan/tasks.
5. Ejecuta `pnpm test`, `pnpm lint`, `pnpm build`.
6. Al cerrar: actualiza roadmap, DOC (`DOC/features/015-superadmin-y-registro-de-administradores.md`), `tasks.md`, `.agents/feature-queue/queue.json` y regenera este archivo para la **siguiente** feature (`016-perfil-de-administrador-y-acopio`).
7. Abre PR draft contra `main` y **detente**. No implementes la feature 016 ni ninguna otra en esta ejecución.

## Contexto

- Proyecto SDD (Spec Driven Development). La constitución manda sobre el código.
- Arquitectura Clean + Screaming en `src/modules/`.
- Esta feature **enmienda 002** (autenticación): nuevo rol `SUPERADMIN`, registro público de `ADMIN` con verificación pendiente.
- Depende de que `008` esté integrada; el panel y el flujo admin actual son la base sobre la que se añade la bandeja del superadmin.
