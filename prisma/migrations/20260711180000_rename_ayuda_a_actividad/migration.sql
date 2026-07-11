-- Feature 024 · Renombre `Ayuda` -> `Actividad` y ciclo de vida por tipo.
-- Rename (no recreación) para conservar los datos existentes. El backfill de los
-- estados de JORNADA/EVENTO_SOCIAL va en la migración siguiente, porque Postgres no
-- permite USAR un valor de enum recién añadido en la misma transacción que lo añade.

-- Enum de estado: renombrar el tipo y añadir los estados de la secuencia de eventos.
ALTER TYPE "EstadoAyuda" RENAME TO "EstadoActividad";
ALTER TYPE "EstadoActividad" ADD VALUE 'LISTA';
ALTER TYPE "EstadoActividad" ADD VALUE 'EN_CURSO';
ALTER TYPE "EstadoActividad" ADD VALUE 'REALIZADA';

-- Tabla `ayudas` -> `actividades` (conserva filas). Renombrar también PK, índices y
-- FK a la nomenclatura Prisma del nuevo nombre para no dejar drift de esquema.
ALTER TABLE "ayudas" RENAME TO "actividades";
ALTER TABLE "actividades" RENAME CONSTRAINT "ayudas_pkey" TO "actividades_pkey";
ALTER TABLE "actividades" RENAME CONSTRAINT "ayudas_adminId_fkey" TO "actividades_adminId_fkey";
ALTER INDEX "ayudas_adminId_idx" RENAME TO "actividades_adminId_idx";
ALTER INDEX "ayudas_tipo_idx" RENAME TO "actividades_tipo_idx";
ALTER INDEX "ayudas_estado_idx" RENAME TO "actividades_estado_idx";
ALTER INDEX "ayudas_fecha_idx" RENAME TO "actividades_fecha_idx";

-- Columnas nuevas de la Actividad.
ALTER TABLE "actividades" ADD COLUMN "horaFin" TIMESTAMP(3);
ALTER TABLE "actividades" ADD COLUMN "puntoAcopioId" TEXT;
CREATE INDEX "actividades_puntoAcopioId_idx" ON "actividades"("puntoAcopioId");
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_puntoAcopioId_fkey" FOREIGN KEY ("puntoAcopioId") REFERENCES "puntos_acopio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- FK `ayudaId` -> `actividadId` en las tablas que referencian la actividad.
ALTER TABLE "metas_recurso" RENAME COLUMN "ayudaId" TO "actividadId";
ALTER TABLE "metas_recurso" RENAME CONSTRAINT "metas_recurso_ayudaId_fkey" TO "metas_recurso_actividadId_fkey";
ALTER INDEX "metas_recurso_ayudaId_recursoId_key" RENAME TO "metas_recurso_actividadId_recursoId_key";

ALTER TABLE "aportes" RENAME COLUMN "ayudaId" TO "actividadId";
ALTER TABLE "aportes" RENAME CONSTRAINT "aportes_ayudaId_fkey" TO "aportes_actividadId_fkey";
ALTER INDEX "aportes_ayudaId_idx" RENAME TO "aportes_actividadId_idx";
ALTER INDEX "aportes_ayudaId_recursoId_estado_idx" RENAME TO "aportes_actividadId_recursoId_estado_idx";
