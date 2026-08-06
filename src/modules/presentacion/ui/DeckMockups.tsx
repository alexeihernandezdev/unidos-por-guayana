"use client";

import {
  Bell,
  Boxes,
  CheckCircle2,
  FileText,
  HandHeart,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Package,
  ShieldCheck,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { CountUp, EASE, EASE_EXPO } from "./DeckPrimitives";

/* ══════════════════════════════════════════════════════════════════════════
   Mockups del sistema. Mini-UIs construidas con los MISMOS tokens del tema
   petróleo (panel): bg-card, border-border, text-primary-ink, --success…, de
   modo que se lean idénticas a las pantallas reales. Cada mockup "se construye"
   al montar (los slides montan/desmontan con AnimatePresence), y todo respeta
   prefers-reduced-motion.
   ══════════════════════════════════════════════════════════════════════════ */

function useQuieto() {
  return useReducedMotion() === true;
}

/** Marco tipo navegador con pill de URL: ancla el mockup a una ruta real. */
function Frame({
  url,
  children,
  className = "",
  float = true,
}: {
  url: string;
  children: ReactNode;
  className?: string;
  float?: boolean;
}) {
  const quieto = useQuieto();
  return (
    <motion.div
      initial={quieto ? false : { opacity: 0, y: 40, scale: 0.96, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.9, ease: EASE_EXPO }}
      style={{ transformPerspective: 1200 }}
      className="w-full will-change-transform"
    >
      <motion.div
        animate={quieto || !float ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        className={`panel-surface overflow-hidden rounded-2xl border border-border bg-card ${className}`}
        style={{ boxShadow: "var(--shadow-card-lift)" }}
      >
        <div className="flex items-center gap-2 border-b border-border/70 bg-elevated/60 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          <span className="ml-2 truncate rounded-md bg-background/60 px-2.5 py-1 font-mono text-[10px] tracking-tight text-muted-foreground">
            {url}
          </span>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Barra de meta que se llena (scaleX GPU). */
function Meta({
  label,
  pct,
  tone = "primary",
  delay = 0,
}: {
  label: string;
  pct: number;
  tone?: "primary" | "success" | "warning";
  delay?: number;
}) {
  const quieto = useQuieto();
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : "var(--primary)";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-foreground">
          {pct}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          initial={quieto ? false : { scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ delay, duration: 0.95, ease: EASE }}
          className="h-full origin-left rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

/** Cascada genérica para hijos que entran escalonados. */
function Stagger({
  children,
  base = 0.35,
  step = 0.09,
  x = 0,
  y = 12,
}: {
  children: ReactNode[];
  base?: number;
  step?: number;
  x?: number;
  y?: number;
}) {
  const quieto = useQuieto();
  return (
    <>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={quieto ? false : { opacity: 0, x, y }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: base + i * step, duration: 0.5, ease: EASE }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}

const NAV = [
  { icon: LayoutDashboard, label: "Panel" },
  { icon: Package, label: "Actividades" },
  { icon: HandHeart, label: "Aportes" },
  { icon: Users, label: "Red" },
  { icon: Store, label: "Acopio" },
];

/** Shell con sidebar (reutilizado). `activo` = índice del NAV resaltado. */
function Shell({ activo, children }: { activo: number; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[132px_1fr]">
      <div className="border-r border-border/70 bg-background/40 p-2.5">
        <div className="mb-3 flex items-center gap-2 px-1.5">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/20 text-primary-ink">
            <Boxes className="size-3.5" strokeWidth={1.8} />
          </span>
          <span className="font-serif text-[13px] text-foreground">
            La Guaira
          </span>
        </div>
        <Stagger base={0.3} step={0.06} x={-10} y={0}>
          {NAV.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className={`mb-0.5 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] ${
                i === activo
                  ? "bg-primary/15 font-medium text-primary-ink"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="size-3.5" strokeWidth={1.8} />
              {label}
            </div>
          ))}
        </Stagger>
      </div>
      <div className="min-w-0 p-3.5">{children}</div>
    </div>
  );
}

function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const map = {
    primary: "text-primary-ink border-primary/40 bg-primary/10",
    success: "text-success-ink border-success/40 bg-success/10",
    warning: "text-warning-ink border-warning/40 bg-warning/10",
    danger: "text-destructive border-destructive/40 bg-destructive/10",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${map[tone]}`}
    >
      {children}
    </span>
  );
}

/* ── Slide 3 · Roles ──────────────────────────────────────────────────── */
export function RolesMock() {
  const quieto = useQuieto();
  const roles = [
    { icon: HandHeart, n: "Colaborador", d: "Aporta recursos", tone: "primary" },
    { icon: FileText, n: "Solicitante", d: "Pide ayuda por zona", tone: "warning" },
    { icon: Store, n: "Administrador", d: "Coordina y despacha", tone: "success" },
    { icon: ShieldCheck, n: "Auditor", d: "Verifica evidencia", tone: "primary" },
  ] as const;
  return (
    <Frame url="unidosporlaguaira.org/registro">
      <div className="grid grid-cols-2 gap-2.5 p-3.5">
        {roles.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.n}
              initial={quieto ? false : { opacity: 0, y: 24, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.35 + i * 0.11, duration: 0.6, ease: EASE_EXPO }}
              className="rounded-xl border border-border bg-elevated/70 p-3"
            >
              <span className={`profile-icon size-10 tone-${r.tone}`}>
                <Icon aria-hidden />
              </span>
              <p className="mt-2.5 text-[13px] font-medium text-foreground">
                {r.n}
              </p>
              <p className="text-[11px] text-muted-foreground">{r.d}</p>
            </motion.div>
          );
        })}
      </div>
    </Frame>
  );
}

/* ── Slide 4 · Solicitud ──────────────────────────────────────────────── */
export function SolicitudMock() {
  return (
    <Frame url="unidosporlaguaira.org/solicitudes">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Badge tone="danger">Urgencia alta</Badge>
          <span className="font-mono text-[10px] text-muted-foreground">
            Sector Maiquetía
          </span>
        </div>
        <p className="mt-3 font-serif text-lg leading-tight text-foreground">
          Familias sin agua tras el deslave
        </p>
        <Stagger base={0.45} step={0.09}>
          {[
            { n: "Agua potable 5 L", q: "× 40" },
            { n: "Kits de higiene", q: "× 25" },
            { n: "Colchonetas", q: "× 15" },
          ].map((r) => (
            <div
              key={r.n}
              className="mt-2 flex items-center justify-between rounded-lg border border-border/70 bg-elevated/50 px-3 py-2 text-[12px]"
            >
              <span className="text-foreground">{r.n}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {r.q}
              </span>
            </div>
          ))}
        </Stagger>
        <div className="mt-3 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85 + i * 0.08, duration: 0.4, ease: EASE }}
              className="grid h-11 flex-1 place-items-center rounded-lg border border-dashed border-border bg-background/40 text-muted-foreground"
            >
              {i === 0 ? (
                <ImageIcon className="size-4" strokeWidth={1.6} />
              ) : (
                <FileText className="size-4" strokeWidth={1.6} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── Slide 5 · Actividades (panel admin) ──────────────────────────────── */
export function ActividadesMock() {
  return (
    <Frame url="unidosporlaguaira.org/panel/actividades">
      <Shell activo={1}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-medium text-foreground">Actividades</p>
          <div className="flex gap-1.5">
            <Badge tone="primary">Envío</Badge>
            <Badge tone="success">Jornada</Badge>
          </div>
        </div>
        <Stagger base={0.4} step={0.12} y={16}>
          {[
            { t: "Envío · Maiquetía", e: "En tránsito", tone: "primary", pct: 72 },
            { t: "Jornada médica · Naiguatá", e: "Recolectando", tone: "warning", pct: 45 },
            { t: "Evento · Caraballeda", e: "Realizada", tone: "success", pct: 100 },
          ].map((a) => (
            <div
              key={a.t}
              className="mb-2 rounded-xl border border-border bg-elevated/60 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-foreground">{a.t}</span>
                <Badge tone={a.tone as "primary" | "success" | "warning"}>
                  {a.e}
                </Badge>
              </div>
              <div className="mt-2.5">
                <Meta
                  label="Meta de recursos"
                  pct={a.pct}
                  tone={a.tone as "primary" | "success" | "warning"}
                  delay={0.7}
                />
              </div>
            </div>
          ))}
        </Stagger>
      </Shell>
    </Frame>
  );
}

/* ── Slide 6 · Aportar (colaborador) ──────────────────────────────────── */
export function AportarMock() {
  const quieto = useQuieto();
  return (
    <Frame url="unidosporlaguaira.org/actividades/maiquetia/aportar">
      <div className="p-4">
        <p className="font-serif text-lg leading-tight text-foreground">
          Aportar al envío
        </p>
        <p className="text-[11px] text-muted-foreground">Sector Maiquetía</p>
        <Stagger base={0.4} step={0.1}>
          <div className="mt-3 rounded-lg border border-border bg-elevated/60 px-3 py-2.5 text-[12px] text-foreground">
            Recurso · <span className="text-primary-ink">Agua potable 5 L</span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-elevated/60 px-3 py-2.5 text-[12px]">
            <span className="text-muted-foreground">Cantidad</span>
            <span className="font-mono tabular-nums text-foreground">10</span>
          </div>
          <label className="mt-2 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-[12px] text-primary-ink">
            <CheckCircle2 className="size-4" strokeWidth={1.8} />
            Aportar de forma anónima
          </label>
        </Stagger>
        <div className="mt-3 rounded-xl border border-border bg-background/40 p-3">
          <Meta label="Progreso de la meta" pct={72} tone="primary" delay={0.9} />
          <motion.p
            initial={quieto ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="mt-2 font-mono text-[10px] text-muted-foreground"
          >
            recibido 288 · prometido 40 · meta 400
          </motion.p>
        </div>
      </div>
    </Frame>
  );
}

/* ── Slide 7 · Puntos de acopio (mapa) ────────────────────────────────── */
export function MapaMock() {
  const quieto = useQuieto();
  const pins = [
    { x: "26%", y: "42%" },
    { x: "58%", y: "30%" },
    { x: "72%", y: "62%" },
    { x: "40%", y: "70%" },
  ];
  return (
    <Frame url="unidosporlaguaira.org/puntos-acopio" float={false}>
      <div className="relative h-[280px] overflow-hidden bg-background/50">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(oklch(0.72 0.06 200 / 0.16) 1px, transparent 1.4px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Cluster */}
        <motion.div
          initial={quieto ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5, ease: EASE_EXPO }}
          className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/80 bg-primary font-mono text-[12px] font-semibold text-primary-foreground"
          style={{ left: "48%", top: "48%", boxShadow: "0 0 0 7px oklch(0.74 0.115 190 / 0.18)" }}
        >
          6
        </motion.div>
        {/* Pins que caen */}
        {pins.map((p, i) => (
          <motion.div
            key={i}
            initial={quieto ? false : { y: -60, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              delay: 0.7 + i * 0.13,
              type: "spring",
              stiffness: 420,
              damping: 16,
            }}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: p.x, top: p.y }}
          >
            <span className="acopio-map-pin" style={{ display: "grid" }}>
              <span />
            </span>
          </motion.div>
        ))}
        {/* Tarjeta de centro */}
        <motion.div
          initial={quieto ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease: EASE }}
          className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl border border-border bg-card/95 p-3 backdrop-blur"
        >
          <span className="profile-icon size-10 tone-success">
            <Store aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[13px] text-foreground">
              Centro Fe y Alegría
              <ShieldCheck className="size-3.5 text-success-ink" strokeWidth={2} />
            </p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              Vargas · Lun–Sáb 8:00–16:00
            </p>
          </div>
        </motion.div>
      </div>
    </Frame>
  );
}

/* ── Slide 8 · Panel y métricas ───────────────────────────────────────── */
export function DashboardMock() {
  const quieto = useQuieto();
  const barras = [40, 68, 52, 88, 60, 74];
  return (
    <Frame url="unidosporlaguaira.org/panel">
      <Shell activo={0}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "Envíos activos", v: 12 },
            { k: "Aportes", v: 348 },
            { k: "Solicitudes", v: 27 },
          ].map((m, i) => (
            <motion.div
              key={m.k}
              initial={quieto ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.09, duration: 0.5, ease: EASE }}
              className="rounded-xl border border-border bg-elevated/60 p-2.5"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                {m.k}
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">
                <CountUp to={m.v} delay={0.5 + i * 0.09} />
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-[1.4fr_1fr] gap-2.5">
          {/* Mini bar chart */}
          <div className="rounded-xl border border-border bg-elevated/60 p-3">
            <p className="mb-2 text-[11px] text-muted-foreground">
              Aportes por semana
            </p>
            <div className="flex h-16 items-end gap-1.5">
              {barras.map((h, i) => (
                <motion.div
                  key={i}
                  initial={quieto ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.6 + i * 0.07, duration: 0.6, ease: EASE_EXPO }}
                  className="flex-1 origin-bottom rounded-t"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 3 ? "var(--primary)" : "color-mix(in oklch, var(--primary) 40%, transparent)",
                  }}
                />
              ))}
            </div>
          </div>
          {/* Donut */}
          <div className="grid place-items-center rounded-xl border border-border bg-elevated/60 p-3">
            <Donut pct={64} />
          </div>
        </div>
      </Shell>
    </Frame>
  );
}

function Donut({ pct }: { pct: number }) {
  const quieto = useQuieto();
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <motion.circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={quieto ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * pct) / 100 }}
          transition={{ delay: 0.7, duration: 1.1, ease: EASE }}
        />
      </svg>
      <span className="absolute font-mono text-[13px] font-semibold tabular-nums text-foreground">
        <CountUp to={pct} suffix="%" delay={0.7} />
      </span>
    </div>
  );
}

/* ── Slide 9 · Transparencia (galería pública) ────────────────────────── */
export function TransparenciaMock() {
  const quieto = useQuieto();
  return (
    <Frame url="unidosporlaguaira.org/transparencia">
      <div className="p-3.5">
        <div className="flex items-center justify-between">
          {[
            { k: "Recolectado", v: 12480, s: " kg" },
            { k: "Personas", v: 3200 },
            { k: "Actividades", v: 58 },
          ].map((m, i) => (
            <motion.div
              key={m.k}
              initial={quieto ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: EASE }}
            >
              <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                <CountUp to={m.v} suffix={m.s ?? ""} delay={0.4 + i * 0.1} />
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                {m.k}
              </p>
            </motion.div>
          ))}
        </div>
        {/* Portada destacada */}
        <motion.div
          initial={quieto ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: EASE_EXPO }}
          className="relative mt-3 h-24 overflow-hidden rounded-xl border border-border"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.36 0.075 198), oklch(0.30 0.055 212))",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(oklch(0.95 0.02 200 / 0.14) 1px, transparent 1.4px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="absolute bottom-2 left-3">
            <Badge tone="success">Realizada</Badge>
            <p className="mt-1 font-serif text-[15px] text-white">
              Jornada médica en Naiguatá
            </p>
          </div>
        </motion.div>
        {/* Grid */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={quieto ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.1, duration: 0.5, ease: EASE }}
              className="h-16 rounded-lg border border-border bg-elevated/70"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, oklch(0.55 0.11 195 / 0.25), transparent 60%)",
              }}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── Slide 10 · Confianza (verificación + notificaciones) ─────────────── */
export function ConfianzaMock() {
  const quieto = useQuieto();
  const toasts = [
    { icon: Bell, c: "In-app", t: "Nuevo aporte recibido" },
    { icon: MessageCircle, c: "WhatsApp", t: "Código de verificación" },
    { icon: Mail, c: "Email", t: "Tu cuenta fue aprobada" },
  ];
  return (
    <div className="grid gap-3">
      <Frame url="unidosporlaguaira.org/superadmin/admins" float={false}>
        <div className="p-3.5">
          <p className="mb-2.5 text-[13px] font-medium text-foreground">
            Aprobación de administradores
          </p>
          <Stagger base={0.35} step={0.12}>
            {[
              { n: "Fundación Costa Viva", nuevo: true },
              { n: "Cáritas La Guaira", nuevo: false },
            ].map((a) => (
              <div
                key={a.n}
                className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-elevated/60 p-2.5"
              >
                <span className="profile-icon size-9 tone-primary">
                  <Store aria-hidden />
                </span>
                <span className="flex-1 text-[12.5px] text-foreground">{a.n}</span>
                {a.nuevo ? (
                  <motion.span
                    initial={quieto ? false : { scale: 0, rotate: -12, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 400, damping: 14 }}
                  >
                    <Badge tone="success">
                      <CheckCircle2 className="mr-1 size-3" strokeWidth={2.4} />
                      Verificado
                    </Badge>
                  </motion.span>
                ) : (
                  <Badge tone="warning">Pendiente</Badge>
                )}
              </div>
            ))}
          </Stagger>
        </div>
      </Frame>
      {/* Toasts multicanal */}
      <div className="grid gap-2">
        {toasts.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.c}
              initial={quieto ? false : { opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + i * 0.15, type: "spring", stiffness: 320, damping: 26 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/90 p-2.5 backdrop-blur"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <span className="profile-icon size-8 tone-primary">
                <Icon aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-primary-ink">
                  {t.c}
                </p>
                <p className="truncate text-[12px] text-foreground">{t.t}</p>
              </div>
              <Truck className="size-4 text-muted-foreground" strokeWidth={1.6} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
