-- CreateEnum
CREATE TYPE "EstadoAyuda" AS ENUM ('RECOLECTANDO', 'LISTO', 'EN_TRANSITO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "ayudas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "sectorDestino" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoAyuda" NOT NULL DEFAULT 'RECOLECTANDO',
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ayudas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas_recurso" (
    "id" TEXT NOT NULL,
    "ayudaId" TEXT NOT NULL,
    "recursoId" TEXT NOT NULL,
    "cantidadObjetivo" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_recurso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "metas_recurso_ayudaId_recursoId_key" ON "metas_recurso"("ayudaId", "recursoId");

-- AddForeignKey
ALTER TABLE "metas_recurso" ADD CONSTRAINT "metas_recurso_ayudaId_fkey" FOREIGN KEY ("ayudaId") REFERENCES "ayudas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas_recurso" ADD CONSTRAINT "metas_recurso_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
