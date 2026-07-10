# Prompt — próximo Cloud Agent

> **Feature en cola:** `017-datos-de-contacto-obligatorios`  
> **Generado:** tras completar `015-superadmin-y-registro-de-administradores`, `016-perfil-de-administrador-y-acopio`, `018-tipos-de-actividad-en-ayuda` y `019-propuesta-de-recursos-por-solicitante`.  
> **Instrucción:** crea un **nuevo** Cloud Agent, pega este prompt completo y archiva el agente anterior.

---

Implementa **una sola feature** del proyecto Unidos por la Guaira.

## Feature objetivo

- **ID:** 017
- **Nombre:** Datos de contacto obligatorios (colaborador y solicitante)
- **Slug:** `017-datos-de-contacto-obligatorios`
- **Spec:** `spec/spec_template/features/017-datos-de-contacto-obligatorios/spec.md`
- **Plan:** `spec/spec_template/features/017-datos-de-contacto-obligatorios/plan.md`
- **Tasks:** `spec/spec_template/features/017-datos-de-contacto-obligatorios/tasks.md`

## Instrucciones obligatorias

1. Lee y sigue la skill `.agents/skills/implement-feature/SKILL.md` al pie de la letra.
2. Lee `AGENTS.md`, `spec/spec_template/README.md` y la guía Next.js 16 en `node_modules/next/dist/docs/`.
3. Crea la rama `cursor/datos-contacto-obligatorios-017-3b92` desde `main` (tras merge de los PR de 015 y 016 si aún no están en main).
4. Implementa solo esta feature según spec/plan/tasks.
5. Ejecuta `pnpm test`, `pnpm lint`, `pnpm build`.
6. Al cerrar: actualiza roadmap, DOC (`DOC/features/017-datos-de-contacto-obligatorios.md`), `tasks.md`, `.agents/feature-queue/queue.json` y regenera este archivo para la **siguiente** feature (`018-tipos-de-actividad-en-ayuda`).
7. Abre PR draft contra `main` y **detente**. No implementes la feature 018 ni ninguna otra en esta ejecución.

## Contexto

- Proyecto SDD (Spec Driven Development). La constitución manda sobre el código.
- Arquitectura Clean + Screaming en `src/modules/`.
- Esta feature **enmienda 002**: añade `cedula` y `telefono` obligatorios al registro de
  `COLABORADOR` y `SOLICITANTE`. Es análoga en espíritu a lo que la 016 hizo para el `ADMIN`
  (datos de contacto en el registro), pero para los otros dos roles y sobre el modelo `Usuario`.
- **Ojo con el registro compartido:** el formulario y el server action de registro
  (`src/modules/usuarios/ui/RegistroForm.tsx` y `src/app/(auth)/registro/actions.ts`) ya ramifican
  por rol (016 metió el perfil del admin). Añade los campos de contacto para colaborador/solicitante
  sin romper esa ramificación ni el registro de admin.
- Mantén `usuarios/domain` y `usuarios/application` puras; valida en el límite (zod) y en el dominio.
