import type { EstadoTestimonio } from "./EstadoTestimonio";
import type {
  CambiosTestimonio,
  NuevoTestimonio,
  Testimonio,
} from "./Testimonio";

export type FiltroTestimonios = {
  estado?: EstadoTestimonio;
  texto?: string;
  destacados?: boolean;
  autorId?: string;
  skip?: number;
  take?: number;
};

export interface TestimonioRepository {
  crear(datos: NuevoTestimonio): Promise<Testimonio>;
  buscarPorId(id: string): Promise<Testimonio | null>;
  listar(filtro?: FiltroTestimonios): Promise<Testimonio[]>;
  contar(filtro?: FiltroTestimonios): Promise<number>;
  editar(id: string, cambios: CambiosTestimonio): Promise<Testimonio>;
  moderar(
    id: string,
    estado: EstadoTestimonio,
    moderadoPorId: string,
    motivoRechazo?: string | null,
  ): Promise<Testimonio>;
  retirar(id: string): Promise<Testimonio>;
  eliminar(id: string): Promise<void>;
  destacarSiHayCupo(id: string, limite: number): Promise<Testimonio | null>;
  quitarDestacado(id: string): Promise<Testimonio>;
}
