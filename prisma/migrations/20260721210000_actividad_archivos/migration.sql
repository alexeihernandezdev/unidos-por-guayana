-- CreateEnum: rol del archivo dentro de la actividad (feature 033).
CREATE TYPE "TipoArchivoActividad" AS ENUM ('PRINCIPAL', 'ADJUNTO');

-- CreateTable: metadatos de imagen principal / adjuntos de una actividad (el binario
-- vive en un bucket PÚBLICO de Supabase Storage; aquí solo la ruta y los metadatos).
CREATE TABLE "archivos_actividad" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "tipo" "TipoArchivoActividad" NOT NULL,
    "path" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "archivos_actividad_actividadId_idx" ON "archivos_actividad"("actividadId");

-- CreateIndex: como máximo UNA imagen principal por actividad (índice único parcial).
CREATE UNIQUE INDEX "archivos_actividad_principal_unico" ON "archivos_actividad"("actividadId") WHERE "tipo" = 'PRINCIPAL';

-- AddForeignKey: cascada al borrar la actividad.
ALTER TABLE "archivos_actividad" ADD CONSTRAINT "archivos_actividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
