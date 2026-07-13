-- Feature 026: la relación Actividad <-> PuntoAcopio pasa de un `puntoAcopioId`
-- único opcional (feature 024) a muchos a muchos vía la tabla puente
-- `actividad_punto_acopio`. Orden: crear la puente, backfillear las asignaciones
-- existentes y solo entonces eliminar la columna (no se pierden datos).

-- CreateTable
CREATE TABLE "actividad_punto_acopio" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "puntoAcopioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividad_punto_acopio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actividad_punto_acopio_actividadId_idx" ON "actividad_punto_acopio"("actividadId");

-- CreateIndex
CREATE INDEX "actividad_punto_acopio_puntoAcopioId_idx" ON "actividad_punto_acopio"("puntoAcopioId");

-- CreateIndex
CREATE UNIQUE INDEX "actividad_punto_acopio_actividadId_puntoAcopioId_key" ON "actividad_punto_acopio"("actividadId", "puntoAcopioId");

-- AddForeignKey
ALTER TABLE "actividad_punto_acopio" ADD CONSTRAINT "actividad_punto_acopio_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_punto_acopio" ADD CONSTRAINT "actividad_punto_acopio_puntoAcopioId_fkey" FOREIGN KEY ("puntoAcopioId") REFERENCES "puntos_acopio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: cada actividad con un `puntoAcopioId` previo pasa a tener una fila en la
-- tabla puente. `gen_random_uuid()` (PG 16) genera el id de cada fila.
INSERT INTO "actividad_punto_acopio" ("id", "actividadId", "puntoAcopioId", "createdAt")
SELECT gen_random_uuid()::text, "id", "puntoAcopioId", now()
FROM "actividades"
WHERE "puntoAcopioId" IS NOT NULL;

-- DropForeignKey (después del backfill)
ALTER TABLE "actividades" DROP CONSTRAINT "actividades_puntoAcopioId_fkey";

-- DropIndex
DROP INDEX "actividades_puntoAcopioId_idx";

-- AlterTable
ALTER TABLE "actividades" DROP COLUMN "puntoAcopioId";
