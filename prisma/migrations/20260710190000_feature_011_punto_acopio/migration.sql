-- AlterTable
ALTER TABLE "puntos_acopio" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "correo" TEXT,
ADD COLUMN     "estadoId" TEXT NOT NULL,
ADD COLUMN     "horarios" TEXT NOT NULL,
ADD COLUMN     "latitud" DECIMAL(9,6) NOT NULL,
ADD COLUMN     "longitud" DECIMAL(9,6) NOT NULL,
ADD COLUMN     "municipioId" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "referencia" TEXT NOT NULL,
ADD COLUMN     "telefono" TEXT NOT NULL,
ADD COLUMN     "telefonoEsWhatsApp" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "puntos_acopio_estadoId_idx" ON "puntos_acopio"("estadoId");

-- CreateIndex
CREATE INDEX "puntos_acopio_municipioId_idx" ON "puntos_acopio"("municipioId");

-- CreateIndex
CREATE UNIQUE INDEX "puntos_acopio_adminId_nombre_key" ON "puntos_acopio"("adminId", "nombre");

-- AddForeignKey
ALTER TABLE "puntos_acopio" ADD CONSTRAINT "puntos_acopio_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_acopio" ADD CONSTRAINT "puntos_acopio_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

