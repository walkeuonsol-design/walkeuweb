import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * $walkeu – Walking Across Europe (Solana)
 * Fully fixed & validated React single-file site.
 * - Green themed, scroll-driven 3D highway
 * - Pitstops for (almost) every European country, EXCEPT Russia & Ukraine
 * - Cartoon landmark icons placed BESIDE the highway (no bubbles/emojis)
 * - No extra big widgets, no walker avatar (removed earlier for perf)
 * - Pump.fun + X links with logos
 */

// -----------------------------
// Config
// -----------------------------
const PUMP_FUN_URL = "https://pump.fun/coin/REPLACE_WITH_YOUR_TOKEN"; // <- set your link
const X_URL = "https://x.com/REPLACE_WITH_YOUR_HANDLE"; // <- set your handle
const TOKEN_MINT = "YOUR_SOLANA_MINT_ADDRESS_HERE"; // <- set your token mint

// -----------------------------
// Countries (Russia & Ukraine excluded)
// -----------------------------
// Includes microstates and wider Europe. Order approximates a long path starting/ending in Belgium.
const COUNTRIES = [
  { code: "BE", name: "Belgium", landmark: "Atomium", iconType: "atomium" },
  { code: "FR", name: "France", landmark: "Eiffel Tower", iconType: "tower" },
  { code: "MC", name: "Monaco", landmark: "Monte‑Carlo", iconType: "palace" },
  { code: "AD", name: "Andorra", landmark: "Pyrenees", iconType: "mountain" },
  { code: "ES", name: "Spain", landmark: "Sagrada Família", iconType: "basilica" },
  { code: "PT", name: "Portugal", landmark: "Belém Tower", iconType: "fort" },
  { code: "IT", name: "Italy", landmark: "Colosseum", iconType: "colosseum" },
  { code: "SM", name: "San Marino", landmark: "Guaita", iconType: "fort" },
  { code: "VA", name: "Vatican City", landmark: "St. Peter's", iconType: "basilica" },
  { code: "CH", name: "Switzerland", landmark: "Matterhorn", iconType: "mountain" },
  { code: "AT", name: "Austria", landmark: "Schönbrunn", iconType: "palace" },
  { code: "DE", name: "Germany", landmark: "Brandenburg Gate", iconType: "gate" },
  { code: "LU", name: "Luxembourg", landmark: "Gëlle Fra", iconType: "statue" },
  { code: "NL", name: "Netherlands", landmark: "Windmills", iconType: "windmill" },
  { code: "DK", name: "Denmark", landmark: "Little Mermaid", iconType: "mermaid" },
  { code: "NO", name: "Norway", landmark: "Fjords", iconType: "fjord" },
  { code: "SE", name: "Sweden", landmark: "Gamla Stan", iconType: "oldtown" },
  { code: "FI", name: "Finland", landmark: "Sauna", iconType: "sauna" },
  { code: "IS", name: "Iceland", landmark: "Geysir", iconType: "geyser" },
  { code: "IE", name: "Ireland", landmark: "Cliffs of Moher", iconType: "cliff" },
  { code: "GB", name: "United Kingdom", landmark: "Big Ben", iconType: "clocktower" },
  { code: "PL", name: "Poland", landmark: "Wawel", iconType: "castle" },
  { code: "CZ", name: "Czechia", landmark: "Charles Bridge", iconType: "bridge" },
  { code: "SK", name: "Slovakia", landmark: "Bratislava Castle", iconType: "castle" },
  { code: "HU", name: "Hungary", landmark: "Parliament", iconType: "parliament" },
  { code: "SI", name: "Slovenia", landmark: "Lake Bled", iconType: "lakecastle" },
  { code: "HR", name: "Croatia", landmark: "Dubrovnik", iconType: "oldwalls" },
  { code: "BA", name: "Bosnia & Herzegovina", landmark: "Stari Most", iconType: "bridge" },
  { code: "ME", name: "Montenegro", landmark: "Kotor Bay", iconType: "bay" },
  { code: "RS", name: "Serbia", landmark: "Kalemegdan", iconType: "fort" },
  { code: "XK", name: "Kosovo", landmark: "Newborn", iconType: "wordmark" },
  { code: "MK", name: "North Macedonia", landmark: "Stone Bridge", iconType: "bridge" },
  { code: "AL", name: "Albania", landmark: "Berat", iconType: "oldtown" },
  { code: "GR", name: "Greece", landmark: "Parthenon", iconType: "temple" },
  { code: "BG", name: "Bulgaria", landmark: "Alexander Nevsky", iconType: "cathedral" },
  { code: "RO", name: "Romania", landmark: "Bran Castle", iconType: "castle" },
  { code: "MD", name: "Moldova", landmark: "Cricova Winery", iconType: "wine" },
  { code: "BY", name: "Belarus", landmark: "Minsk Gates", iconType: "gate" },
  { code: "TR", name: "Turkey", landmark: "Galata Tower", iconType: "tower" },
  { code: "CY", name: "Cyprus", landmark: "Aphrodite's Rock", iconType: "rock" },
  { code: "LT", name: "Lithuania", landmark: "Trakai", iconType: "castle" },
  { code: "LV", name: "Latvia", landmark: "Riga Old Town", iconType: "oldtown" },
  { code: "EE", name: "Estonia", landmark: "Tallinn Walls", iconType: "oldwalls" },
  { code: "LI", name: "Liechtenstein", landmark: "Vaduz Castle", iconType: "castle" },
  { code: "MT", name: "Malta", landmark: "Azure Window*", iconType: "archrock" },
  { code: "BE_END", name: "Back to Belgium", landmark: "Finish!", iconType: "flagbe" },
];

// -----------------------------
// Logos (inline SVG)
// -----------------------------
const PumpLogo = (props) => (
  <svg viewBox="0 0 64 64" className={props.className} aria-hidden>
    <circle cx="32" cy="32" r="30" fill="#00ff87" />
    <path d="M20 42 V22 h8 a8 8 0 1 1 0 16 h-8z" fill="#0a0a0a" />
  </svg>
);

const XLogo = (props) => (
  <svg viewBox="0 0 1200 1227" className={props.className} aria-hidden>
    <path fill="#0a0a0a" d="M714 0H957L543 530l622 697H834L464 821 80 1227H0l438-491L0 0h367l337 414L714 0z" />
  </svg>
);

// -----------------------------
// Highway SVG (curved) with center dashed line
// -----------------------------
const Highway = React.forwardRef(({ height = 3600 }, ref) => {
  const w = 1200;
  const h = height;
  const control = (i) => `${i % 2 === 0 ? 220 : 980},${(h / 6) * (i + 1)}`;
  const d = `M 600,0 C ${control(0)} ${control(1)} ${control(2)} ${control(3)} ${control(4)} ${control(5)}`;
  return (
    <svg ref={ref} viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="pointer-events-none select-none">
      <defs>
        <linearGradient id="roadg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2518" />
          <stop offset="100%" stopColor="#0b1a12" />
        </linearGradient>
      </defs>
      <path id="roadPath" d={d} stroke="url(#roadg)" strokeWidth="140" fill="none" strokeLinecap="round" />
      <path d={d} stroke="#c7f9cc" strokeWidth="8" strokeDasharray="28 28" fill="none" />
    </svg>
  );
});

// -----------------------------
// Cartoon landmark icons (simple SVGs, green palette)
// -----------------------------
function LandmarkIcon({ type, className }) {
  switch (type) {
    case "atomium":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <circle cx="32" cy="18" r="6" fill="#a7f3d0" />
          <circle cx="18" cy="34" r="5" fill="#a7f3d0" />
          <circle cx="46" cy="34" r="5" fill="#a7f3d0" />
          <line x1="32" y1="18" x2="18" y2="34" stroke="#34d399" strokeWidth="3" />
          <line x1="32" y1="18" x2="46" y2="34" stroke="#34d399" strokeWidth="3" />
          <line x1="18" y1="34" x2="46" y2="34" stroke="#34d399" strokeWidth="3" />
        </svg>
      );
    case "tower":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <polygon points="32,6 22,18 42,18" fill="#34d399" />
          <rect x="26" y="18" width="12" height="34" fill="#a7f3d0" />
          <rect x="22" y="52" width="20" height="4" fill="#10b981" />
        </svg>
      );
    case "basilica":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="10" y="28" width="44" height="22" rx="3" fill="#a7f3d0" />
          <circle cx="32" cy="24" r="10" fill="#34d399" />
        </svg>
      );
    case "colosseum":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="8" y="34" width="48" height="12" rx="2" fill="#a7f3d0" />
          <rect x="12" y="30" width="8" height="6" fill="#0f766e" />
          <rect x="24" y="30" width="8" height="6" fill="#0f766e" />
          <rect x="36" y="30" width="8" height="6" fill="#0f766e" />
          <rect x="48" y="30" width="8" height="6" fill="#0f766e" />
        </svg>
      );
    case "palace":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="12" y="28" width="40" height="20" fill="#a7f3d0" />
          <polygon points="12,28 32,16 52,28" fill="#34d399" />
          <rect x="30" y="34" width="8" height="14" fill="#0f766e" />
        </svg>
      );
    case "mountain":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <polygon points="8,48 28,20 44,40 56,48" fill="#34d399" />
          <polygon points="28,20 36,28 28,28" fill="#a7f3d0" />
        </svg>
      );
    case "gate":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="12" y="34" width="40" height="12" fill="#a7f3d0" />
          <rect x="20" y="26" width="8" height="8" fill="#34d399" />
          <rect x="36" y="26" width="8" height="8" fill="#34d399" />
        </svg>
      );
    case "statue":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="28" y="18" width="8" height="18" fill="#a7f3d0" />
          <circle cx="32" cy="14" r="6" fill="#34d399" />
          <rect x="22" y="38" width="20" height="6" fill="#10b981" />
        </svg>
      );
    case "windmill":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="28" y="22" width="8" height="22" fill="#a7f3d0" />
          <line x1="32" y1="12" x2="32" y2="52" stroke="#34d399" strokeWidth="3" />
          <line x1="12" y1="32" x2="52" y2="32" stroke="#34d399" strokeWidth="3" />
        </svg>
      );
    case "mermaid":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <circle cx="28" cy="20" r="6" fill="#a7f3d0" />
          <path d="M20 30c8 0 20 8 24 18-8 0-16-4-20-10-2-4-2-6-4-8z" fill="#34d399" />
        </svg>
      );
    case "fjord":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <polygon points="8,48 20,28 28,40 36,26 48,44 56,48" fill="#34d399" />
          <rect x="8" y="48" width="48" height="4" fill="#a7f3d0" />
        </svg>
      );
    case "oldtown":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="12" y="30" width="10" height="16" fill="#a7f3d0" />
          <rect x="26" y="26" width="12" height="20" fill="#34d399" />
          <rect x="42" y="28" width="10" height="18" fill="#10b981" />
        </svg>
      );
    case "sauna":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="16" y="30" width="32" height="16" fill="#a7f3d0" />
          <path d="M22 30v-6c0-2 2-4 4-4h12c2 0 4 2 4 4v6" stroke="#34d399" strokeWidth="3" fill="none" />
        </svg>
      );
    case "geyser":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <path d="M32 14c-6 10 6 10 0 20 8-6 0-10 8-20" fill="#34d399" />
          <rect x="16" y="46" width="32" height="4" fill="#a7f3d0" />
        </svg>
      );
    case "cliff":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <polygon points="12,48 24,28 36,38 52,16 52,48" fill="#34d399" />
        </svg>
      );
    case "clocktower":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="28" y="16" width="8" height="28" fill="#a7f3d0" />
          <circle cx="32" cy="24" r="6" fill="#34d399" />
          <rect x="24" y="44" width="16" height="6" fill="#10b981" />
        </svg>
      );
    case "castle":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="12" y="30" width="40" height="18" fill="#a7f3d0" />
          <rect x="12" y="26" width="6" height="6" fill="#34d399" />
          <rect x="46" y="26" width="6" height="6" fill="#34d399" />
        </svg>
      );
    case "bridge":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="12" y="40" width="40" height="4" fill="#a7f3d0" />
          <path d="M12 40c6-10 18-10 24 0 6-10 18-10 24 0" stroke="#34d399" strokeWidth="3" fill="none" />
        </svg>
      );
    case "parliament":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="10" y="34" width="44" height="14" fill="#a7f3d0" />
          <rect x="28" y="26" width="8" height="8" fill="#34d399" />
          <polygon points="20,34 32,22 44,34" fill="#10b981" />
        </svg>
      );
    case "lakecastle":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="24" y="26" width="16" height="16" fill="#a7f3d0" />
          <rect x="24" y="24" width="16" height="4" fill="#34d399" />
          <rect x="16" y="48" width="32" height="4" fill="#10b981" />
        </svg>
      );
    case "oldwalls":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="12" y="32" width="40" height="14" fill="#a7f3d0" />
          <rect x="16" y="28" width="8" height="6" fill="#34d399" />
          <rect x="40" y="28" width="8" height="6" fill="#34d399" />
        </svg>
      );
    case "bay":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="12" y="48" width="40" height="4" fill="#a7f3d0" />
          <path d="M12 48c10-10 30-10 40 0" stroke="#34d399" strokeWidth="3" fill="none" />
        </svg>
      );
    case "wordmark":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <rect x="2" y="6" width="60" height="12" rx="4" fill="#a7f3d0" />
        </svg>
      );
    case "temple":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <polygon points="8,28 32,14 56,28" fill="#34d399" />
          <rect x="12" y="28" width="40" height="4" fill="#a7f3d0" />
          <rect x="18" y="32" width="4" height="16" fill="#a7f3d0" />
          <rect x="42" y="32" width="4" height="16" fill="#a7f3d0" />
        </svg>
      );
    case "cathedral":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="14" y="28" width="36" height="20" fill="#a7f3d0" />
          <polygon points="14,28 32,16 50,28" fill="#34d399" />
          <rect x="30" y="34" width="8" height="14" fill="#0f766e" />
        </svg>
      );
    case "wine":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <path d="M24 18c0 10 8 12 8 18s-8 6-8 6h16s-8 0-8-6 8-8 8-18" stroke="#34d399" strokeWidth="3" fill="none" />
          <rect x="22" y="44" width="20" height="4" fill="#a7f3d0" />
        </svg>
      );
    case "rock":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <polygon points="20,44 30,26 44,36 36,48" fill="#34d399" />
        </svg>
      );
    case "archrock":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <path d="M14 46c12-16 24-16 36 0" stroke="#34d399" strokeWidth="4" fill="none" />
          <rect x="12" y="46" width="40" height="4" fill="#a7f3d0" />
        </svg>
      );
    case "flagbe":
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="8" y="18" width="16" height="28" fill="#111827" />
          <rect x="24" y="18" width="16" height="28" fill="#f59e0b" />
          <rect x="40" y="18" width="16" height="28" fill="#ef4444" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <circle cx="32" cy="32" r="14" fill="#34d399" />
        </svg>
      );
  }
}

// -----------------------------
// Helpers for positioning along path
// -----------------------------
function usePathHelpers(pathRootRef) {
  const [pathLength, setPathLength] = useState(1);

  useEffect(() => {
    const svgPath = pathRootRef.current?.querySelector("#roadPath");
    if (svgPath) setPathLength(svgPath.getTotalLength());
    const ro = new ResizeObserver(() => {
      const s = pathRootRef.current?.querySelector("#roadPath");
      if (s) setPathLength(s.getTotalLength());
    });
    if (pathRootRef.current) ro.observe(pathRootRef.current);
    return () => ro.disconnect();
  }, [pathRootRef]);

  const getPointAtT = (t) => {
    const svgPath = pathRootRef.current?.querySelector("#roadPath");
    if (!svgPath) return { x: 0, y: 0, len: 0, svgPath: null };
    const len = svgPath.getTotalLength();
    const p = svgPath.getPointAtLength(Math.max(0, Math.min(len, t * len)));
    return { x: p.x, y: p.y, len: t * len, svgPath };
  };

  const getNormalAtLength = (svgPath, len) => {
    const eps = 1;
    const p1 = svgPath.getPointAtLength(Math.max(0, len - eps));
    const p2 = svgPath.getPointAtLength(Math.min(svgPath.getTotalLength(), len + eps));
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const mag = Math.hypot(dx, dy) || 1;
    return { x: -dy / mag, y: dx / mag };
  };

  return { pathLength, getPointAtT, getNormalAtLength };
}

// -----------------------------
// Landmark marker (beside the road with connector)
// -----------------------------
function LandmarkMarker({ name, landmark, iconType, t, side, pathRootRef, smooth }) {
  const { getPointAtT, getNormalAtLength } = usePathHelpers(pathRootRef);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const { x, y, len, svgPath } = getPointAtT(t);
    if (!svgPath) return;
    const n = getNormalAtLength(svgPath, len);
    const distance = 170; // px off the road
    const dir = side === "left" ? -1 : 1;
    setPos({ x, y });
    setOffset({ x: n.x * distance * dir, y: n.y * distance * dir });
  }, [t, side, getPointAtT, getNormalAtLength]);

  const float = useTransform(smooth, [0, 1], [0, -6]);

  return (
    <motion.div
      style={{ position: "absolute", left: `calc(50% - 600px + ${pos.x + offset.x}px)`, top: `${pos.y + offset.y - 56}px`, y: float }}
      className="select-none"
    >
      <svg width="1" height="1" className="absolute left-1/2 top-[48px] overflow-visible -z-10">
        <line x1="0" y1="0" x2={-offset.x} y2={-offset.y} stroke="#a7f3d0" strokeWidth="2" strokeDasharray="4 6" />
      </svg>
      <div className="flex items-center gap-3 bg-emerald-900/30 backdrop-blur rounded-2xl px-3 py-2 border border-emerald-700/30 shadow">
        <LandmarkIcon type={iconType} className="w-10 h-10 drop-shadow" />
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-wide">{name}</div>
          <div className="text-xs opacity-90 text-emerald-100/90">{landmark}</div>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------
// Main component
// -----------------------------
export default function WalkeuSite() {
  const pathRootRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 30 });

  // derived stops with evenly spaced t
  const stops = useMemo(() => COUNTRIES.map((c, i) => ({ ...c, t: i / (COUNTRIES.length - 1) })), []);

  // DEV TESTS (lightweight assertions)
  useEffect(() => {
    try {
      console.assert(!COUNTRIES.some(c => c.code === "RU"), "RU should be excluded");
      console.assert(!COUNTRIES.some(c => c.code === "UA"), "UA should be excluded");
      const codes = new Set();
      for (const c of COUNTRIES) {
        if (codes.has(c.code)) throw new Error(`Duplicate code ${c.code}`);
        codes.add(c.code);
      }
      console.assert(stops[0]?.code === "BE", "Route must start in Belgium");
      console.assert(stops[stops.length - 1]?.code === "BE_END", "Route should end in BE_END");
    } catch (e) {
      console.error("Config test failure:", e);
    }
  }, [stops]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-900 via-emerald-950 to-black text-emerald-50 overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur bg-emerald-950/60 border-b border-emerald-700/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="font-bold text-lg">$WalkEU</div>
              <div className="text-xs opacity-70">Visiting every European country on PumpFun live</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={PUMP_FUN_URL} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400 text-emerald-950 font-semibold shadow hover:shadow-emerald-400/30 active:scale-[0.98]">
              <PumpLogo className="w-5 h-5" />
              <span>Pump.fun</span>
            </a>
            <a href={X_URL} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-200 text-emerald-950 font-semibold shadow hover:shadow-emerald-200/30 active:scale-[0.98]">
              <XLogo className="w-4 h-4" />
              <span>Follow on X</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO (minimal) */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05]">Walk across Europe on PumpFun live with us</h1>
          <p className="mt-4 text-emerald-200/90 md:text-lg max-w-prose">
         Visiting every European country on PumpFun live with a friend. Hoping to meet new people, learn more about the European culture and give back to the $WalkEU community. 
          </p>
          <div className="mt-5 inline-flex items-center gfap-3 bg-emerald-950/60 border border-emerald-700/30 rounded-2xl p-2">
            <div className="px-3 py-2 rounded-xl bg-black/40 font-mono text-xs select-all">{TOKEN_MINT}</div>
            <button onClick={() => navigator.clipboard && navigator.clipboard.writeText(TOKEN_MINT)} className="px-3 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-semibold hover:bg-emerald-400 active:scale-[0.98]">Copy</button>
          </div>
        </div>
      </section>

      {/* ROADMAP / HIGHWAY */}
      <section className="relative">
        <div ref={pathRootRef} className="relative" style={{ height: 3600 }}>
          <motion.div style={{
            rotateX: useTransform(smooth, [0,1], [8, 16]),
            rotateZ: useTransform(smooth, [0,1], [-1.5, 1.5]),
            scale: useTransform(smooth, [0,1], [1, 1.02])
          }}>
            <Highway height={3600} />
          </motion.div>

          {/* Landmark markers */}
          {stops.map((s, i) => (
            <LandmarkMarker
              key={`${s.code}-${i}`}
              name={s.name}
              landmark={s.landmark}
              iconType={s.iconType}
              t={s.t}
              side={i % 2 === 0 ? "left" : "right"}
              pathRootRef={pathRootRef}
              smooth={smooth}
            />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-emerald-800/30 text-emerald-200/70">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} $WalkEU — Visiting every country in Europe on PumpFun live</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={PUMP_FUN_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400 text-emerald-950 font-semibold"><PumpLogo className="w-5 h-5" /> Pump.fun</a>
            <a href={X_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-200 text-emerald-950 font-semibold"><XLogo className="w-4 h-4" /> X</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


