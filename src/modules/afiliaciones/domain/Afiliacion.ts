import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { EstadoVerificacion } from "@/modules/usuarios/domain/Rol";

// Afiliacion (feature 025): vínculo entre un COLABORADOR y un ADMIN (centro de
// acopio). Puro: sin Prisma ni framework.
export type Afiliacion = {
  id: string;
  colaboradorId: string;
  adminId: string;
  createdAt: Date;
};

// Miembro de "la red" de un ADMIN, para la vista de gestión `/panel/red`. Incluye
// contacto porque el propósito es que el admin pueda convocar (coherente con 017).
export type MiembroRed = {
  colaboradorId: string;
  nombre: string;
  categorias: CategoriaRecurso[];
  estadoVerificacion: EstadoVerificacion;
  telefono: string | null;
  telefonoEsWhatsApp: boolean;
  afiliadoEn: Date;
};

// Punto de acopio activo mostrado al expandir un centro en el descubrimiento.
export type PuntoDeCentro = {
  id: string;
  nombre: string;
  referencia: string;
};

// Centro de acopio (cuenta ADMIN verificada) que un colaborador puede descubrir y
// elegir para afiliarse. `puntos` son sus puntos de acopio activos (drill-down).
export type CentroDisponible = {
  adminId: string;
  nombreCuenta: string;
  estadoId: string | null;
  municipioId: string | null;
  estadoNombre: string | null;
  municipioNombre: string | null;
  puntos: PuntoDeCentro[];
};
