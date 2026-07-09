-- CreateEnum
CREATE TYPE "UrgenciaSolicitud" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('ABIERTA', 'ATENDIDA', 'CERRADA');

-- CreateEnum
CREATE TYPE "CerradaPor" AS ENUM ('SOLICITANTE', 'ADMIN');

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "urgencia" "UrgenciaSolicitud" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'ABIERTA',
    "cerradaPor" "CerradaPor",
    "solicitanteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos_solicitud" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "recursoId" TEXT NOT NULL,
    "cantidadEstimada" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recursos_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solicitudes_estado_idx" ON "solicitudes"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_sector_idx" ON "solicitudes"("sector");

-- CreateIndex
CREATE UNIQUE INDEX "recursos_solicitud_solicitudId_recursoId_key" ON "recursos_solicitud"("solicitudId", "recursoId");

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos_solicitud" ADD CONSTRAINT "recursos_solicitud_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitudes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos_solicitud" ADD CONSTRAINT "recursos_solicitud_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
