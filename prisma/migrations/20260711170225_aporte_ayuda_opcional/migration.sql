-- DropForeignKey
ALTER TABLE "aportes" DROP CONSTRAINT "aportes_ayudaId_fkey";

-- AlterTable
ALTER TABLE "aportes" ALTER COLUMN "ayudaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_ayudaId_fkey" FOREIGN KEY ("ayudaId") REFERENCES "ayudas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
