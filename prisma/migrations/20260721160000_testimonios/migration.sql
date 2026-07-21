CREATE TYPE "EstadoTestimonio" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'OCULTO');

CREATE TABLE "testimonios" (
  "id" TEXT NOT NULL,
  "autorId" TEXT NOT NULL,
  "solicitudId" TEXT,
  "titulo" TEXT NOT NULL,
  "contenido" TEXT NOT NULL,
  "estado" "EstadoTestimonio" NOT NULL DEFAULT 'PENDIENTE',
  "motivoRechazo" TEXT,
  "destacado" BOOLEAN NOT NULL DEFAULT false,
  "moderadoPorId" TEXT,
  "moderadoEn" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "testimonios_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "testimonios_autorId_idx" ON "testimonios"("autorId");
CREATE INDEX "testimonios_solicitudId_idx" ON "testimonios"("solicitudId");
CREATE INDEX "testimonios_estado_createdAt_idx" ON "testimonios"("estado", "createdAt");
CREATE INDEX "testimonios_estado_destacado_idx" ON "testimonios"("estado", "destacado");

ALTER TABLE "testimonios"
  ADD CONSTRAINT "testimonios_autorId_fkey"
  FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "testimonios"
  ADD CONSTRAINT "testimonios_solicitudId_fkey"
  FOREIGN KEY ("solicitudId") REFERENCES "solicitudes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "testimonios"
  ADD CONSTRAINT "testimonios_moderadoPorId_fkey"
  FOREIGN KEY ("moderadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
