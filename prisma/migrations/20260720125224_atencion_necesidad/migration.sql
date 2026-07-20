-- CreateTable
CREATE TABLE "atenciones_necesidad" (
    "id" TEXT NOT NULL,
    "recursoSolicitudId" TEXT NOT NULL,
    "metaRecursoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atenciones_necesidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "atenciones_necesidad_recursoSolicitudId_key" ON "atenciones_necesidad"("recursoSolicitudId");

-- CreateIndex
CREATE INDEX "atenciones_necesidad_metaRecursoId_idx" ON "atenciones_necesidad"("metaRecursoId");

-- AddForeignKey
ALTER TABLE "atenciones_necesidad" ADD CONSTRAINT "atenciones_necesidad_recursoSolicitudId_fkey" FOREIGN KEY ("recursoSolicitudId") REFERENCES "recursos_solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atenciones_necesidad" ADD CONSTRAINT "atenciones_necesidad_metaRecursoId_fkey" FOREIGN KEY ("metaRecursoId") REFERENCES "metas_recurso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
