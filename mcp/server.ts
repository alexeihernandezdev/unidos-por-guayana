// Servidor MCP (stdio) de Unidos por Guayana — solo lectura.
//
// Expone la data operativa de la plataforma (solicitudes y actividades) como
// herramientas MCP para consultarla desde Claude. Reutiliza los repositorios
// Prisma y los casos de uso puros del proyecto: nada de SQL ni mapeos nuevos.
//
// Se arranca vía `mcp/bootstrap.mjs`, que carga `.env` (DATABASE_URL) y monta
// jiti con el alias `@/*` -> `src/*` antes de importar este módulo.
//
// IMPORTANTE: en el transporte stdio, stdout es el canal JSON-RPC. Cualquier
// traza va a stderr (`console.error`); nunca a stdout.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { listarActividades } from "@/modules/actividades/application/listarActividades";
import { obtenerActividad } from "@/modules/actividades/application/obtenerActividad";
import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { contarSolicitudesPorUrgencia } from "@/modules/solicitudes/application/contarSolicitudesPorUrgencia";
import { listarSolicitudes } from "@/modules/solicitudes/application/listarSolicitudes";
import { obtenerSolicitud } from "@/modules/solicitudes/application/obtenerSolicitud";
import { sectoresTop } from "@/modules/solicitudes/application/sectoresTop";
import { PrismaSolicitudRepository } from "@/modules/solicitudes/infrastructure/PrismaSolicitudRepository";
import type { FiltroActividades } from "@/modules/actividades/domain/ActividadRepository";
import type { FiltroSolicitudes } from "@/modules/solicitudes/domain/SolicitudRepository";

// ── Composition root (solo lectura) ─────────────────────────────────────────
// Cableamos únicamente los repositorios que necesitan las lecturas. A diferencia
// de `src/lib/solicitudes.ts`, aquí NO instanciamos el `SupabaseStorageAdapter`:
// los detalles de solicitud incluyen metadatos de archivos, pero no generamos
// URLs firmadas, así que no hace falta configurar Storage para correr el server.
const solicitudesRepo = new PrismaSolicitudRepository();
const actividadesRepo = new PrismaActividadRepository();
const depsSolicitudes = { solicitudes: solicitudesRepo };
const depsActividades = { actividades: actividadesRepo };

// Valores de los enums de dominio, para validar los filtros de entrada. Coinciden
// con los del schema Prisma (ver `prisma/schema.prisma`).
const URGENCIAS = ["BAJA", "MEDIA", "ALTA"] as const;
const ESTADOS_SOLICITUD = ["ABIERTA", "ATENDIDA", "CERRADA"] as const;
const ESTADOS_ACTIVIDAD = [
  "RECOLECTANDO",
  "LISTO",
  "EN_TRANSITO",
  "ENTREGADO",
  "LISTA",
  "EN_CURSO",
  "REALIZADA",
] as const;
const TIPOS_ACTIVIDAD = ["ENVIO", "JORNADA", "EVENTO_SOCIAL"] as const;

// Serializa cualquier resultado como texto JSON legible. Las `Date` del dominio
// se convierten solas a ISO 8601; los `Decimal` de Prisma ya vienen como `number`
// desde los repositorios.
function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function fail(mensaje: string) {
  return {
    content: [{ type: "text" as const, text: mensaje }],
    isError: true,
  };
}

const server = new McpServer({
  name: "unidos-por-guayana",
  version: "0.1.0",
});

// ── Solicitudes ──────────────────────────────────────────────────────────────

server.registerTool(
  "listar-solicitudes",
  {
    title: "Listar solicitudes",
    description:
      "Lista solicitudes de ayuda, opcionalmente filtradas por sector, urgencia y/o estado. Ordenadas de la más reciente a la más antigua. Devuelve cada solicitud con sus recursos necesarios.",
    inputSchema: {
      sector: z.string().optional().describe("Sector exacto (coincidencia literal)."),
      urgencia: z.enum(URGENCIAS).optional().describe("Nivel de urgencia."),
      estado: z
        .enum(ESTADOS_SOLICITUD)
        .optional()
        .describe("Etapa del ciclo de vida."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ sector, urgencia, estado }) => {
    const filtro: FiltroSolicitudes = {};
    if (sector) filtro.sector = sector;
    if (urgencia) filtro.urgencia = urgencia;
    if (estado) filtro.estado = estado;
    const solicitudes = await listarSolicitudes(depsSolicitudes, filtro);
    return ok({ total: solicitudes.length, solicitudes });
  },
);

server.registerTool(
  "obtener-solicitud",
  {
    title: "Obtener solicitud",
    description:
      "Devuelve el detalle completo de una solicitud por su id: cabecera, recursos necesarios (con la actividad que los atiende, si la hay) y metadatos de archivos.",
    inputSchema: {
      id: z.string().min(1).describe("Id (cuid) de la solicitud."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ id }) => {
    try {
      return ok(await obtenerSolicitud(depsSolicitudes, id));
    } catch (error) {
      return fail(error instanceof Error ? error.message : String(error));
    }
  },
);

server.registerTool(
  "contar-solicitudes-por-urgencia",
  {
    title: "Contar solicitudes por urgencia",
    description:
      "Cuenta cuántas solicitudes hay en cada nivel de urgencia (ALTA/MEDIA/BAJA). Por defecto solo cuenta las ABIERTAS; pasa `estado` para contar otra etapa.",
    inputSchema: {
      estado: z
        .enum(ESTADOS_SOLICITUD)
        .optional()
        .describe("Etapa a contar. Omítelo para contar solo las ABIERTAS."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ estado }) => {
    const filtro: Omit<FiltroSolicitudes, "urgencia"> = {
      estado: estado ?? "ABIERTA",
    };
    return ok(await contarSolicitudesPorUrgencia(depsSolicitudes, filtro));
  },
);

server.registerTool(
  "sectores-con-mas-solicitudes",
  {
    title: "Sectores con más solicitudes",
    description:
      "Top-N sectores con más solicitudes abiertas (agrupados sin distinguir mayúsculas ni espacios). Útil para ver dónde se concentra la necesidad.",
    inputSchema: {
      limite: z
        .number()
        .int()
        .positive()
        .max(50)
        .optional()
        .describe("Cuántos sectores devolver (por defecto 5)."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ limite }) => {
    return ok(await sectoresTop(depsSolicitudes, { estado: "ABIERTA" }, limite ?? 5));
  },
);

// ── Actividades ────────────────────────────────────────────────────────────

server.registerTool(
  "listar-actividades",
  {
    title: "Listar actividades",
    description:
      "Lista actividades (envíos, jornadas o eventos sociales), opcionalmente filtradas por texto libre, estado y/o tipo. `texto` busca sin distinguir mayúsculas en título, descripción y sector destino.",
    inputSchema: {
      texto: z
        .string()
        .optional()
        .describe("Búsqueda parcial en título, descripción o sector destino."),
      estado: z
        .enum(ESTADOS_ACTIVIDAD)
        .optional()
        .describe("Etapa del ciclo de vida de la actividad."),
      tipo: z.enum(TIPOS_ACTIVIDAD).optional().describe("Tipo de actividad."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ texto, estado, tipo }) => {
    const filtro: FiltroActividades = {};
    if (texto) filtro.texto = texto;
    if (estado) filtro.estado = estado;
    if (tipo) filtro.tipo = tipo;
    const actividades = await listarActividades(depsActividades, filtro);
    return ok({ total: actividades.length, actividades });
  },
);

server.registerTool(
  "obtener-actividad",
  {
    title: "Obtener actividad",
    description:
      "Devuelve el detalle completo de una actividad por su id: cabecera, metas de recurso (con nombre y unidad) y puntos de acopio asignados.",
    inputSchema: {
      id: z.string().min(1).describe("Id (cuid) de la actividad."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ id }) => {
    try {
      return ok(await obtenerActividad(depsActividades, id));
    } catch (error) {
      return fail(error instanceof Error ? error.message : String(error));
    }
  },
);

// ── Arranque ─────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mcp] unidos-por-guayana listo (stdio).");
}

main().catch((error) => {
  console.error("[mcp] fallo al arrancar:", error);
  process.exit(1);
});
