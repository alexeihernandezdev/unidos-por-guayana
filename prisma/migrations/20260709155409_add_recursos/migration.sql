-- CreateEnum
CREATE TYPE "CategoriaRecurso" AS ENUM ('SUMINISTRO', 'TRANSPORTE', 'PERSONAL', 'MONETARIO');

-- CreateTable
CREATE TABLE "recursos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidad" TEXT NOT NULL,
    "categoria" "CategoriaRecurso" NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recursos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recursos_nombre_key" ON "recursos"("nombre");
