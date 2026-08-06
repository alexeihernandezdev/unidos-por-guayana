import type { ComponentType } from "react";
import {
  ActividadesMock,
  AportarMock,
  ConfianzaMock,
  DashboardMock,
  MapaMock,
  RolesMock,
  SolicitudMock,
  TransparenciaMock,
} from "./DeckMockups";

export type SlideDef = {
  id: string;
  eyebrow: string;
  title: string;
  accent?: string;
  body: string;
  chips?: string[];
  Mock?: ComponentType;
  kind: "cover" | "statement" | "standard" | "closing";
};

/**
 * Guion de la presentación (feature 039). Arco corto (11 pasos) que recorre la
 * mayoría de módulos del sistema agrupados por narrativa: portada → problema →
 * actores → solicitar → coordinar → aportar → acopio → métricas →
 * transparencia → confianza → cierre.
 */
export const SLIDES: SlideDef[] = [
  {
    id: "portada",
    kind: "cover",
    eyebrow: "La Guaira · Venezuela",
    title: "Unidos por",
    accent: "La Guaira",
    body: "La plataforma que coordina y da transparencia a la ayuda humanitaria que sale desde la costa tras el terremoto del 24 de junio.",
  },
  {
    id: "problema",
    kind: "statement",
    eyebrow: "El problema",
    title: "La ayuda existe. Lo que falta es",
    accent: "coordinarla.",
    body: "Donaciones que se duplican, zonas que quedan sin cubrir y aportes que nadie puede rastrear. Unimos a quien da, quien pide y quien despacha en un mismo lugar, con todo registrado.",
    chips: ["Coordinación", "Trazabilidad", "Transparencia"],
  },
  {
    id: "roles",
    kind: "standard",
    eyebrow: "Los actores",
    title: "Cada quien tiene",
    accent: "su rol.",
    body: "Colaboradores que aportan, solicitantes que piden por zona, administradores que coordinan centros de acopio y auditores que verifican. Un superadmin aprueba cada organización antes de operar.",
    chips: ["Colaborador", "Solicitante", "Admin", "Auditor"],
    Mock: RolesMock,
  },
  {
    id: "solicitar",
    kind: "standard",
    eyebrow: "Solicitar ayuda",
    title: "La necesidad,",
    accent: "en el mapa.",
    body: "El solicitante abre una petición por sector y urgencia, detalla los recursos que hacen falta y adjunta fotos y documentos que dan contexto. Nada se pierde entre mensajes sueltos.",
    chips: ["Por sector", "Urgencia", "Adjuntos"],
    Mock: SolicitudMock,
  },
  {
    id: "coordinar",
    kind: "standard",
    eyebrow: "Coordinar actividades",
    title: "Envíos, jornadas",
    accent: "y eventos.",
    body: "El administrador crea actividades con metas por recurso y las lleva por su ciclo de vida: de recolectando a entregado. El progreso se ve en tiempo real, meta a meta.",
    chips: ["Metas por recurso", "Ciclo de vida", "Progreso"],
    Mock: ActividadesMock,
  },
  {
    id: "aportar",
    kind: "standard",
    eyebrow: "Aportar",
    title: "Del que quiere ayudar,",
    accent: "a la meta.",
    body: "El colaborador aporta contra una meta concreta según sus categorías, afiliado a los centros que elija. Puede hacerlo de forma anónima, y cada aporte suma al progreso público.",
    chips: ["Categorías", "Afiliación", "Anónimo"],
    Mock: AportarMock,
  },
  {
    id: "acopio",
    kind: "standard",
    eyebrow: "Puntos de acopio",
    title: "Dónde llevar",
    accent: "lo recogido.",
    body: "Un directorio con mapa reúne los centros de acopio verificados, con horarios y ubicación. Solo las organizaciones aprobadas aparecen; la gente sabe exactamente adónde ir.",
    chips: ["Mapa", "Verificados", "Horarios"],
    Mock: MapaMock,
  },
  {
    id: "panel",
    kind: "standard",
    eyebrow: "Panel y métricas",
    title: "Decidir con",
    accent: "datos.",
    body: "Un tablero le muestra al administrador qué envío sale primero, los sectores con más demanda y los aportes pendientes. La operación deja de ir a ciegas.",
    chips: ["Tablero", "Sectores top", "Prioridad"],
    Mock: DashboardMock,
  },
  {
    id: "transparencia",
    kind: "standard",
    eyebrow: "Transparencia pública",
    title: "Todo a la vista,",
    accent: "sin login.",
    body: "Una galería abierta muestra lo recolectado, las personas alcanzadas y cada actividad con su evidencia. Cualquiera —incluida la prensa— puede auditar el impacto en segundos.",
    chips: ["Abierto", "Impacto", "Evidencia"],
    Mock: TransparenciaMock,
  },
  {
    id: "confianza",
    kind: "standard",
    eyebrow: "Confianza",
    title: "Verificado",
    accent: "de punta a punta.",
    body: "Las organizaciones se aprueban antes de operar, los auditores validan con evidencia y el teléfono se confirma por WhatsApp. Cada evento avisa por app, WhatsApp o correo.",
    chips: ["Aprobación", "Auditoría", "OTP", "Notificaciones"],
    Mock: ConfianzaMock,
  },
  {
    id: "cierre",
    kind: "closing",
    eyebrow: "En una frase",
    title: "Cada aporte queda registrado.",
    accent: "Cada envío se rastrea.",
    body: "Unidos por La Guaira convierte la solidaridad en una operación coordinada y verificable, de la costa a quien la necesita.",
  },
];
