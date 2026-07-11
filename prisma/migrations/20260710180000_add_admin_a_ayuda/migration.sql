-- Feature 022: cada Ayuda pertenece a un ADMIN dueño (`adminId`).
-- Dos pasos para no dejar nulos: columna nullable → backfill → NOT NULL + FK.

-- AlterTable
ALTER TABLE "ayudas" ADD COLUMN "adminId" TEXT;

-- Backfill: ADMIN semilla (email histórico del seed) → primer ADMIN por createdAt
-- → SUPERADMIN. Documentado en spec 022; simplificación consciente si ya hubiera
-- actividades de varios administradores "reales".
UPDATE "ayudas"
SET "adminId" = COALESCE(
  (
    SELECT "id" FROM "usuarios"
    WHERE "rol" = 'ADMIN' AND "email" = 'admin@unidosporlaguaira.org'
    LIMIT 1
  ),
  (
    SELECT "id" FROM "usuarios"
    WHERE "rol" = 'ADMIN'
    ORDER BY "createdAt" ASC
    LIMIT 1
  ),
  (
    SELECT "id" FROM "usuarios"
    WHERE "rol" = 'SUPERADMIN'
    ORDER BY "createdAt" ASC
    LIMIT 1
  )
)
WHERE "adminId" IS NULL;

-- AlterTable
ALTER TABLE "ayudas" ALTER COLUMN "adminId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ayudas_adminId_idx" ON "ayudas"("adminId");

-- AddForeignKey
ALTER TABLE "ayudas" ADD CONSTRAINT "ayudas_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
