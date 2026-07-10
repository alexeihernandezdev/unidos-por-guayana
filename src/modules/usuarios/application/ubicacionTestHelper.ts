import { FakeUbicacionRepository } from "@/modules/ubicacion/application/fakes";
import type { Estado, Municipio } from "@/modules/ubicacion/domain/Ubicacion";

/** Catálogo mínimo para tests de usuarios (La Guaira → Vargas). */
export function crearUbicacionFakeTest() {
  const estadoId = "estado-la-guaira";
  const municipioId = "municipio-vargas";
  const estados: Estado[] = [
    {
      id: estadoId,
      codigoIso: "VE-X",
      idIne: 22,
      nombre: "La Guaira",
      capital: "La Guaira",
    },
  ];
  const municipios: Municipio[] = [
    {
      id: municipioId,
      nombre: "Vargas",
      capital: "La Guaira",
      estadoId,
    },
  ];
  return {
    ubicacion: new FakeUbicacionRepository(estados, municipios),
    estadoId,
    municipioId,
  };
}
