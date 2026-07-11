-- Feature 025 · Afiliación a centros de acopio y categorías de aporte.

-- Categorías declaradas del COLABORADOR (array del enum ya existente). Default
-- vacío para no romper filas existentes; el backfill de ejemplos va por el seed.
ALTER TABLE "usuarios"
  ADD COLUMN "categoriasAporte" "CategoriaRecurso"[] NOT NULL DEFAULT ARRAY[]::"CategoriaRecurso"[];

-- Vínculo colaborador -> admin (centro de acopio). Sin estado: existir = afiliado.
CREATE TABLE "afiliaciones" (
  "id" TEXT NOT NULL,
  "colaboradorId" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "afiliaciones_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "afiliaciones_colaboradorId_adminId_key" ON "afiliaciones"("colaboradorId", "adminId");
CREATE INDEX "afiliaciones_colaboradorId_idx" ON "afiliaciones"("colaboradorId");
CREATE INDEX "afiliaciones_adminId_idx" ON "afiliaciones"("adminId");

ALTER TABLE "afiliaciones" ADD CONSTRAINT "afiliaciones_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "afiliaciones" ADD CONSTRAINT "afiliaciones_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
