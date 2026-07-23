-- Feature 035 · Ubicación estructurada (estado + municipio) en las solicitudes.
-- El auditor necesita saber exactamente dónde es cada petición. `sector` se mantiene
-- como detalle fino (barrio/zona) y ahora estado+municipio dan la ubicación por
-- catálogo. Migración en tres pasos porque las columnas son obligatorias y ya hay
-- solicitudes en base: (1) añadir nullable, (2) backfill, (3) fijar NOT NULL + FKs.

-- (1) Columnas nullable ────────────────────────────────────────────────────────
ALTER TABLE "solicitudes" ADD COLUMN "estadoId" TEXT;
ALTER TABLE "solicitudes" ADD COLUMN "municipioId" TEXT;

-- (2) Backfill ───────────────────────────────────────────────────────────────
-- 2a. Hereda la ubicación del perfil del solicitante cuando la tiene.
UPDATE "solicitudes" AS s
SET "estadoId" = u."estadoId",
    "municipioId" = u."municipioId"
FROM "usuarios" AS u
WHERE s."solicitanteId" = u."id"
  AND u."estadoId" IS NOT NULL
  AND u."municipioId" IS NOT NULL;

-- 2b. Fallback para las que quedaron sin ubicación: Caroní (Bolívar, VE-F), sede de
--     la operación. Solo aplica si el catálogo ya está sembrado (pnpm db:seed).
UPDATE "solicitudes" AS s
SET "estadoId" = e."id",
    "municipioId" = m."id"
FROM "estados" AS e
JOIN "municipios" AS m ON m."estadoId" = e."id" AND m."nombre" = 'Caroní'
WHERE e."codigo" = 'VE-F'
  AND s."estadoId" IS NULL;

-- (3) NOT NULL + índices + claves foráneas ──────────────────────────────────────
ALTER TABLE "solicitudes" ALTER COLUMN "estadoId" SET NOT NULL;
ALTER TABLE "solicitudes" ALTER COLUMN "municipioId" SET NOT NULL;

CREATE INDEX "solicitudes_estadoId_idx" ON "solicitudes"("estadoId");
CREATE INDEX "solicitudes_municipioId_idx" ON "solicitudes"("municipioId");

ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_estadoId_fkey"
  FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_municipioId_fkey"
  FOREIGN KEY ("municipioId") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
