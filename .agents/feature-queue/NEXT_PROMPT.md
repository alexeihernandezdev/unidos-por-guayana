# Prompt — próximo Cloud Agent

> **Feature en cola:** `017-datos-de-contacto-obligatorios`  
> **Generado:** tras completar `015-superadmin-y-registro-de-administradores`, `016-perfil-de-administrador-y-acopio`, `018-tipos-de-actividad-en-ayuda` y `019-propuesta-de-recursos-por-solicitante`.  
> **Instrucción:** crea un **nuevo** Cloud Agent, pega este prompt completo y archiva el agente anterior.

---

Implementa **una sola feature** del proyecto Unidos por la Guaira.

## Feature objetivo

- **ID:** 017
- **Nombre:** Datos de contacto obligatorios (colaborador y solicitante) — ampliada con ubicación y flag WhatsApp
- **Slug:** `017-datos-de-contacto-obligatorios`
- **Spec:** `spec/spec_template/features/017-datos-de-contacto-obligatorios/spec.md`
- **Plan:** `spec/spec_template/features/017-datos-de-contacto-obligatorios/plan.md`
- **Tasks:** `spec/spec_template/features/017-datos-de-contacto-obligatorios/tasks.md`

## Alcance ampliado (leer spec para detalle)

Además del alcance original (cédula + teléfono obligatorios para COLABORADOR/SOLICITANTE), esta feature integra:

1. **Ubicación obligatoria** (`estado` + `parroquia`) en `Usuario` para COLABORADOR/SOLICITANTE, texto libre igual que `PerfilAdmin` de 016.
2. **Flag `telefonoEsWhatsApp`** en `Usuario` (COLABORADOR/SOLICITANTE) **y** en `PerfilAdmin` (enmienda 016 para el ADMIN).
3. **Pantalla `/mi-perfil`** — el COLABORADOR/SOLICITANTE puede editar sus datos en cualquier momento, no solo la primera vez. Reutiliza el mismo caso de uso que `/completar-perfil` (`actualizarDatosContacto`, que sustituye al `completarDatosContacto` original).

Total de columnas nuevas en la migración: **5 en `usuarios`** (`cedula`, `telefono`, `telefonoEsWhatsApp`, `estado`, `parroquia`) + **1 en `perfiles_admin`** (`telefonoEsWhatsApp`).

## Instrucciones obligatorias

1. Lee y sigue la skill `.agents/skills/implement-feature/SKILL.md` al pie de la letra.
2. Lee `AGENTS.md`, `spec/spec_template/README.md` y la guía Next.js 16 en `node_modules/next/dist/docs/`.
3. Crea la rama `cursor/datos-contacto-obligatorios-017-3b92` desde `main`.
4. Implementa solo esta feature según spec/plan/tasks.
5. Ejecuta `pnpm test`, `pnpm lint`, `pnpm build`.
6. Al cerrar: actualiza roadmap, DOC (`DOC/features/017-datos-de-contacto-obligatorios.md`; también nota la enmienda en `DOC/features/002-*.md` y `DOC/features/016-*.md`), `tasks.md`, `.agents/feature-queue/queue.json` y regenera este archivo para la **siguiente** feature (`009-tablero-publico-de-transparencia`).
7. Abre PR draft contra `main` y **detente**. No implementes la feature 009 ni ninguna otra en esta ejecución.

## Contexto

- Proyecto SDD (Spec Driven Development). La constitución manda sobre el código.
- Arquitectura Clean + Screaming en `src/modules/`.
- Esta feature **enmienda 002 y 016**: añade contacto/ubicación obligatorios al registro de COLABORADOR/SOLICITANTE y suma `telefonoEsWhatsApp` a `PerfilAdmin`.
- **Ojo con el registro compartido:** el formulario y el server action de registro (`src/modules/usuarios/ui/RegistroForm.tsx` y `src/app/(auth)/registro/actions.ts`) ya ramifican por rol (016 metió el perfil del admin). Añade los nuevos campos sin romper esa ramificación y factoriza un componente `DatosContactoFields` reutilizable entre registro / completar-perfil / mi-perfil.
- **Guard sin bucles:** el guard debe redirigir a `/completar-perfil` a cuentas incompletas, y a la vez permitir que un usuario ya completo entre a `/mi-perfil`. Coordinar con `proxy.ts` (Next 16).
- Mantén `usuarios/domain` y `usuarios/application` puras; valida en el límite (zod) y en el dominio.
