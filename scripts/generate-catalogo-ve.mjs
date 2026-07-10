import fs from "node:fs";
import path from "node:path";

const mdPath = path.join(
  "spec/spec_template/features/020-catalogo-estados-municipios/catalogo-venezuela.md",
);
const md = fs.readFileSync(mdPath, "utf8");

const CODIGOS = {
  Amazonas: "AM",
  Anzoátegui: "AN",
  Apure: "AP",
  Aragua: "AR",
  Barinas: "BA",
  Bolívar: "BO",
  Carabobo: "CA",
  Cojedes: "CO",
  "Delta Amacuro": "DA",
  "Distrito Capital": "DC",
  Falcón: "FA",
  Guárico: "GU",
  "La Guaira": "LG",
  Lara: "LA",
  Mérida: "ME",
  Miranda: "MI",
  Monagas: "MO",
  "Nueva Esparta": "NE",
  Portuguesa: "PO",
  Sucre: "SU",
  Táchira: "TA",
  Trujillo: "TR",
  Yaracuy: "YA",
  Zulia: "ZU",
};

const sectionRe = /^## \d+\. (.+?) \(\d+\)\s*$/gm;
const sections = [...md.matchAll(sectionRe)];
const estados = [];

for (let i = 0; i < sections.length; i++) {
  const nombre = sections[i][1].trim();
  const start = sections[i].index + sections[i][0].length;
  const end = i + 1 < sections.length ? sections[i + 1].index : md.length;
  const body = md.slice(start, end);
  const municipios = [];

  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^\d+\.\s+(.+)$/);
    if (!m) continue;
    let raw = m[1].trim();
    const bold = raw.match(/\*\*(.+?)\*\*/);
    if (bold) {
      municipios.push(bold[1].trim());
      continue;
    }
    raw = raw.replace(/\s+[—–-]\s+.*$/, "").trim();
    raw = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
    municipios.push(raw);
  }

  const codigo = CODIGOS[nombre];
  if (!codigo) throw new Error(`Sin codigo: ${nombre}`);
  estados.push({ codigo, nombre, municipios });
}

const total = estados.reduce((a, e) => a + e.municipios.length, 0);
if (estados.length !== 24 || total !== 335) {
  console.error("Conteos:", estados.length, total);
  for (const e of estados) console.error(e.codigo, e.nombre, e.municipios.length);
  process.exit(1);
}

const data = estados.map((e) => ({
  codigo: e.codigo,
  nombre: e.nombre,
  municipios: e.municipios.map((nombre) => ({ nombre })),
}));

const out = `/**
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

export const VENEZUELA_ESTADOS_MUNICIPIOS: EstadoSeed[] = ${JSON.stringify(data, null, 2)};

export const TOTAL_ESTADOS = VENEZUELA_ESTADOS_MUNICIPIOS.length;
export const TOTAL_MUNICIPIOS = VENEZUELA_ESTADOS_MUNICIPIOS.reduce(
  (acc, e) => acc + e.municipios.length,
  0,
);
`;

fs.mkdirSync("prisma/data", { recursive: true });
fs.writeFileSync("prisma/data/venezuela-estados-municipios.ts", out);
console.log(`OK: ${estados.length} estados, ${total} municipios`);
