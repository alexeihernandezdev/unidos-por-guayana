# Prompt — próximo Cloud Agent

> **Feature en cola:** `016-perfil-de-administrador-y-acopio`  
> **Generado:** tras completar `015-superadmin-y-registro-de-administradores`  
> **Instrucción:** crea un **nuevo** Cloud Agent, pega este prompt completo y archiva el agente anterior.

---

Implementa **una sola feature** del proyecto Unidos por Guayana.

## Feature objetivo

- **ID:** 016
- **Nombre:** Perfil de administrador y centro de acopio
- **Slug:** `016-perfil-de-administrador-y-acopio`
- **Spec:** `spec/spec_template/features/016-perfil-de-administrador-y-acopio/spec.md`
- **Plan:** `spec/spec_template/features/016-perfil-de-administrador-y-acopio/plan.md`
- **Tasks:** `spec/spec_template/features/016-perfil-de-administrador-y-acopio/tasks.md`

## Instrucciones obligatorias

1. Lee y sigue la skill `.agents/skills/implement-feature/SKILL.md` al pie de la letra.
2. Lee `AGENTS.md`, `spec/spec_template/README.md` y la guía Next.js 16 en `node_modules/next/dist/docs/`.
3. Crea la rama `cursor/perfil-admin-acopio-016-3b92` desde `main` (tras merge del PR de 015 si aún no está en main).
4. Implementa solo esta feature según spec/plan/tasks.
5. Ejecuta `pnpm test`, `pnpm lint`, `pnpm build`.
6. Al cerrar: actualiza roadmap, DOC (`DOC/features/016-perfil-de-administrador-y-acopio.md`), `tasks.md`, `.agents/feature-queue/queue.json` y regenera este archivo para la **siguiente** feature (`017-datos-de-contacto-obligatorios`).
7. Abre PR draft contra `main` y **detente**. No implementes la feature 017 ni ninguna otra en esta ejecución.

## Contexto

- Proyecto SDD (Spec Driven Development). La constitución manda sobre el código.
- Arquitectura Clean + Screaming en `src/modules/`.
- Esta feature **depende de 015**: el registro público de `ADMIN` y el ciclo de aprobación del
  `SUPERADMIN` ya están entregados. Aquí se amplía el perfil del `ADMIN` con los datos de centro de
  acopio (`PerfilAdmin`: `nombreCuenta`, `estado`, `parroquia`, `telefono`, `correo`, `documento` con
  `tipoDocumento` ∈ `JURIDICO` | `NATURAL`) y la relación con uno o varios `PuntoAcopio`. Conecta con 011.
- Reutiliza lo de 015: enum `Rol` con `SUPERADMIN`, `estadoVerificacion`, guard `requireAdminVerificado`
  y el predicado `puedeOperarComoAdmin` (punto único de verdad del enforcement). No dupliques el ciclo
  de aprobación; aquí se añaden los datos del perfil.
