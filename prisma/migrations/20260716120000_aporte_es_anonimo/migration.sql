-- AlterTable: bandera de anonimato del aporte (feature 029).
ALTER TABLE "aportes" ADD COLUMN "esAnonimo" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: los aportes imputados sin colaborador (donaciones anónimas de 014)
-- pasan a marcarse anónimos por consistencia con el nuevo modelo.
UPDATE "aportes" SET "esAnonimo" = true WHERE "colaboradorId" IS NULL;
