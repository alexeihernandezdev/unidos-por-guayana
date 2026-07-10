# Prompt — próximo Cloud Agent

> **Feature en cola:** `020-catalogo-estados-municipios`  
> **Generado:** al crear la feature 020 (catálogo VE).  
> **Feature en cola:** `010-seguimiento-del-envio`  
> **Generado:** tras completar `009-tablero-publico-de-transparencia`.  
> **Instrucción:** crea un **nuevo** Cloud Agent, pega este prompt completo y archiva el agente anterior.

---

Implementa **una sola feature** del proyecto Unidos por la Guaira.

## Feature objetivo

- **ID:** 020
- **Nombre:** Catálogo de estados y municipios de Venezuela
- **Slug:** `020-catalogo-estados-municipios`
- **Spec:** `spec/spec_template/features/020-catalogo-estados-municipios/spec.md`
- **Plan:** `spec/spec_template/features/020-catalogo-estados-municipios/plan.md`
- **Tasks:** `spec/spec_template/features/020-catalogo-estados-municipios/tasks.md`
- **ID:** 010
- **Nombre:** Seguimiento del envío
- **Slug:** `010-seguimiento-del-envio`
- **Spec:** `spec/spec_template/features/010-seguimiento-del-envio/spec.md`
- **Plan:** `spec/spec_template/features/010-seguimiento-del-envio/plan.md`
- **Tasks:** `spec/spec_template/features/010-seguimiento-del-envio/tasks.md`

## Instrucciones obligatorias

1. Lee y sigue la skill `.agents/skills/implement-feature/SKILL.md` al pie de la letra.
2. Lee `AGENTS.md`, `spec/spec_template/README.md` y la guía Next.js 16 en `node_modules/next/dist/docs/`.
3. Crea la rama `cursor/catalogo-estados-municipios-020-3b92` desde `main`.
4. Implementa solo esta feature según spec/plan/tasks.
5. Ejecuta `pnpm test`, `pnpm exec eslint src`, `pnpm build`.
6. Al cerrar: actualiza roadmap, DOC (`DOC/features/020-catalogo-estados-municipios.md` y los DOC de 016/017), `tasks.md`, `.agents/feature-queue/queue.json` y regenera este archivo para la **siguiente** feature (`009-tablero-publico-de-transparencia`).
7. Abre PR draft contra `main` y **detente**. No implementes la feature 009 ni ninguna otra en esta ejecución.
3. Crea la rama `cursor/seguimiento-envio-010-3b92` desde `main`.
4. Implementa solo esta feature según spec/plan/tasks.
5. Ejecuta `pnpm test`, `pnpm exec eslint src`, `pnpm build`.
6. Al cerrar: actualiza roadmap, DOC (`DOC/features/010-seguimiento-del-envio.md`), `tasks.md`, `.agents/feature-queue/queue.json` y regenera este archivo para la **siguiente** feature (`011-puntos-de-acopio`).
7. Abre PR draft contra `main` y **detente**. No implementes la feature 011 ni ninguna otra en esta ejecución.

## Contexto

- Proyecto SDD (Spec Driven Development). La constitución manda sobre el código.
- Arquitectura Clean + Screaming en `src/modules/`.
- Esta feature **enmienda 016 y 017**: reemplaza texto libre `estado`/`parroquia` por FKs `estadoId`/`municipioId` a un catálogo sembrado en BD.
- Nuevo módulo `src/modules/ubicaciones` (domain / application / infrastructure / ui).
- El dataset de Venezuela vive en el repo (`prisma/data/…`) y se inserta con `pnpm db:seed` de forma idempotente.
- UI: selects en cascada (estado → municipios del estado) en registro, completar perfil, `/mi-perfil` y perfil admin.
- Mantén `ubicaciones/domain` y `ubicaciones/application` puros; sin CRUD de admin del catálogo.
- Alias de backfill: "Vargas" → estado La Guaira si aplica.
- Esta feature introduce el historial de trazabilidad (`SeguimientoEvento`) con transiciones de estado y evidencia de entrega.
- El tablero público (009) ya muestra solo el estado actual; 010 añade la línea de tiempo.
- Reutiliza la máquina de estados de Ayuda (005) y no dupliques lógica de transiciones.
