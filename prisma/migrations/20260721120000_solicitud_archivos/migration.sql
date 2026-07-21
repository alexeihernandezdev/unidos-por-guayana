-- CreateEnum: rol del archivo dentro de la solicitud (feature 031).
CREATE TYPE "TipoArchivoSolicitud" AS ENUM ('PRINCIPAL', 'ADJUNTO');

-- CreateTable: metadatos de imagen principal / adjuntos de una solicitud (el binario
-- vive en Supabase Storage; aquí solo la ruta y los metadatos).
CREATE TABLE "archivos_solicitud" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "tipo" "TipoArchivoSolicitud" NOT NULL,
    "path" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "archivos_solicitud_solicitudId_idx" ON "archivos_solicitud"("solicitudId");

-- CreateIndex: como máximo UNA imagen principal por solicitud (índice único parcial).
CREATE UNIQUE INDEX "archivos_solicitud_principal_unico" ON "archivos_solicitud"("solicitudId") WHERE "tipo" = 'PRINCIPAL';

-- AddForeignKey: cascada al borrar la solicitud.
ALTER TABLE "archivos_solicitud" ADD CONSTRAINT "archivos_solicitud_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitudes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
