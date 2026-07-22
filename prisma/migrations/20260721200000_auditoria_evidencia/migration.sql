-- CreateTable: evidencia física de verificación subida por el AUDITOR (feature 032).
-- Interna (auditor/admin); el binario vive en Supabase Storage (prefijo auditoria/).
CREATE TABLE "archivos_evidencia_auditoria" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "subidoPorId" TEXT,
    "ciclo" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_evidencia_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "archivos_evidencia_auditoria_solicitudId_createdAt_idx" ON "archivos_evidencia_auditoria"("solicitudId", "createdAt");

-- AddForeignKey: al borrar la solicitud desaparece su evidencia.
ALTER TABLE "archivos_evidencia_auditoria" ADD CONSTRAINT "archivos_evidencia_auditoria_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitudes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: si se elimina la cuenta del auditor, la evidencia sobrevive (subidoPorId = null).
ALTER TABLE "archivos_evidencia_auditoria" ADD CONSTRAINT "archivos_evidencia_auditoria_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
