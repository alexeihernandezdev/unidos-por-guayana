import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

// Seeder de DESARROLLO. NO usar en producción. Crea una red de centros de
// acopio y un escenario operativo completo para probar panel, actividades,
// transparencia, metas, aportes y solicitudes. `admin1@test.com` concentra
// el escenario más denso. Todos los aportes pertenecen a
// `colaborador1@test.com`.
//
// Cuentas: admin1@test.com … admin5@test.com, colaborador1@test.com,
// solicitante1@test.com y auditor1@test.com, todas con contraseña 123.
//
// Ejecutar con: `pnpm db:seed:dev` (requiere el catálogo de ubicación ya
// sembrado: `pnpm db:seed` primero).

const PASSWORD = "123";

type SemillaPunto = {
  nombre: string;
  referencia: string;
  latitud: string;
  longitud: string;
  horarios: string;
  telefono: string;
  telefonoEsWhatsApp?: boolean;
  correo?: string;
};

type SemillaAdmin = {
  email: string;
  nombre: string;
  nombreCuenta: string;
  telefono: string;
  // Códigos del catálogo (ISO 3166-2:VE y `<estado>-<nn>`).
  codigoEstado: string;
  nombreMunicipio: string;
  puntos: SemillaPunto[];
};

// Ciudad Guayana = municipio Caroní (estado Bolívar). Coordenadas reales de
// zonas de Puerto Ordaz / San Félix; el resto en Caracas y Maracaibo.
const ADMINS: SemillaAdmin[] = [
  {
    email: "admin1@test.com",
    nombre: "Fundación Orinoco",
    nombreCuenta: "Fundación Orinoco",
    telefono: "0412 1110001",
    codigoEstado: "VE-F",
    nombreMunicipio: "Caroní",
    puntos: [
      {
        nombre: "Sede Alta Vista",
        referencia: "C.C. Ciudad Alta Vista, nivel PB, frente a la feria",
        latitud: "8.2951",
        longitud: "-62.7421",
        horarios: "Lunes a viernes de 9:00 a 17:00",
        telefono: "0412 1110001",
        correo: "altavista@orinoco.test",
      },
      {
        nombre: "Punto San Félix",
        referencia: "Plaza Bolívar de San Félix, casa amarilla con portón azul",
        latitud: "8.3591",
        longitud: "-62.6203",
        horarios: "Lunes a sábado de 8:00 a 14:00",
        telefono: "0414 1110002",
      },
      {
        nombre: "Punto Unare",
        referencia: "Sector Unare II, al lado del ambulatorio",
        latitud: "8.2765",
        longitud: "-62.7658",
        horarios: "Martes y jueves de 10:00 a 16:00",
        telefono: "0424 1110003",
        telefonoEsWhatsApp: false,
      },
    ],
  },
  {
    email: "admin2@test.com",
    nombre: "Manos de Guayana",
    nombreCuenta: "Manos de Guayana",
    telefono: "0414 2220001",
    codigoEstado: "VE-F",
    nombreMunicipio: "Caroní",
    puntos: [
      {
        nombre: "Sede Puerto Ordaz",
        referencia: "Centro de Puerto Ordaz, edificio Torre Loreto, PB",
        latitud: "8.2823",
        longitud: "-62.7186",
        horarios: "Lunes a viernes de 8:30 a 16:30",
        telefono: "0414 2220001",
        correo: "sede@manosguayana.test",
      },
      {
        nombre: "Punto Castillito",
        referencia: "Castillito, frente a la cancha techada",
        latitud: "8.2896",
        longitud: "-62.7069",
        horarios: "Sábados de 9:00 a 13:00",
        telefono: "0416 2220002",
      },
      {
        nombre: "Punto Los Olivos",
        referencia: "Urb. Los Olivos, casa comunal",
        latitud: "8.3012",
        longitud: "-62.7305",
        horarios: "Lunes, miércoles y viernes de 14:00 a 18:00",
        telefono: "0412 2220003",
      },
    ],
  },
  {
    email: "admin3@test.com",
    nombre: "Red Caroní Solidaria",
    nombreCuenta: "Red Caroní Solidaria",
    telefono: "0424 3330001",
    codigoEstado: "VE-F",
    nombreMunicipio: "Caroní",
    puntos: [
      {
        nombre: "Sede Villa Asia",
        referencia: "Villa Asia, local 12 del mercado municipal",
        latitud: "8.2704",
        longitud: "-62.7532",
        horarios: "Lunes a viernes de 9:00 a 15:00",
        telefono: "0424 3330001",
        correo: "villaasia@caroni.test",
      },
      {
        nombre: "Punto Core 8",
        referencia: "Core 8, iglesia San Buenaventura, salón parroquial",
        latitud: "8.3547",
        longitud: "-62.6412",
        horarios: "Domingos de 8:00 a 12:00",
        telefono: "0426 3330002",
      },
      {
        nombre: "Punto Chirica",
        referencia: "La Chirica, escuela básica, entrada lateral",
        latitud: "8.3689",
        longitud: "-62.6098",
        horarios: "Lunes a viernes de 7:00 a 12:00",
        telefono: "0412 3330003",
        telefonoEsWhatsApp: false,
      },
    ],
  },
  {
    email: "admin4@test.com",
    nombre: "Ayuda Capital",
    nombreCuenta: "Ayuda Capital",
    telefono: "0412 4440001",
    codigoEstado: "VE-A",
    nombreMunicipio: "Libertador",
    puntos: [
      {
        nombre: "Sede La Candelaria",
        referencia: "La Candelaria, esquina de Alcabala, local rojo",
        latitud: "10.5061",
        longitud: "-66.9036",
        horarios: "Lunes a viernes de 9:00 a 17:00",
        telefono: "0412 4440001",
        correo: "candelaria@ayudacapital.test",
      },
      {
        nombre: "Punto Catia",
        referencia: "Catia, boulevard, al lado de la estación del metro",
        latitud: "10.5169",
        longitud: "-66.9452",
        horarios: "Lunes a sábado de 8:00 a 14:00",
        telefono: "0414 4440002",
      },
      {
        nombre: "Punto El Valle",
        referencia: "El Valle, casa parroquial de la iglesia Santa Rosalía",
        latitud: "10.4581",
        longitud: "-66.8946",
        horarios: "Miércoles y sábados de 9:00 a 13:00",
        telefono: "0416 4440003",
      },
    ],
  },
  {
    email: "admin5@test.com",
    nombre: "Zulia Solidaria",
    nombreCuenta: "Zulia Solidaria",
    telefono: "0414 5550001",
    codigoEstado: "VE-V",
    nombreMunicipio: "Maracaibo",
    puntos: [
      {
        nombre: "Sede Bella Vista",
        referencia: "Av. Bella Vista con calle 72, edificio Onix, PB",
        latitud: "10.6666",
        longitud: "-71.6124",
        horarios: "Lunes a viernes de 8:00 a 16:00",
        telefono: "0414 5550001",
        correo: "bellavista@zuliasolidaria.test",
      },
      {
        nombre: "Punto La Limpia",
        referencia: "La Limpia, frente al centro comercial Gran Bazar",
        latitud: "10.6631",
        longitud: "-71.6712",
        horarios: "Lunes a sábado de 9:00 a 15:00",
        telefono: "0424 5550002",
      },
      {
        nombre: "Punto Centro",
        referencia: "Casco central, plaza Baralt, local de la gobernación",
        latitud: "10.6427",
        longitud: "-71.6125",
        horarios: "Lunes a viernes de 8:00 a 13:00",
        telefono: "0426 5550003",
        telefonoEsWhatsApp: false,
      },
    ],
  },
];

const COLABORADOR = {
  email: "colaborador1@test.com",
  nombre: "Carlos Colaborador",
  cedula: "V-20111222",
  telefono: "0412 9990001",
  codigoEstado: "VE-F",
  nombreMunicipio: "Caroní",
};

const SOLICITANTE = {
  email: "solicitante1@test.com",
  nombre: "María Solicitante",
  cedula: "V-18999111",
  telefono: "0414 8880001",
  codigoEstado: "VE-F",
  nombreMunicipio: "Caroní",
};

const AUDITOR = {
  email: "auditor1@test.com",
  nombre: "Ana Auditora",
};

type CategoriaRecurso =
  | "SUMINISTRO"
  | "TRANSPORTE"
  | "PERSONAL"
  | "MONETARIO";

type SemillaRecurso = {
  clave: string;
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string;
  objetivoBase: number;
};

const RECURSOS: SemillaRecurso[] = [
  {
    clave: "agua",
    nombre: "Agua potable",
    unidad: "litros",
    categoria: "SUMINISTRO",
    descripcion: "Agua apta para consumo humano en botellones o botellas selladas.",
    objetivoBase: 1200,
  },
  {
    clave: "alimentos",
    nombre: "Alimentos no perecederos",
    unidad: "cajas",
    categoria: "SUMINISTRO",
    descripcion: "Cajas surtidas de alimentos secos y enlatados.",
    objetivoBase: 240,
  },
  {
    clave: "higiene",
    nombre: "Kits de higiene",
    unidad: "kits",
    categoria: "SUMINISTRO",
    descripcion: "Jabón, crema dental, toallas sanitarias y artículos de aseo.",
    objetivoBase: 180,
  },
  {
    clave: "medicinas",
    nombre: "Medicinas esenciales",
    unidad: "kits",
    categoria: "SUMINISTRO",
    descripcion: "Kits básicos de medicamentos e insumos de primeros auxilios.",
    objetivoBase: 90,
  },
  {
    clave: "ropa",
    nombre: "Ropa y calzado",
    unidad: "bultos",
    categoria: "SUMINISTRO",
    descripcion: "Ropa y calzado clasificados por talla y en buen estado.",
    objetivoBase: 120,
  },
  {
    clave: "colchonetas",
    nombre: "Colchonetas",
    unidad: "unidades",
    categoria: "SUMINISTRO",
    descripcion: "Colchonetas individuales para refugios temporales.",
    objetivoBase: 100,
  },
  {
    clave: "combustible",
    nombre: "Combustible",
    unidad: "litros",
    categoria: "SUMINISTRO",
    descripcion: "Combustible destinado exclusivamente al traslado de ayuda.",
    objetivoBase: 500,
  },
  {
    clave: "camion",
    nombre: "Camión de carga",
    unidad: "viajes",
    categoria: "TRANSPORTE",
    descripcion: "Viajes en camión para movilizar suministros y equipos.",
    objetivoBase: 6,
  },
  {
    clave: "transporte",
    nombre: "Transporte comunitario",
    unidad: "viajes",
    categoria: "TRANSPORTE",
    descripcion: "Traslado de voluntarios y beneficiarios en unidades colectivas.",
    objetivoBase: 10,
  },
  {
    clave: "voluntarios",
    nombre: "Voluntarios",
    unidad: "personas",
    categoria: "PERSONAL",
    descripcion: "Personas para clasificación, logística y entrega de recursos.",
    objetivoBase: 40,
  },
  {
    clave: "medicos",
    nombre: "Personal médico",
    unidad: "personas",
    categoria: "PERSONAL",
    descripcion: "Médicos, enfermeros y personal de atención primaria.",
    objetivoBase: 12,
  },
  {
    clave: "logistica",
    nombre: "Equipo de logística",
    unidad: "personas",
    categoria: "PERSONAL",
    descripcion: "Personal para inventario, coordinación y distribución.",
    objetivoBase: 18,
  },
  {
    clave: "monetario",
    nombre: "Aporte monetario",
    unidad: "USD",
    categoria: "MONETARIO",
    descripcion: "Fondos recibidos por medios externos para cubrir gastos operativos.",
    objetivoBase: 2500,
  },
];

type TipoActividad = "ENVIO" | "JORNADA" | "EVENTO_SOCIAL";
type EstadoActividad =
  | "RECOLECTANDO"
  | "LISTO"
  | "EN_TRANSITO"
  | "ENTREGADO"
  | "LISTA"
  | "EN_CURSO"
  | "REALIZADA";

type SemillaActividad = {
  slug: string;
  admin: number;
  titulo: string;
  sector: string;
  tipo: TipoActividad;
  estado: EstadoActividad;
  dias: number;
  recursos: string[];
  progreso: number;
  pendientes?: boolean;
  descripcion: string;
};

const ACTIVIDADES: SemillaActividad[] = [
  { slug: "agua-unare", admin: 1, titulo: "Agua segura para Unare", sector: "Unare II", tipo: "ENVIO", estado: "RECOLECTANDO", dias: 8, recursos: ["agua", "camion", "combustible"], progreso: 0.35, pendientes: true, descripcion: "Recolección y distribución de agua potable para familias con servicio irregular." },
  { slug: "alimentos-core-8", admin: 1, titulo: "Alimentos para Core 8", sector: "Core 8", tipo: "ENVIO", estado: "RECOLECTANDO", dias: 12, recursos: ["alimentos", "higiene", "voluntarios"], progreso: 0.62, pendientes: true, descripcion: "Entrega de cajas de alimentos y kits de higiene a hogares priorizados." },
  { slug: "medicinas-villa-bahia", admin: 1, titulo: "Ruta de medicinas Villa Bahía", sector: "Villa Bahía", tipo: "ENVIO", estado: "LISTO", dias: 3, recursos: ["medicinas", "transporte", "medicos"], progreso: 1, descripcion: "Insumos médicos listos para ser trasladados al ambulatorio comunitario." },
  { slug: "convoy-san-felix", admin: 1, titulo: "Convoy solidario San Félix", sector: "San Félix", tipo: "ENVIO", estado: "EN_TRANSITO", dias: 0, recursos: ["agua", "alimentos", "camion"], progreso: 1, descripcion: "Convoy en ruta con suministros básicos para tres comunidades." },
  { slug: "familias-chirica", admin: 1, titulo: "Entrega a familias de La Chirica", sector: "La Chirica", tipo: "ENVIO", estado: "ENTREGADO", dias: -12, recursos: ["alimentos", "ropa", "higiene"], progreso: 1.08, descripcion: "Entrega completada con apoyo adicional de la comunidad." },
  { slug: "salud-vista-sol", admin: 1, titulo: "Jornada de salud Vista al Sol", sector: "Vista al Sol", tipo: "JORNADA", estado: "RECOLECTANDO", dias: 15, recursos: ["medicinas", "medicos", "monetario"], progreso: 0.48, pendientes: true, descripcion: "Consulta general, despistaje y entrega de medicamentos esenciales." },
  { slug: "vacunacion-castillito", admin: 1, titulo: "Vacunación comunitaria Castillito", sector: "Castillito", tipo: "JORNADA", estado: "LISTA", dias: 4, recursos: ["medicos", "voluntarios", "transporte"], progreso: 1, descripcion: "Equipo y personal confirmados para la jornada de vacunación." },
  { slug: "pediatria-olivos", admin: 1, titulo: "Atención pediátrica Los Olivos", sector: "Los Olivos", tipo: "JORNADA", estado: "EN_CURSO", dias: 0, recursos: ["medicinas", "medicos", "higiene"], progreso: 1, descripcion: "Atención pediátrica y orientación nutricional en ejecución." },
  { slug: "integral-el-roble", admin: 1, titulo: "Jornada integral El Roble", sector: "El Roble", tipo: "JORNADA", estado: "REALIZADA", dias: -18, recursos: ["medicos", "voluntarios", "medicinas"], progreso: 1.12, descripcion: "Jornada completada con consultas, vacunación y atención social." },
  { slug: "regreso-clases", admin: 1, titulo: "Regreso a clases solidario", sector: "Francisca Duarte", tipo: "EVENTO_SOCIAL", estado: "RECOLECTANDO", dias: 22, recursos: ["monetario", "voluntarios", "transporte"], progreso: 0.2, pendientes: true, descripcion: "Actividad recreativa y entrega de útiles para niños de la comunidad." },
  { slug: "navidad-comunitaria", admin: 1, titulo: "Navidad comunitaria", sector: "Puerto Ordaz", tipo: "EVENTO_SOCIAL", estado: "LISTA", dias: 6, recursos: ["alimentos", "voluntarios", "monetario"], progreso: 1, descripcion: "Encuentro comunitario con logística y recursos ya confirmados." },
  { slug: "encuentro-adultos-mayores", admin: 1, titulo: "Encuentro de adultos mayores", sector: "Alta Vista", tipo: "EVENTO_SOCIAL", estado: "EN_CURSO", dias: 0, recursos: ["transporte", "alimentos", "voluntarios"], progreso: 0.85, descripcion: "Jornada recreativa y de acompañamiento actualmente en curso." },
  { slug: "festival-caroni", admin: 1, titulo: "Festival solidario Caroní", sector: "Cachamay", tipo: "EVENTO_SOCIAL", estado: "REALIZADA", dias: -30, recursos: ["monetario", "logistica", "voluntarios"], progreso: 1.15, descripcion: "Evento realizado para recaudar fondos y conectar organizaciones locales." },
  { slug: "abastecimiento-25-mayo", admin: 1, titulo: "Abastecimiento 25 de Mayo", sector: "25 de Mayo", tipo: "ENVIO", estado: "RECOLECTANDO", dias: 18, recursos: ["agua", "alimentos", "colchonetas"], progreso: 0, pendientes: true, descripcion: "Campaña recién iniciada para abastecer un refugio temporal." },
  { slug: "apoyo-lluvias", admin: 1, titulo: "Apoyo por lluvias en San José", sector: "San José de Chirica", tipo: "ENVIO", estado: "RECOLECTANDO", dias: 5, recursos: ["colchonetas", "ropa", "higiene", "agua"], progreso: 0.78, pendientes: true, descripcion: "Respuesta urgente a familias afectadas por fuertes lluvias." },
  { slug: "ropa-manoa", admin: 1, titulo: "Ropa para refugio Manoa", sector: "Manoa", tipo: "ENVIO", estado: "LISTO", dias: 2, recursos: ["ropa", "colchonetas", "camion"], progreso: 1, descripcion: "Carga clasificada y preparada para salir al refugio." },
  { slug: "traslado-insumos", admin: 1, titulo: "Traslado de insumos médicos", sector: "Dalla Costa", tipo: "ENVIO", estado: "EN_TRANSITO", dias: 0, recursos: ["medicinas", "combustible", "camion"], progreso: 1, descripcion: "Insumos en traslado hacia centros de atención primaria." },
  { slug: "entrega-sur", admin: 1, titulo: "Entrega alimentaria Zona Sur", sector: "Zona Sur", tipo: "ENVIO", estado: "ENTREGADO", dias: -7, recursos: ["alimentos", "agua", "logistica"], progreso: 1.05, descripcion: "Entrega finalizada y verificada por el equipo de campo." },
  { slug: "manos-guayana-alimentos", admin: 2, titulo: "Ruta alimentaria Las Amazonas", sector: "Las Amazonas", tipo: "ENVIO", estado: "RECOLECTANDO", dias: 10, recursos: ["alimentos", "camion"], progreso: 0.45, pendientes: true, descripcion: "Ruta de apoyo alimentario coordinada por Manos de Guayana." },
  { slug: "manos-guayana-jornada", admin: 2, titulo: "Jornada preventiva Castillito", sector: "Castillito", tipo: "JORNADA", estado: "REALIZADA", dias: -9, recursos: ["medicos", "medicinas"], progreso: 1, descripcion: "Jornada preventiva completada con atención primaria." },
  { slug: "caroni-higiene", admin: 3, titulo: "Kits de higiene para Core 8", sector: "Core 8", tipo: "ENVIO", estado: "LISTO", dias: 3, recursos: ["higiene", "transporte"], progreso: 1, descripcion: "Kits clasificados y preparados para su distribución." },
  { slug: "caroni-evento", admin: 3, titulo: "Encuentro juvenil Caroní", sector: "Villa Asia", tipo: "EVENTO_SOCIAL", estado: "RECOLECTANDO", dias: 20, recursos: ["voluntarios", "monetario"], progreso: 0.3, pendientes: true, descripcion: "Encuentro cultural y formativo para jóvenes." },
  { slug: "capital-salud", admin: 4, titulo: "Salud comunitaria La Candelaria", sector: "La Candelaria", tipo: "JORNADA", estado: "EN_CURSO", dias: 0, recursos: ["medicos", "medicinas"], progreso: 0.9, descripcion: "Atención médica comunitaria en ejecución." },
  { slug: "capital-catia", admin: 4, titulo: "Suministros para Catia", sector: "Catia", tipo: "ENVIO", estado: "ENTREGADO", dias: -15, recursos: ["agua", "alimentos"], progreso: 1.1, descripcion: "Suministros entregados a organizaciones comunitarias." },
  { slug: "zulia-agua", admin: 5, titulo: "Agua para Maracaibo Oeste", sector: "La Limpia", tipo: "ENVIO", estado: "EN_TRANSITO", dias: 0, recursos: ["agua", "camion", "combustible"], progreso: 1, descripcion: "Carga de agua en tránsito hacia Maracaibo Oeste." },
  { slug: "zulia-comunitario", admin: 5, titulo: "Encuentro comunitario Zulia", sector: "Bella Vista", tipo: "EVENTO_SOCIAL", estado: "LISTA", dias: 5, recursos: ["voluntarios", "alimentos", "monetario"], progreso: 1, descripcion: "Evento comunitario listo para comenzar." },
];

const SOLICITUDES = [
  { slug: "core-8-agua", sector: "Core 8", urgencia: "ALTA" as const, estado: "ABIERTA" as const, recursos: ["agua", "alimentos"], descripcion: "Varias familias presentan fallas prolongadas de agua y alimentos." },
  { slug: "core-8-medicinas", sector: "Core 8", urgencia: "MEDIA" as const, estado: "ABIERTA" as const, recursos: ["medicinas"], descripcion: "El ambulatorio comunitario necesita reponer insumos esenciales." },
  { slug: "chirica-lluvias", sector: "La Chirica", urgencia: "ALTA" as const, estado: "ABIERTA" as const, recursos: ["colchonetas", "ropa", "higiene"], descripcion: "Familias afectadas por lluvias requieren apoyo inmediato." },
  { slug: "unare-alimentos", sector: "Unare II", urgencia: "MEDIA" as const, estado: "ABIERTA" as const, recursos: ["alimentos", "agua"], descripcion: "Comedor comunitario solicita insumos para continuar operando." },
  { slug: "vista-sol-salud", sector: "Vista al Sol", urgencia: "ALTA" as const, estado: "ABIERTA" as const, recursos: ["medicinas", "medicos"], descripcion: "Se solicita una jornada médica para adultos mayores y niños." },
  { slug: "olivos-transporte", sector: "Los Olivos", urgencia: "BAJA" as const, estado: "ABIERTA" as const, recursos: ["transporte"], descripcion: "Se requiere traslado para una actividad preventiva comunitaria." },
  { slug: "san-felix-higiene", sector: "San Félix", urgencia: "MEDIA" as const, estado: "ABIERTA" as const, recursos: ["higiene", "agua"], descripcion: "Escuela usada como refugio necesita kits de higiene." },
  { slug: "manoa-refugio", sector: "Manoa", urgencia: "ALTA" as const, estado: "ATENDIDA" as const, recursos: ["ropa", "colchonetas"], descripcion: "Solicitud atendida mediante la entrega al refugio local." },
  { slug: "dalla-costa-medicinas", sector: "Dalla Costa", urgencia: "MEDIA" as const, estado: "ATENDIDA" as const, recursos: ["medicinas"], descripcion: "Insumos médicos canalizados hacia el centro asistencial." },
  { slug: "alta-vista-voluntarios", sector: "Alta Vista", urgencia: "BAJA" as const, estado: "CERRADA" as const, recursos: ["voluntarios"], descripcion: "La comunidad resolvió la convocatoria por medios propios." },
];

const TESTIMONIOS = [
  {
    slug: "refugio-manoa",
    autor: "SOLICITANTE" as const,
    solicitudSlug: "manoa-refugio",
    titulo: "La ayuda llegó cuando más la necesitábamos",
    contenido:
      "Después de las lluvias, varias familias del refugio no tenían dónde descansar. La coordinación fue clara y las colchonetas y la ropa llegaron organizadas, sin promesas vacías. Sentimos que nuestra solicitud fue escuchada con respeto.",
    estado: "APROBADO" as const,
    destacado: true,
    dias: -36,
  },
  {
    slug: "aportar-con-confianza",
    autor: "COLABORADOR" as const,
    solicitudSlug: null,
    titulo: "Ahora sé a dónde llega cada aporte",
    contenido:
      "Poder consultar la actividad, los recursos necesarios y el punto de acopio antes de colaborar me dio mucha confianza. Entregué mi aporte y luego pude seguir el avance de la jornada desde la plataforma.",
    estado: "APROBADO" as const,
    destacado: true,
    dias: -29,
  },
  {
    slug: "medicinas-dalla-costa",
    autor: "SOLICITANTE" as const,
    solicitudSlug: "dalla-costa-medicinas",
    titulo: "Una respuesta concreta para el ambulatorio",
    contenido:
      "La solicitud de insumos médicos se convirtió en una respuesta concreta. El equipo mantuvo comunicación con la comunidad y los medicamentos fueron canalizados hacia el centro asistencial que realmente los necesitaba.",
    estado: "APROBADO" as const,
    destacado: true,
    dias: -23,
  },
  {
    slug: "voluntariado-organizado",
    autor: "COLABORADOR" as const,
    solicitudSlug: null,
    titulo: "Colaborar se siente ordenado y transparente",
    contenido:
      "Antes no sabía cómo integrarme a una iniciativa local. Aquí encontré actividades con metas claras, horarios y responsables identificados. Esa organización hace más sencillo comprometer tiempo y recursos de manera responsable.",
    estado: "APROBADO" as const,
    destacado: false,
    dias: -17,
  },
  {
    slug: "seguimiento-chirica",
    autor: "SOLICITANTE" as const,
    solicitudSlug: "chirica-lluvias",
    titulo: "Estamos esperando la validación",
    contenido:
      "Registré la situación de varias familias afectadas por las lluvias y pude detallar las necesidades del sector. El proceso muestra claramente que la solicitud está pendiente de revisión antes de movilizar recursos.",
    estado: "PENDIENTE" as const,
    destacado: false,
    dias: -5,
  },
  {
    slug: "primera-experiencia",
    autor: "COLABORADOR" as const,
    solicitudSlug: null,
    titulo: "Mi primera experiencia como colaborador",
    contenido:
      "La información de cada actividad me ayudó a elegir dónde podía ser más útil. La experiencia fue sencilla y quiero compartirla para que otras personas también se animen a participar en su comunidad.",
    estado: "PENDIENTE" as const,
    destacado: false,
    dias: -3,
  },
  {
    slug: "informacion-sensible",
    autor: "SOLICITANTE" as const,
    solicitudSlug: "core-8-agua",
    titulo: "Datos de contacto de la comunidad",
    contenido:
      "Quería publicar los datos personales de varias familias para facilitar el contacto directo durante la entrega de agua y alimentos en el sector.",
    estado: "RECHAZADO" as const,
    destacado: false,
    motivoRechazo:
      "El testimonio contiene información sensible de terceros. Reescríbelo sin datos personales.",
    dias: -11,
  },
  {
    slug: "campana-anterior",
    autor: "COLABORADOR" as const,
    solicitudSlug: null,
    titulo: "Una campaña que unió a muchas personas",
    contenido:
      "La jornada reunió a vecinos, voluntarios y centros de acopio alrededor de una meta común. El testimonio se conserva en el historial, aunque ya no se muestra en el archivo público principal.",
    estado: "OCULTO" as const,
    destacado: false,
    dias: -48,
  },
];

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(PASSWORD, 12);

    // El catálogo va primero: metas, aportes y solicitudes dependen de él.
    const recursosPorClave = new Map<string, { id: string; semilla: SemillaRecurso }>();
    for (const recurso of RECURSOS) {
      const fila = await prisma.recurso.upsert({
        where: { nombre: recurso.nombre },
        update: {
          unidad: recurso.unidad,
          categoria: recurso.categoria,
          descripcion: recurso.descripcion,
          activo: true,
          estadoAprobacion: "APROBADO",
          propuestoPorId: null,
        },
        create: {
          id: `seed-dev-recurso-${recurso.clave}`,
          nombre: recurso.nombre,
          unidad: recurso.unidad,
          categoria: recurso.categoria,
          descripcion: recurso.descripcion,
          activo: true,
          estadoAprobacion: "APROBADO",
        },
      });
      recursosPorClave.set(recurso.clave, { id: fila.id, semilla: recurso });
    }
    console.log(`✔ ${recursosPorClave.size} recursos aprobados.`);

    // Resolver ids del catálogo (debe estar sembrado: `pnpm db:seed`).
    async function ubicacion(codigoEstado: string, nombreMunicipio: string) {
      const estado = await prisma.estado.findUnique({
        where: { codigo: codigoEstado },
      });
      if (!estado) {
        throw new Error(
          `Estado ${codigoEstado} no encontrado. Ejecuta antes: pnpm db:seed`,
        );
      }
      const municipio = await prisma.municipio.findFirst({
        where: { estadoId: estado.id, nombre: nombreMunicipio },
      });
      if (!municipio) {
        throw new Error(
          `Municipio ${nombreMunicipio} no encontrado en ${codigoEstado}.`,
        );
      }
      return { estadoId: estado.id, municipioId: municipio.id };
    }

    const adminsPorNumero = new Map<number, string>();
    const puntosPorAdmin = new Map<number, string[]>();

    for (const [indice, admin] of ADMINS.entries()) {
      const numeroAdmin = indice + 1;
      const { estadoId, municipioId } = await ubicacion(
        admin.codigoEstado,
        admin.nombreMunicipio,
      );

      const usuario = await prisma.usuario.upsert({
        where: { email: admin.email },
        update: {
          passwordHash,
          nombre: admin.nombre,
          rol: "ADMIN",
          estadoVerificacion: "VERIFICADO",
        },
        create: {
          email: admin.email,
          passwordHash,
          nombre: admin.nombre,
          rol: "ADMIN",
          estadoVerificacion: "VERIFICADO",
        },
      });

      const perfil = {
        nombreCuenta: admin.nombreCuenta,
        estadoId,
        municipioId,
        telefono: admin.telefono,
        telefonoEsWhatsApp: true,
        correo: admin.email,
        tipoDocumento: "JURIDICO" as const,
        numeroDocumento: `J-${admin.email.slice(5, 6)}0123456`,
      };
      await prisma.perfilAdmin.upsert({
        where: { usuarioId: usuario.id },
        update: perfil,
        create: { usuarioId: usuario.id, ...perfil },
      });

      const puntoIds: string[] = [];
      for (const punto of admin.puntos) {
        const datos = {
          referencia: punto.referencia,
          latitud: punto.latitud,
          longitud: punto.longitud,
          horarios: punto.horarios,
          telefono: punto.telefono,
          telefonoEsWhatsApp: punto.telefonoEsWhatsApp ?? true,
          correo: punto.correo ?? null,
          estadoId,
          municipioId,
          activo: true,
        };
        const puntoCreado = await prisma.puntoAcopio.upsert({
          where: {
            adminId_nombre: { adminId: usuario.id, nombre: punto.nombre },
          },
          update: datos,
          create: { adminId: usuario.id, nombre: punto.nombre, ...datos },
        });
        puntoIds.push(puntoCreado.id);
      }

      adminsPorNumero.set(numeroAdmin, usuario.id);
      puntosPorAdmin.set(numeroAdmin, puntoIds);

      console.log(
        `✔ ${admin.email} (ADMIN VERIFICADO, ${admin.nombreMunicipio}) con ${admin.puntos.length} puntos.`,
      );
    }

    // Colaborador con perfil completo (pasa el guard de datos de contacto).
    const ubicacionColab = await ubicacion(
      COLABORADOR.codigoEstado,
      COLABORADOR.nombreMunicipio,
    );
    const colaborador = await prisma.usuario.upsert({
      where: { email: COLABORADOR.email },
      update: {
        passwordHash,
        nombre: COLABORADOR.nombre,
        rol: "COLABORADOR",
        cedula: COLABORADOR.cedula,
        telefono: COLABORADOR.telefono,
        telefonoEsWhatsApp: true,
        categoriasAporte: {
          set: ["SUMINISTRO", "TRANSPORTE", "PERSONAL", "MONETARIO"],
        },
        ...ubicacionColab,
      },
      create: {
        email: COLABORADOR.email,
        passwordHash,
        nombre: COLABORADOR.nombre,
        rol: "COLABORADOR",
        cedula: COLABORADOR.cedula,
        telefono: COLABORADOR.telefono,
        telefonoEsWhatsApp: true,
        categoriasAporte: [
          "SUMINISTRO",
          "TRANSPORTE",
          "PERSONAL",
          "MONETARIO",
        ],
        ...ubicacionColab,
      },
    });
    console.log(`✔ ${COLABORADOR.email} (COLABORADOR, perfil completo).`);

    const ubicacionSolicitante = await ubicacion(
      SOLICITANTE.codigoEstado,
      SOLICITANTE.nombreMunicipio,
    );
    const solicitante = await prisma.usuario.upsert({
      where: { email: SOLICITANTE.email },
      update: {
        passwordHash,
        nombre: SOLICITANTE.nombre,
        rol: "SOLICITANTE",
        estadoVerificacion: "VERIFICADO",
        cedula: SOLICITANTE.cedula,
        telefono: SOLICITANTE.telefono,
        telefonoEsWhatsApp: true,
        ...ubicacionSolicitante,
      },
      create: {
        email: SOLICITANTE.email,
        passwordHash,
        nombre: SOLICITANTE.nombre,
        rol: "SOLICITANTE",
        estadoVerificacion: "VERIFICADO",
        cedula: SOLICITANTE.cedula,
        telefono: SOLICITANTE.telefono,
        telefonoEsWhatsApp: true,
        ...ubicacionSolicitante,
      },
    });
    console.log(`✔ ${SOLICITANTE.email} (SOLICITANTE, perfil completo).`);

    await prisma.usuario.upsert({
      where: { email: AUDITOR.email },
      update: {
        passwordHash,
        nombre: AUDITOR.nombre,
        rol: "AUDITOR",
        estadoVerificacion: "VERIFICADO",
      },
      create: {
        email: AUDITOR.email,
        passwordHash,
        nombre: AUDITOR.nombre,
        rol: "AUDITOR",
        estadoVerificacion: "VERIFICADO",
      },
    });
    console.log(`✔ ${AUDITOR.email} (AUDITOR VERIFICADO).`);

    // El colaborador principal forma parte de varias redes, pero conserva libertad
    // para aportar a cualquier actividad de la plataforma.
    for (const numeroAdmin of [1, 2, 3]) {
      const adminId = adminsPorNumero.get(numeroAdmin);
      if (!adminId) throw new Error(`No se encontró admin${numeroAdmin}.`);
      await prisma.afiliacion.upsert({
        where: {
          colaboradorId_adminId: {
            colaboradorId: colaborador.id,
            adminId,
          },
        },
        update: {},
        create: { colaboradorId: colaborador.id, adminId },
      });
    }

    const hoy = new Date();
    function fechaRelativa(dias: number, hora = 9) {
      const fecha = new Date(hoy);
      fecha.setHours(hora, 0, 0, 0);
      fecha.setDate(fecha.getDate() + dias);
      return fecha;
    }

    // Amplía las fechas base a una ventana de unos tres meses. Las actividades
    // terminadas quedan repartidas hacia atrás, las que están en curso cerca de
    // hoy y las planificadas avanzan hasta unas seis semanas hacia adelante.
    function diasEnVentanaTrimestral(diasBase: number, indice: number) {
      const diasDistribuidos =
        diasBase === 0 ? -(indice % 4) * 2 : Math.round(diasBase * 1.8);
      return Math.max(-40, Math.min(40, diasDistribuidos));
    }

    // El gráfico "Actividades por mes" agrupa por `createdAt`, no por la fecha
    // programada. Reparte el alta entre el mes actual y los dos anteriores,
    // garantizando además que nunca quede después de la fecha de la actividad.
    function fechaCreacionTrimestral(diasActividad: number, indice: number) {
      const mes = indice % 3;
      const antiguedad = -(mes * 30 + 4 + (indice % 5));
      return fechaRelativa(Math.min(diasActividad - 7, antiguedad), 10);
    }

    function redondear(cantidad: number) {
      return Math.round(cantidad * 100) / 100;
    }

    let metasCreadas = 0;
    let aportesCreados = 0;

    for (const [indice, semilla] of ACTIVIDADES.entries()) {
      const adminId = adminsPorNumero.get(semilla.admin);
      if (!adminId) throw new Error(`No se encontró admin${semilla.admin}.`);

      const diasActividad = diasEnVentanaTrimestral(semilla.dias, indice);
      const fecha = fechaRelativa(
        diasActividad,
        semilla.tipo === "ENVIO" ? 8 : 9,
      );
      const createdAt = fechaCreacionTrimestral(diasActividad, indice);
      const horaFin =
        semilla.tipo === "ENVIO"
          ? null
          : new Date(fecha.getTime() + 4 * 60 * 60 * 1000);
      const actividadId = `seed-dev-actividad-${semilla.slug}`;
      await prisma.actividad.upsert({
        where: { id: actividadId },
        update: {
          adminId,
          titulo: semilla.titulo,
          sectorDestino: semilla.sector,
          fecha,
          horaFin,
          estado: semilla.estado,
          tipo: semilla.tipo,
          descripcion: semilla.descripcion,
          createdAt,
        },
        create: {
          id: actividadId,
          adminId,
          titulo: semilla.titulo,
          sectorDestino: semilla.sector,
          fecha,
          horaFin,
          estado: semilla.estado,
          tipo: semilla.tipo,
          descripcion: semilla.descripcion,
          createdAt,
        },
      });

      const puntos = puntosPorAdmin.get(semilla.admin) ?? [];
      const puntosAsignados = puntos.length
        ? [
            puntos[indice % puntos.length],
            ...(semilla.recursos.length >= 4 && puntos.length > 1
              ? [puntos[(indice + 1) % puntos.length]]
              : []),
          ]
        : [];
      for (const puntoAcopioId of new Set(puntosAsignados)) {
        await prisma.actividadPuntoAcopio.upsert({
          where: { actividadId_puntoAcopioId: { actividadId, puntoAcopioId } },
          update: {},
          create: { actividadId, puntoAcopioId },
        });
      }

      for (const [indiceRecurso, claveRecurso] of semilla.recursos.entries()) {
        const recurso = recursosPorClave.get(claveRecurso);
        if (!recurso) throw new Error(`Recurso demo desconocido: ${claveRecurso}.`);

        const factor = 1 + ((indice + indiceRecurso) % 3) * 0.25;
        const objetivo = redondear(recurso.semilla.objetivoBase * factor);
        await prisma.metaRecurso.upsert({
          where: {
            actividadId_recursoId: {
              actividadId,
              recursoId: recurso.id,
            },
          },
          update: { cantidadObjetivo: objetivo },
          create: {
            id: `seed-dev-meta-${semilla.slug}-${claveRecurso}`,
            actividadId,
            recursoId: recurso.id,
            cantidadObjetivo: objetivo,
          },
        });
        metasCreadas += 1;

        const cantidadRecibida = redondear(objetivo * semilla.progreso);
        if (cantidadRecibida > 0) {
          const aporteId = `seed-dev-aporte-${semilla.slug}-${claveRecurso}-recibido`;
          await prisma.aporte.upsert({
            where: { id: aporteId },
            update: {
              actividadId,
              recursoId: recurso.id,
              colaboradorId: colaborador.id,
              cantidad: cantidadRecibida,
              moneda: recurso.semilla.categoria === "MONETARIO" ? "USD" : null,
              estado: "RECIBIDO",
              nota: `Aporte demo recibido para ${semilla.titulo}.`,
              recibidoEn: fechaRelativa(Math.min(diasActividad - 1, -1), 15),
            },
            create: {
              id: aporteId,
              actividadId,
              recursoId: recurso.id,
              colaboradorId: colaborador.id,
              cantidad: cantidadRecibida,
              moneda: recurso.semilla.categoria === "MONETARIO" ? "USD" : null,
              estado: "RECIBIDO",
              nota: `Aporte demo recibido para ${semilla.titulo}.`,
              recibidoEn: fechaRelativa(Math.min(diasActividad - 1, -1), 15),
            },
          });
          aportesCreados += 1;
        }

        if (semilla.pendientes) {
          const cantidadComprometida = redondear(
            objetivo * (0.1 + (indiceRecurso % 3) * 0.05),
          );
          const aporteId = `seed-dev-aporte-${semilla.slug}-${claveRecurso}-comprometido`;
          await prisma.aporte.upsert({
            where: { id: aporteId },
            update: {
              actividadId,
              recursoId: recurso.id,
              colaboradorId: colaborador.id,
              cantidad: cantidadComprometida,
              moneda: recurso.semilla.categoria === "MONETARIO" ? "USD" : null,
              estado: "COMPROMETIDO",
              nota: `Aporte demo pendiente de confirmación para ${semilla.titulo}.`,
              recibidoEn: null,
            },
            create: {
              id: aporteId,
              actividadId,
              recursoId: recurso.id,
              colaboradorId: colaborador.id,
              cantidad: cantidadComprometida,
              moneda: recurso.semilla.categoria === "MONETARIO" ? "USD" : null,
              estado: "COMPROMETIDO",
              nota: `Aporte demo pendiente de confirmación para ${semilla.titulo}.`,
            },
          });
          aportesCreados += 1;
        }
      }
    }

    console.log(
      `✔ ${ACTIVIDADES.length} actividades, ${metasCreadas} metas y ${aportesCreados} aportes de ${COLABORADOR.email}.`,
    );

    for (const semilla of SOLICITUDES) {
      const solicitudId = `seed-dev-solicitud-${semilla.slug}`;
      await prisma.solicitud.upsert({
        where: { id: solicitudId },
        update: {
          sector: semilla.sector,
          urgencia: semilla.urgencia,
          descripcion: semilla.descripcion,
          estado: semilla.estado,
          cerradaPor: semilla.estado === "CERRADA" ? "SOLICITANTE" : null,
          solicitanteId: solicitante.id,
        },
        create: {
          id: solicitudId,
          sector: semilla.sector,
          urgencia: semilla.urgencia,
          descripcion: semilla.descripcion,
          estado: semilla.estado,
          cerradaPor: semilla.estado === "CERRADA" ? "SOLICITANTE" : null,
          solicitanteId: solicitante.id,
        },
      });

      for (const [indiceRecurso, claveRecurso] of semilla.recursos.entries()) {
        const recurso = recursosPorClave.get(claveRecurso);
        if (!recurso) throw new Error(`Recurso demo desconocido: ${claveRecurso}.`);
        await prisma.recursoSolicitud.upsert({
          where: {
            solicitudId_recursoId: {
              solicitudId,
              recursoId: recurso.id,
            },
          },
          update: {
            cantidadEstimada: redondear(
              recurso.semilla.objetivoBase * (0.25 + indiceRecurso * 0.1),
            ),
          },
          create: {
            id: `seed-dev-recurso-solicitud-${semilla.slug}-${claveRecurso}`,
            solicitudId,
            recursoId: recurso.id,
            cantidadEstimada: redondear(
              recurso.semilla.objetivoBase * (0.25 + indiceRecurso * 0.1),
            ),
          },
        });
      }
    }
    console.log(`✔ ${SOLICITUDES.length} solicitudes con urgencias y estados variados.`);

    const moderadorId = adminsPorNumero.get(1);
    if (!moderadorId) throw new Error("No se encontró admin1 para moderar testimonios.");

    for (const semilla of TESTIMONIOS) {
      const pendiente = semilla.estado === "PENDIENTE";
      const datos = {
        autorId:
          semilla.autor === "SOLICITANTE" ? solicitante.id : colaborador.id,
        solicitudId: semilla.solicitudSlug
          ? `seed-dev-solicitud-${semilla.solicitudSlug}`
          : null,
        titulo: semilla.titulo,
        contenido: semilla.contenido,
        estado: semilla.estado,
        motivoRechazo:
          "motivoRechazo" in semilla ? semilla.motivoRechazo : null,
        destacado: semilla.destacado,
        moderadoPorId: pendiente ? null : moderadorId,
        moderadoEn: pendiente ? null : fechaRelativa(semilla.dias + 1, 14),
        createdAt: fechaRelativa(semilla.dias, 11),
      };

      await prisma.testimonio.upsert({
        where: { id: `seed-dev-testimonio-${semilla.slug}` },
        update: datos,
        create: {
          id: `seed-dev-testimonio-${semilla.slug}`,
          ...datos,
        },
      });
    }
    console.log(
      `✔ ${TESTIMONIOS.length} testimonios con moderación, destacados y vínculos variados.`,
    );

    console.log(`\nContraseña de todas las cuentas: ${PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
