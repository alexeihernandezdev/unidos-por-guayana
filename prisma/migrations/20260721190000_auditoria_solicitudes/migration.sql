ALTER TYPE "Rol" ADD VALUE 'AUDITOR';

CREATE TYPE "EstadoVerificacionSolicitud" AS ENUM (
  'PENDIENTE',
  'EN_REVISION',
  'REQUIERE_INFORMACION',
  'VERIFICADA',
  'NO_VERIFICADA'
);

CREATE TYPE "TipoEventoAuditoriaSolicitud" AS ENUM (
  'CREADA',
  'TOMADA',
  'LIBERADA',
  'DICTAMEN',
  'REENVIADA'
);

ALTER TABLE "solicitudes"
  ADD COLUMN "estadoVerificacion" "EstadoVerificacionSolicitud" NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN "auditorActualId" TEXT,
  ADD COLUMN "cicloAuditoria" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "eventos_auditoria_solicitud" (
  "id" TEXT NOT NULL,
  "solicitudId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "tipo" "TipoEventoAuditoriaSolicitud" NOT NULL,
  "estadoResultante" "EstadoVerificacionSolicitud" NOT NULL,
  "ciclo" INTEGER NOT NULL,
  "metodo" TEXT,
  "notaInterna" TEXT,
  "explicacionPublica" TEXT,
  "referenciaExterna" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "eventos_auditoria_solicitud_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "solicitudes_estadoVerificacion_createdAt_idx"
  ON "solicitudes"("estadoVerificacion", "createdAt");
CREATE INDEX "solicitudes_auditorActualId_idx"
  ON "solicitudes"("auditorActualId");
CREATE INDEX "eventos_auditoria_solicitud_solicitudId_createdAt_idx"
  ON "eventos_auditoria_solicitud"("solicitudId", "createdAt");
CREATE INDEX "eventos_auditoria_solicitud_actorId_createdAt_idx"
  ON "eventos_auditoria_solicitud"("actorId", "createdAt");

ALTER TABLE "solicitudes"
  ADD CONSTRAINT "solicitudes_auditorActualId_fkey"
  FOREIGN KEY ("auditorActualId") REFERENCES "usuarios"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "eventos_auditoria_solicitud"
  ADD CONSTRAINT "eventos_auditoria_solicitud_solicitudId_fkey"
  FOREIGN KEY ("solicitudId") REFERENCES "solicitudes"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "eventos_auditoria_solicitud"
  ADD CONSTRAINT "eventos_auditoria_solicitud_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "usuarios"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
