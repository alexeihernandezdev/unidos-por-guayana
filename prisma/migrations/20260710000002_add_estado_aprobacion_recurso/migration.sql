-- Feature 019 · Propuesta de recursos por el solicitante (enmienda de 004).
-- Añade el enum `EstadoAprobacionRecurso`, la columna `estadoAprobacion` y la
-- relación opcional `propuestoPor` (Usuario). Backfill: los recursos existentes
-- quedan `APROBADO` por el DEFAULT; `propuestoPorId` queda NULL para todo lo
-- previo.

-- CreateEnum
CREATE TYPE "EstadoAprobacionRecurso" AS ENUM ('APROBADO', 'PROPUESTO', 'RECHAZADO');

-- AlterTable (backfill implícito por el DEFAULT + NOT NULL)
ALTER TABLE "recursos"
  ADD COLUMN "estadoAprobacion" "EstadoAprobacionRecurso" NOT NULL DEFAULT 'APROBADO',
  ADD COLUMN "propuestoPorId" TEXT;

-- CreateIndex
CREATE INDEX "recursos_estadoAprobacion_idx" ON "recursos"("estadoAprobacion");

-- AddForeignKey
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_propuestoPorId_fkey"
  FOREIGN KEY ("propuestoPorId") REFERENCES "usuarios"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
