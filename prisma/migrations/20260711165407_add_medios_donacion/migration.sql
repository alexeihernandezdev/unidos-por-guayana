-- CreateEnum
CREATE TYPE "TipoMedioDonacion" AS ENUM ('CUENTA_BANCARIA', 'PAGO_MOVIL', 'PAYPAL', 'ZELLE', 'BINANCE', 'EFECTIVO', 'OTRO');

-- DropForeignKey
ALTER TABLE "aportes" DROP CONSTRAINT "aportes_colaboradorId_fkey";

-- AlterTable
ALTER TABLE "aportes" ADD COLUMN     "medioDonacionId" TEXT,
ADD COLUMN     "moneda" TEXT,
ADD COLUMN     "referencia" TEXT,
ADD COLUMN     "registradoPorId" TEXT,
ALTER COLUMN "colaboradorId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "medios_donacion" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMedioDonacion" NOT NULL,
    "titular" TEXT NOT NULL,
    "moneda" TEXT NOT NULL,
    "datos" TEXT NOT NULL,
    "nota" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medios_donacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medios_donacion_activo_orden_idx" ON "medios_donacion"("activo", "orden");

-- CreateIndex
CREATE INDEX "aportes_medioDonacionId_idx" ON "aportes"("medioDonacionId");

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_medioDonacionId_fkey" FOREIGN KEY ("medioDonacionId") REFERENCES "medios_donacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
