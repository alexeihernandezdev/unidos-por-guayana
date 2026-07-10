/**
 * Catálogo de estados y municipios de Venezuela (feature 020).
 * Fuente: spec/.../catalogo-venezuela.md — 24 entidades, 335 municipios.
 * Generado con scripts/generate-catalogo-ve.mjs; no editar a mano.
 */

export type MunicipioSeed = { nombre: string };

export type EstadoSeed = {
  codigo: string;
  nombre: string;
  municipios: MunicipioSeed[];
};

/** Alias de backfill: nombre histórico → nombre oficial del estado. */
export const ALIAS_ESTADO_BACKFILL: Record<string, string> = {
  Vargas: "La Guaira",
};

export const VENEZUELA_ESTADOS_MUNICIPIOS: EstadoSeed[] = [
  {
    "codigo": "AM",
    "nombre": "Amazonas",
    "municipios": [
      {
        "nombre": "Alto Orinoco"
      },
      {
        "nombre": "Atabapo"
      },
      {
        "nombre": "Atures"
      },
      {
        "nombre": "Autana"
      },
      {
        "nombre": "Manapiare"
      },
      {
        "nombre": "Maroa"
      },
      {
        "nombre": "Río Negro"
      }
    ]
  },
  {
    "codigo": "AN",
    "nombre": "Anzoátegui",
    "municipios": [
      {
        "nombre": "Anaco"
      },
      {
        "nombre": "Aragua"
      },
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Bruzual"
      },
      {
        "nombre": "Cajigal"
      },
      {
        "nombre": "Carvajal"
      },
      {
        "nombre": "Diego Bautista Urbaneja"
      },
      {
        "nombre": "Freites"
      },
      {
        "nombre": "Guanta"
      },
      {
        "nombre": "Guanipa"
      },
      {
        "nombre": "Independencia"
      },
      {
        "nombre": "Libertad"
      },
      {
        "nombre": "McGregor"
      },
      {
        "nombre": "Miranda"
      },
      {
        "nombre": "Monagas"
      },
      {
        "nombre": "Peñalver"
      },
      {
        "nombre": "Píritu"
      },
      {
        "nombre": "San Juan de Capistrano"
      },
      {
        "nombre": "Santa Ana"
      },
      {
        "nombre": "Simón Rodríguez"
      },
      {
        "nombre": "Sotillo"
      }
    ]
  },
  {
    "codigo": "AP",
    "nombre": "Apure",
    "municipios": [
      {
        "nombre": "Achaguas"
      },
      {
        "nombre": "Biruaca"
      },
      {
        "nombre": "Muñoz"
      },
      {
        "nombre": "Páez"
      },
      {
        "nombre": "Pedro Camejo"
      },
      {
        "nombre": "Rómulo Gallegos"
      },
      {
        "nombre": "San Fernando"
      }
    ]
  },
  {
    "codigo": "AR",
    "nombre": "Aragua",
    "municipios": [
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Camatagua"
      },
      {
        "nombre": "Francisco Linares Alcántara"
      },
      {
        "nombre": "Girardot"
      },
      {
        "nombre": "José Ángel Lamas"
      },
      {
        "nombre": "José Félix Ribas"
      },
      {
        "nombre": "José Rafael Revenga"
      },
      {
        "nombre": "Libertador"
      },
      {
        "nombre": "Mario Briceño Iragorry"
      },
      {
        "nombre": "Ocumare de la Costa de Oro"
      },
      {
        "nombre": "San Casimiro"
      },
      {
        "nombre": "San Sebastián"
      },
      {
        "nombre": "Santiago Mariño"
      },
      {
        "nombre": "Santos Michelena"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Tovar"
      },
      {
        "nombre": "Urdaneta"
      },
      {
        "nombre": "Zamora"
      }
    ]
  },
  {
    "codigo": "BA",
    "nombre": "Barinas",
    "municipios": [
      {
        "nombre": "Alberto Arvelo Torrealba"
      },
      {
        "nombre": "Andrés Eloy Blanco"
      },
      {
        "nombre": "Antonio José de Sucre"
      },
      {
        "nombre": "Arismendi"
      },
      {
        "nombre": "Barinas"
      },
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Cruz Paredes"
      },
      {
        "nombre": "Ezequiel Zamora"
      },
      {
        "nombre": "Obispos"
      },
      {
        "nombre": "Pedraza"
      },
      {
        "nombre": "Rojas"
      },
      {
        "nombre": "Sosa"
      }
    ]
  },
  {
    "codigo": "BO",
    "nombre": "Bolívar",
    "municipios": [
      {
        "nombre": "Angostura"
      },
      {
        "nombre": "Angostura del Orinoco"
      },
      {
        "nombre": "Caroní"
      },
      {
        "nombre": "Cedeño"
      },
      {
        "nombre": "El Callao"
      },
      {
        "nombre": "Gran Sabana"
      },
      {
        "nombre": "Padre Pedro Chien"
      },
      {
        "nombre": "Piar"
      },
      {
        "nombre": "Roscio"
      },
      {
        "nombre": "Sifontes"
      },
      {
        "nombre": "Sucre"
      }
    ]
  },
  {
    "codigo": "CA",
    "nombre": "Carabobo",
    "municipios": [
      {
        "nombre": "Bejuma"
      },
      {
        "nombre": "Carlos Arvelo"
      },
      {
        "nombre": "Diego Ibarra"
      },
      {
        "nombre": "Guacara"
      },
      {
        "nombre": "Juan José Mora"
      },
      {
        "nombre": "Libertador"
      },
      {
        "nombre": "Los Guayos"
      },
      {
        "nombre": "Miranda"
      },
      {
        "nombre": "Montalbán"
      },
      {
        "nombre": "Naguanagua"
      },
      {
        "nombre": "Puerto Cabello"
      },
      {
        "nombre": "San Diego"
      },
      {
        "nombre": "San Joaquín"
      },
      {
        "nombre": "Valencia"
      }
    ]
  },
  {
    "codigo": "CO",
    "nombre": "Cojedes",
    "municipios": [
      {
        "nombre": "Anzoátegui"
      },
      {
        "nombre": "Girardot"
      },
      {
        "nombre": "Lima Blanco"
      },
      {
        "nombre": "Pao de San Juan Bautista"
      },
      {
        "nombre": "Ricaurte"
      },
      {
        "nombre": "Rómulo Gallegos"
      },
      {
        "nombre": "San Carlos"
      },
      {
        "nombre": "Tinaco"
      },
      {
        "nombre": "Tinaquillo"
      }
    ]
  },
  {
    "codigo": "DA",
    "nombre": "Delta Amacuro",
    "municipios": [
      {
        "nombre": "Antonio Díaz"
      },
      {
        "nombre": "Casacoima"
      },
      {
        "nombre": "Pedernales"
      },
      {
        "nombre": "Tucupita"
      }
    ]
  },
  {
    "codigo": "DC",
    "nombre": "Distrito Capital",
    "municipios": [
      {
        "nombre": "Libertador"
      }
    ]
  },
  {
    "codigo": "FA",
    "nombre": "Falcón",
    "municipios": [
      {
        "nombre": "Acosta"
      },
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Buchivacoa"
      },
      {
        "nombre": "Cacique Manaure"
      },
      {
        "nombre": "Carirubana"
      },
      {
        "nombre": "Colina"
      },
      {
        "nombre": "Dabajuro"
      },
      {
        "nombre": "Democracia"
      },
      {
        "nombre": "Falcón"
      },
      {
        "nombre": "Federación"
      },
      {
        "nombre": "Jacura"
      },
      {
        "nombre": "Los Taques"
      },
      {
        "nombre": "Mauroa"
      },
      {
        "nombre": "Miranda"
      },
      {
        "nombre": "Monseñor Iturriza"
      },
      {
        "nombre": "Palmasola"
      },
      {
        "nombre": "Petit"
      },
      {
        "nombre": "Píritu"
      },
      {
        "nombre": "San Francisco"
      },
      {
        "nombre": "Silva"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Tocópero"
      },
      {
        "nombre": "Unión"
      },
      {
        "nombre": "Urumaco"
      },
      {
        "nombre": "Zamora"
      }
    ]
  },
  {
    "codigo": "GU",
    "nombre": "Guárico",
    "municipios": [
      {
        "nombre": "Camaguán"
      },
      {
        "nombre": "Chaguaramas"
      },
      {
        "nombre": "El Socorro"
      },
      {
        "nombre": "Francisco de Miranda"
      },
      {
        "nombre": "José Félix Ribas"
      },
      {
        "nombre": "José Tadeo Monagas"
      },
      {
        "nombre": "Juan Germán Roscio"
      },
      {
        "nombre": "Juan José Rondón"
      },
      {
        "nombre": "Julián Mellado"
      },
      {
        "nombre": "Leonardo Infante"
      },
      {
        "nombre": "Ortiz"
      },
      {
        "nombre": "Pedro Zaraza"
      },
      {
        "nombre": "San Gerónimo de Guayabal"
      },
      {
        "nombre": "San José de Guaribe"
      },
      {
        "nombre": "Santa María de Ipire"
      }
    ]
  },
  {
    "codigo": "LG",
    "nombre": "La Guaira",
    "municipios": [
      {
        "nombre": "Vargas"
      }
    ]
  },
  {
    "codigo": "LA",
    "nombre": "Lara",
    "municipios": [
      {
        "nombre": "Andrés Eloy Blanco"
      },
      {
        "nombre": "Crespo"
      },
      {
        "nombre": "Iribarren"
      },
      {
        "nombre": "Jiménez"
      },
      {
        "nombre": "Morán"
      },
      {
        "nombre": "Palavecino"
      },
      {
        "nombre": "Simón Planas"
      },
      {
        "nombre": "Torres"
      },
      {
        "nombre": "Urdaneta"
      }
    ]
  },
  {
    "codigo": "ME",
    "nombre": "Mérida",
    "municipios": [
      {
        "nombre": "Alberto Adriani"
      },
      {
        "nombre": "Andrés Bello"
      },
      {
        "nombre": "Antonio Pinto Salinas"
      },
      {
        "nombre": "Aricagua"
      },
      {
        "nombre": "Arzobispo Chacón"
      },
      {
        "nombre": "Campo Elías"
      },
      {
        "nombre": "Caracciolo Parra Olmedo"
      },
      {
        "nombre": "Cardenal Quintero"
      },
      {
        "nombre": "Guaraque"
      },
      {
        "nombre": "Julio César Salas"
      },
      {
        "nombre": "Justo Briceño"
      },
      {
        "nombre": "Libertador"
      },
      {
        "nombre": "Miranda"
      },
      {
        "nombre": "Obispo Ramos de Lora"
      },
      {
        "nombre": "Padre Noguera"
      },
      {
        "nombre": "Pueblo Llano"
      },
      {
        "nombre": "Rangel"
      },
      {
        "nombre": "Rivas Dávila"
      },
      {
        "nombre": "Santos Marquina"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Tovar"
      },
      {
        "nombre": "Tulio Febres Cordero"
      },
      {
        "nombre": "Zea"
      }
    ]
  },
  {
    "codigo": "MI",
    "nombre": "Miranda",
    "municipios": [
      {
        "nombre": "Acevedo"
      },
      {
        "nombre": "Andrés Bello"
      },
      {
        "nombre": "Baruta"
      },
      {
        "nombre": "Brión"
      },
      {
        "nombre": "Buroz"
      },
      {
        "nombre": "Carrizal"
      },
      {
        "nombre": "Chacao"
      },
      {
        "nombre": "Cristóbal Rojas"
      },
      {
        "nombre": "El Hatillo"
      },
      {
        "nombre": "Guaicaipuro"
      },
      {
        "nombre": "Independencia"
      },
      {
        "nombre": "Lander"
      },
      {
        "nombre": "Los Salias"
      },
      {
        "nombre": "Páez"
      },
      {
        "nombre": "Paz Castillo"
      },
      {
        "nombre": "Pedro Gual"
      },
      {
        "nombre": "Plaza"
      },
      {
        "nombre": "Simón Bolívar"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Urdaneta"
      },
      {
        "nombre": "Zamora"
      }
    ]
  },
  {
    "codigo": "MO",
    "nombre": "Monagas",
    "municipios": [
      {
        "nombre": "Acosta"
      },
      {
        "nombre": "Aguasay"
      },
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Caripe"
      },
      {
        "nombre": "Cedeño"
      },
      {
        "nombre": "Libertador"
      },
      {
        "nombre": "Maturín"
      },
      {
        "nombre": "Piar"
      },
      {
        "nombre": "Punceres"
      },
      {
        "nombre": "Santa Bárbara"
      },
      {
        "nombre": "Sotillo"
      },
      {
        "nombre": "Uracoa"
      },
      {
        "nombre": "Zamora"
      }
    ]
  },
  {
    "codigo": "NE",
    "nombre": "Nueva Esparta",
    "municipios": [
      {
        "nombre": "Antolín del Campo"
      },
      {
        "nombre": "Arismendi"
      },
      {
        "nombre": "Díaz"
      },
      {
        "nombre": "García"
      },
      {
        "nombre": "Gómez"
      },
      {
        "nombre": "Maneiro"
      },
      {
        "nombre": "Marcano"
      },
      {
        "nombre": "Mariño"
      },
      {
        "nombre": "Península de Macanao"
      },
      {
        "nombre": "Tubores"
      },
      {
        "nombre": "Villalba"
      }
    ]
  },
  {
    "codigo": "PO",
    "nombre": "Portuguesa",
    "municipios": [
      {
        "nombre": "Agua Blanca"
      },
      {
        "nombre": "Araure"
      },
      {
        "nombre": "Esteller"
      },
      {
        "nombre": "Guanare"
      },
      {
        "nombre": "Guanarito"
      },
      {
        "nombre": "José Vicente de Unda"
      },
      {
        "nombre": "Ospino"
      },
      {
        "nombre": "Páez"
      },
      {
        "nombre": "Papelón"
      },
      {
        "nombre": "San Genaro de Boconoíto"
      },
      {
        "nombre": "San Rafael de Onoto"
      },
      {
        "nombre": "Santa Rosalía"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Turén"
      }
    ]
  },
  {
    "codigo": "SU",
    "nombre": "Sucre",
    "municipios": [
      {
        "nombre": "Andrés Eloy Blanco"
      },
      {
        "nombre": "Andrés Mata"
      },
      {
        "nombre": "Arismendi"
      },
      {
        "nombre": "Benítez"
      },
      {
        "nombre": "Bermúdez"
      },
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Cajigal"
      },
      {
        "nombre": "Cruz Salmerón Acosta"
      },
      {
        "nombre": "Libertador"
      },
      {
        "nombre": "Mariño"
      },
      {
        "nombre": "Mejía"
      },
      {
        "nombre": "Montes"
      },
      {
        "nombre": "Ribero"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Valdez"
      }
    ]
  },
  {
    "codigo": "TA",
    "nombre": "Táchira",
    "municipios": [
      {
        "nombre": "Andrés Bello"
      },
      {
        "nombre": "Antonio Rómulo Costa"
      },
      {
        "nombre": "Ayacucho"
      },
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Cárdenas"
      },
      {
        "nombre": "Córdoba"
      },
      {
        "nombre": "Fernández Feo"
      },
      {
        "nombre": "Francisco de Miranda"
      },
      {
        "nombre": "García de Hevia"
      },
      {
        "nombre": "Guásimos"
      },
      {
        "nombre": "Independencia"
      },
      {
        "nombre": "Jáuregui"
      },
      {
        "nombre": "José María Vargas"
      },
      {
        "nombre": "Junín"
      },
      {
        "nombre": "Libertad"
      },
      {
        "nombre": "Libertador"
      },
      {
        "nombre": "Lobatera"
      },
      {
        "nombre": "Michelena"
      },
      {
        "nombre": "Panamericano"
      },
      {
        "nombre": "Pedro María Ureña"
      },
      {
        "nombre": "Rafael Urdaneta"
      },
      {
        "nombre": "Samuel Darío Maldonado"
      },
      {
        "nombre": "San Cristóbal"
      },
      {
        "nombre": "San Judas Tadeo"
      },
      {
        "nombre": "Seboruco"
      },
      {
        "nombre": "Simón Rodríguez"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Torbes"
      },
      {
        "nombre": "Uribante"
      }
    ]
  },
  {
    "codigo": "TR",
    "nombre": "Trujillo",
    "municipios": [
      {
        "nombre": "Andrés Bello"
      },
      {
        "nombre": "Boconó"
      },
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Candelaria"
      },
      {
        "nombre": "Carache"
      },
      {
        "nombre": "Escuque"
      },
      {
        "nombre": "José Felipe Márquez Cañizales"
      },
      {
        "nombre": "José Vicente Campo Elías"
      },
      {
        "nombre": "La Ceiba"
      },
      {
        "nombre": "Miranda"
      },
      {
        "nombre": "Monte Carmelo"
      },
      {
        "nombre": "Motatán"
      },
      {
        "nombre": "Pampán"
      },
      {
        "nombre": "Pampanito"
      },
      {
        "nombre": "Rafael Rangel"
      },
      {
        "nombre": "San Rafael de Carvajal"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Trujillo"
      },
      {
        "nombre": "Urdaneta"
      },
      {
        "nombre": "Valera"
      }
    ]
  },
  {
    "codigo": "YA",
    "nombre": "Yaracuy",
    "municipios": [
      {
        "nombre": "Arístides Bastidas"
      },
      {
        "nombre": "Bolívar"
      },
      {
        "nombre": "Bruzual"
      },
      {
        "nombre": "Cocorote"
      },
      {
        "nombre": "Independencia"
      },
      {
        "nombre": "José Antonio Páez"
      },
      {
        "nombre": "La Trinidad"
      },
      {
        "nombre": "Manuel Monge"
      },
      {
        "nombre": "Nirgua"
      },
      {
        "nombre": "Peña"
      },
      {
        "nombre": "San Felipe"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Urachiche"
      },
      {
        "nombre": "Veroes"
      }
    ]
  },
  {
    "codigo": "ZU",
    "nombre": "Zulia",
    "municipios": [
      {
        "nombre": "Almirante Padilla"
      },
      {
        "nombre": "Baralt"
      },
      {
        "nombre": "Cabimas"
      },
      {
        "nombre": "Catatumbo"
      },
      {
        "nombre": "Colón"
      },
      {
        "nombre": "Francisco Javier Pulgar"
      },
      {
        "nombre": "Guajira"
      },
      {
        "nombre": "Jesús Enrique Lossada"
      },
      {
        "nombre": "Jesús María Semprún"
      },
      {
        "nombre": "La Cañada de Urdaneta"
      },
      {
        "nombre": "Lagunillas"
      },
      {
        "nombre": "Machiques de Perijá"
      },
      {
        "nombre": "Mara"
      },
      {
        "nombre": "Maracaibo"
      },
      {
        "nombre": "Miranda"
      },
      {
        "nombre": "Rosario de Perijá"
      },
      {
        "nombre": "San Francisco"
      },
      {
        "nombre": "Santa Rita"
      },
      {
        "nombre": "Simón Bolívar"
      },
      {
        "nombre": "Sucre"
      },
      {
        "nombre": "Valmore Rodríguez"
      }
    ]
  }
];

export const TOTAL_ESTADOS = VENEZUELA_ESTADOS_MUNICIPIOS.length;
export const TOTAL_MUNICIPIOS = VENEZUELA_ESTADOS_MUNICIPIOS.reduce(
  (acc, e) => acc + e.municipios.length,
  0,
);
