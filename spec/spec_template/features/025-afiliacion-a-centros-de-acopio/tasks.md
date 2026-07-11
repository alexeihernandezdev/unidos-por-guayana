# 025 · Tareas

## Base de datos
- [x] `Usuario.categoriasAporte CategoriaRecurso[]` (`@default([])`) + inversas `afiliaciones`/`red`.
- [x] `model Afiliacion` (`@@unique([colaboradorId, adminId])`, índices, FKs cascade).
- [x] Migración: crea `afiliaciones` + columna `categoriasAporte`.
- [x] `prisma/seed.ts`: categorías de ejemplo al COLABORADOR de prueba.
- [x] `migrate deploy` + `generate` sin drift (seed requiere credenciales SUPERADMIN en `.env`).

## Dominio
- [x] `afiliaciones/domain`: `Afiliacion`, `reglas` (intersección, normalizar/no vacías, propiedad),
      `AfiliacionRepository`, `LectorCentrosDisponibles`, tipos de lectura.
- [x] `usuarios/domain`: `categoriasAporte` en `Usuario`/`NuevoUsuario`; `actualizarCategoriasAporte`.
- [x] Tests de dominio: intersección, categorías válidas, propiedad.

## Aplicación
- [x] afiliaciones: afiliar, dejar, remover (propiedad), listarMiRed, contarAptosPorCategoria,
      listarCentrosDisponibles, listarDestinatariosConvocatoria; errores `NoAutorizadoError`.
- [x] usuarios: `declararCategorias`; `registrarUsuario` exige categorías al COLABORADOR.
- [x] Tests: unicidad, remover/re-afiliar, propiedad, conteo (solo verificados), destinatarios,
      declararCategorias, registro sin categorías.

## Infraestructura
- [x] `PrismaAfiliacionRepository` + `PrismaLectorCentrosDisponibles`; composition root `lib/afiliaciones`.
- [x] `PrismaUsuarioRepository.actualizarCategoriasAporte`.

## Presentación
- [x] Registro colaborador: categorías obligatorias (checkboxes) + validación en el server action.
- [x] `/mi-perfil`: editar categorías + gestionar afiliaciones (descubrir/afiliarse/dejar, expandir puntos).
- [x] `/panel/red`: red del admin, filtro por categoría, remover; enlace en el sidebar (`Mi red`).
- [x] Form crear Actividad: conteo de aptos por categoría del recurso seleccionado.

## Integración 012
- [x] `spec/features/012-notificaciones/spec.md` ya trae la "Actualización (post-025)": destinatario = red
      apta. El envío del aviso lo implementa 012; el cálculo de destinatarios queda listo y probado aquí.

## Cierre
- [x] `pnpm test` (314 tests), `pnpm exec eslint src`, `pnpm build` en verde.
- [x] `DOC/features/025-afiliacion-a-centros-de-acopio.md`.
- [x] `roadmap.md`: 025 a Hecho.
