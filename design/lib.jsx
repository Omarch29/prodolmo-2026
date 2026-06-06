// ============================================================
// PRODE Mundial — shared library: data + primitive components
// Exposes everything to window for the screen files.
// ============================================================
const { useState, useEffect, useRef } = React;

// ---- helpers ----
const pad2 = (n) => String(n).padStart(2, "0");

function fmtSegs(sec) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return [[d, "DÍAS"], [h, "HS"], [m, "MIN"]];
  if (h > 0) return [[h, "HS"], [m, "MIN"], [s, "SEG"]];
  return [[m, "MIN"], [s, "SEG"]];
}

// counts down (dir=-1) or up (dir=+1) from initialSec, ticking every second
function useClock(initialSec, dir = -1) {
  const [sec, setSec] = useState(initialSec);
  useEffect(() => {
    const id = setInterval(() => setSec((s) => {
      const n = s + dir;
      return n < 0 ? 0 : n;
    }), 1000);
    return () => clearInterval(id);
  }, []);
  return sec;
}

// ---- countdown marcador ----
function Marcador({ sec, variant = "", sm = false }) {
  const segs = fmtSegs(sec);
  return (
    <div className={"marcador " + variant + (sm ? " sm" : "")}>
      {segs.map((g, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="colon">:</span>}
          <div className="seg"><div className="d">{pad2(g[0])}</div><span className="u">{g[1]}</span></div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ---- avatar ----
function Avatar({ emoji, bg, size = 44 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: bg, fontSize: Math.round(size * 0.5) }}>
      {emoji}
    </div>
  );
}

// ---- buttons ----
function Btn({ children, variant, block, sm, ...rest }) {
  const cls = ["btn", variant ? "btn--" + variant : "", block ? "btn--block" : "", sm ? "btn--sm" : ""].join(" ");
  return <button className={cls} {...rest}>{children}</button>;
}

// ---- stepper (cargar) ----
function Stepper({ value, onChange, min = 0, max = 20, disabled = false }) {
  return (
    <div className={"stepper" + (disabled ? " dis" : "")}>
      <button className="minus" disabled={disabled} onClick={() => !disabled && onChange(Math.max(min, value - 1))}>–</button>
      <div className="val">{value}</div>
      <button className="plus" disabled={disabled} onClick={() => !disabled && onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

// ---- compact stepper (simulador) ----
function SimStepper({ value, onChange, min = 0, max = 20 }) {
  return (
    <div className="sim-stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))}>–</button>
      <div className="val">{value}</div>
      <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

// ---- progress bar (round breakdown) ----
function pbarTone(pct) { return pct >= 60 ? "hi" : pct >= 35 ? "mid" : "lo"; }
function RoundRow({ name, pts, max, pending }) {
  const pct = pending || !max ? 0 : Math.round((pts / max) * 100);
  return (
    <div className="round-row">
      <div className="round-row__top">
        <span className="rn">{name}</span>
        {pending
          ? <span className="rp" style={{ color: "var(--grey-400)" }}>—</span>
          : <span className="rp">{pct}% <small>({pts} pts)</small></span>}
      </div>
      <div className="pbar">
        <div className={"pbar__fill " + (pending ? "pending" : pbarTone(pct))} style={{ width: pending ? "100%" : pct + "%" }}></div>
        {!pending && pct > 0 && <span className="pbar__pct">{pts}/{max}</span>}
        {pending && <span className="pbar__pct" style={{ left: 8, right: "auto" }}>POR JUGARSE</span>}
      </div>
    </div>
  );
}

// ---- bottom nav (mobile) ----
const NAV = [
  { id: "inicio", ic: "🏠", l: "INICIO" },
  { id: "cargar", ic: "⚽", l: "CARGAR" },
  { id: "tabla", ic: "🏆", l: "TABLA" },
  { id: "sim", ic: "🎮", l: "SIM" },
];
function BottomNav({ active }) {
  return (
    <nav className="bnav">
      {NAV.map((it) => (
        <div key={it.id} className={"bnav__item" + (active === it.id ? " a" : "")}>
          <span className="ic">{it.ic}</span>
          <span className="l">{it.l}</span>
        </div>
      ))}
    </nav>
  );
}

// ---- desktop sidebar ----
function Sidebar({ active, me }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo"><span>⚽</span> PRODE</div>
      <div className="sidebar__nav">
        {NAV.map((it) => (
          <div key={it.id} className={"snav" + (active === it.id ? " a" : "")}>
            <span className="ic">{it.ic}</span> {it.l}
          </div>
        ))}
      </div>
      <div className="sidebar__foot">
        <Avatar emoji={me.emoji} bg={me.bg} size={40} />
        <div>
          <div className="nm">{me.name}</div>
          <div className="sub">{me.pts} pts · #{me.rank}</div>
        </div>
      </div>
    </aside>
  );
}

// ---- toast ----
function Toast({ kind, title, msg }) {
  const ic = { ok: "✅", goal: "⚽", err: "🟥", info: "🎮" }[kind] || "✅";
  return (
    <div className={"toast " + kind}>
      <div className="bar"></div>
      <span className="ic">{ic}</span>
      <div><div className="tt">{title}</div><div className="tm">{msg}</div></div>
    </div>
  );
}

// per-screen toast host. returns [node, fire]
function useToast() {
  const [t, setT] = useState(null);
  const tm = useRef(0);
  const fire = (toast) => { setT(toast); clearTimeout(tm.current); tm.current = setTimeout(() => setT(null), 2800); };
  const node = t ? <div className="toast-wrap"><Toast {...t} /></div> : null;
  return [node, fire];
}

// ============================================================
// SAMPLE DATA — grupo "Los Pibes", Mundial. Brief examples.
// ============================================================
const ME = { name: "Vos", emoji: "🧑‍🦱", bg: "var(--pitch-green-light)", pts: 142, rank: 2 };

const GROUP = [
  { name: "Julián", emoji: "🧢", bg: "var(--card-yellow)" },
  { name: "Vos", emoji: "🧑‍🦱", bg: "var(--pitch-green-light)", me: true },
  { name: "Sofi", emoji: "👧", bg: "var(--card-red)" },
  { name: "Carlos", emoji: "🧔", bg: "var(--sky-blue)" },
  { name: "Mati", emoji: "🧑", bg: "var(--goal-orange)" },
  { name: "Lucía", emoji: "👩", bg: "var(--pitch-green-lighter)" },
];

// leaderboard (with last-fecha movement)
const TABLE = [
  { name: "Julián", emoji: "🧢", bg: "var(--card-yellow)", pts: 156, delta: +2 },
  { name: "Vos", emoji: "🧑‍🦱", bg: "var(--pitch-green-light)", pts: 142, delta: -1, me: true },
  { name: "Sofi", emoji: "👧", bg: "var(--card-red)", pts: 138, delta: +1 },
  { name: "Mati", emoji: "🧑", bg: "var(--goal-orange)", pts: 121, delta: 0 },
  { name: "Lucía", emoji: "👩", bg: "var(--pitch-green-lighter)", pts: 109, delta: +1 },
  { name: "Carlos", emoji: "🧔", bg: "var(--sky-blue)", pts: 64, delta: -2 },
];

// per-round breakdown (for detail). max = total points available that round.
const ROUNDS_ME = [
  { name: "FASE DE GRUPOS", pts: 24, max: 72 },   // 33%
  { name: "OCTAVOS", pts: 8, max: 16 },           // 50%
  { name: "CUARTOS", pts: 6, max: 12 },           // 50%
  { name: "SEMIS", pts: 0, max: 8, pending: true },
  { name: "FINAL / 3°", pts: 0, max: 8, pending: true },
];
const ROUNDS_JULI = [
  { name: "FASE DE GRUPOS", pts: 40, max: 72 },
  { name: "OCTAVOS", pts: 10, max: 16 },
  { name: "CUARTOS", pts: 8, max: 12 },
  { name: "SEMIS", pts: 0, max: 8, pending: true },
  { name: "FINAL / 3°", pts: 0, max: 8, pending: true },
];

// matches still to play (cargar + simulador)
const UPCOMING = [
  { id: "m1", round: "OCTAVOS", a: { name: "ARG", flag: "🇦🇷" }, b: { name: "FRA", flag: "🇫🇷" }, sec: 47 * 60, knockout: true },
  { id: "m2", round: "OCTAVOS", a: { name: "BRA", flag: "🇧🇷" }, b: { name: "ESP", flag: "🇪🇸" }, sec: 3 * 3600 + 12 * 60, knockout: true },
  { id: "m3", round: "OCTAVOS", a: { name: "ING", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, b: { name: "POR", flag: "🇵🇹" }, sec: 26 * 3600, knockout: true },
  { id: "m4", round: "OCTAVOS", a: { name: "URU", flag: "🇺🇾" }, b: { name: "ALE", flag: "🇩🇪" }, sec: 49 * 3600, knockout: true },
];

Object.assign(window, {
  pad2, fmtSegs, useClock, Marcador, Avatar, Btn, Stepper, SimStepper,
  pbarTone, RoundRow, NAV, BottomNav, Sidebar, Toast, useToast,
  ME, GROUP, TABLE, ROUNDS_ME, ROUNDS_JULI, UPCOMING,
});
