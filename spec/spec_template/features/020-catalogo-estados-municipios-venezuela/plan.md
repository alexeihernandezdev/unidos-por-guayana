# 020 · Catálogo de estados y municipios — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md`.

## Enfoque general

**Catálogo en BD → módulo `ubicacion` → migración FK en usuarios/perfil → seed → UI en cascada → enmienda dominio/aplicación de `usuarios`.**

## 1. Modelo de datos y migración

- `EstadoVenezuela`: `id`, `codigoIso` (único), `idIne` (único), `nombre` (único), `capital?`.
- `MunicipioVenezuela`: `id`, `nombre`, `capital?`, `estadoId` → FK; `@@unique([estadoId, nombre])`.
- `Usuario`: quitar `estado`, `parroquia`; añadir `estadoId?`, `municipioId?` con FKs.
- `PerfilAdmin`: quitar `estado`, `parroquia`; añadir `estadoId`, `municipioId` (obligatorios) con FKs.

## 2. Seed

- `prisma/data/venezuela-estados-municipios.json` (24 estados, 335 municipios).
- Función `sembrarCatalogoUbicacion(prisma)` en `prisma/seed-ubicacion.ts`, llamada desde `seed.ts`.
- Idempotente: upsert por `codigoIso` / par `(estadoId, nombre)`.
- Renombrar «Vargas» → «La Guaira».

## 3. Módulo `ubicacion`

- **Domain:** tipos `Estado`, `Municipio`, `UbicacionSeleccion`; `validarUbicacionCatalogo({ estadoId, municipioId })`; contrato `UbicacionRepository`.
- **Application:** `listarEstados`, `listarMunicipiosPorEstado`, `obtenerCatalogoParaFormulario` (árbol para selects).
- **Infrastructure:** `PrismaUbicacionRepository`.
- **UI:** `UbicacionSelectFields` (client, React Hook Form, cascada).

## 4. Enmienda `usuarios`

- `datosContacto.ts`: `estado`/`parroquia` → `estadoId`/`municipioId`.
- `PerfilAdmin.ts`: idem + mensajes «Indica el municipio».
- Casos de uso: validar pertenencia municipio↔estado vía `UbicacionRepository`.
- Repositorios Prisma: persistir FKs; incluir nombres al listar perfiles para bandeja.
- Formularios y actions: schemas zod con IDs; pasar catálogo desde server components.

## 5. Fachada

- `src/lib/ubicacion.ts` + `src/shared/ubicacion/index.ts`.

## 6. Tests

- Seed count (integración opcional), validación de ubicación, listar estados/municipios con fake repo.
