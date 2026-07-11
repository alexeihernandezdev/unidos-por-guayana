-- CreateTable
CREATE TABLE "seguimiento_eventos" (
    "id" TEXT NOT NULL,
    "ayudaId" TEXT NOT NULL,
    "estadoAnterior" "EstadoAyuda",
    "estadoNuevo" "EstadoAyuda" NOT NULL,
    "nota" TEXT,
    "evidenciaUrl" TEXT,
    "ocurridoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguimiento_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seguimiento_eventos_ayudaId_idx" ON "seguimiento_eventos"("ayudaId");

-- AddForeignKey
ALTER TABLE "seguimiento_eventos" ADD CONSTRAINT "seguimiento_eventos_ayudaId_fkey" FOREIGN KEY ("ayudaId") REFERENCES "ayudas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
