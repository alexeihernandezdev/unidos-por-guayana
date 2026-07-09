-- CreateEnum
CREATE TYPE "EstadoAporte" AS ENUM ('COMPROMETIDO', 'RECIBIDO');

-- CreateTable
CREATE TABLE "aportes" (
    "id" TEXT NOT NULL,
    "ayudaId" TEXT NOT NULL,
    "recursoId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoAporte" NOT NULL DEFAULT 'COMPROMETIDO',
    "nota" TEXT,
    "recibidoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aportes_ayudaId_idx" ON "aportes"("ayudaId");

-- CreateIndex
CREATE INDEX "aportes_ayudaId_recursoId_estado_idx" ON "aportes"("ayudaId", "recursoId", "estado");

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_ayudaId_fkey" FOREIGN KEY ("ayudaId") REFERENCES "ayudas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
