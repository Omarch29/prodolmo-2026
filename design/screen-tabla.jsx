// ============================================================
// PRODE Mundial — Screen 3: TABLA DE POSICIONES + detalle por ronda
// ============================================================

// per-player round breakdowns (pts vs max-available per round)
const ROUNDS_BY_NAME = {
  "Julián": ROUNDS_JULI,
  "Vos": ROUNDS_ME,
  "Sofi": [
    { name: "FASE DE GRUPOS", pts: 36, max: 72 }, { name: "OCTAVOS", pts: 6, max: 16 },
    { name: "CUARTOS", pts: 6, max: 12 }, { name: "SEMIS", pts: 0, max: 8, pending: true }, { name: "FINAL / 3°", pts: 0, max: 8, pending: true },
  ],
  "Mati": [
    { name: "FASE DE GRUPOS", pts: 30, max: 72 }, { name: "OCTAVOS", pts: 4, max: 16 },
    { name: "CUARTOS", pts: 4, max: 12 }, { name: "SEMIS", pts: 0, max: 8, pending: true }, { name: "FINAL / 3°", pts: 0, max: 8, pending: true },
  ],
  "Lucía": [
    { name: "FASE DE GRUPOS", pts: 27, max: 72 }, { name: "OCTAVOS", pts: 6, max: 16 },
    { name: "CUARTOS", pts: 2, max: 12 }, { name: "SEMIS", pts: 0, max: 8, pending: true }, { name: "FINAL / 3°", pts: 0, max: 8, pending: true },
  ],
  "Carlos": [
    { name: "FASE DE GRUPOS", pts: 18, max: 72 }, { name: "OCTAVOS", pts: 0, max: 16 },
    { name: "CUARTOS", pts: 4, max: 12 }, { name: "SEMIS", pts: 0, max: 8, pending: true }, { name: "FINAL / 3°", pts: 0, max: 8, pending: true },
  ],
};
const deltaCls = (d) => (d > 0 ? "up" : d < 0 ? "down" : "same");
const deltaTxt = (d) => (d > 0 ? "▲" + d : d < 0 ? "▼" + Math.abs(d) : "=");

// detail body (reused as overlay + standalone screen)
function PlayerDetail({ player, rank, onBack }) {
  const rounds = ROUNDS_BY_NAME[player.name] || ROUNDS_ME;
  const played = rounds.filter((r) => !r.pending);
  const got = played.reduce((s, r) => s + r.pts, 0);
  const avail = played.reduce((s, r) => s + r.max, 0);
  const overall = avail ? Math.round((got / avail) * 100) : 0;
  return (
    <React.Fragment>
      <div className="detail-hero">
        {onBack && <button className="btn btn--ghost btn--sm" style={{ padding: "8px 10px" }} onClick={onBack}>◂</button>}
        <Avatar emoji={player.emoji} bg={player.bg} size={54} />
        <div className="meta">
          <div className="nm">{player.name.toUpperCase()}{player.me ? " (VOS)" : ""}</div>
          <div className="sub">Puesto #{rank} · {overall}% del total posible</div>
        </div>
        <div className="tot"><span className="c">PUNTOS</span><span className="v">{player.pts}</span></div>
      </div>
      <div style={{ flex: 1, paddingTop: 16, overflow: "hidden" }}>
        <div className="sec-title" style={{ marginBottom: 12 }}><span>📊 DESGLOSE POR RONDA</span></div>
        {rounds.map((r) => <RoundRow key={r.name} {...r} />)}
        <div style={{ margin: "4px 16px 0", padding: "10px 12px", background: "var(--scoreboard-ink)", border: "var(--border-thin) solid var(--scoreboard-slate)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📈</span>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--grey-300)", lineHeight: 1.4 }}>Mejor ronda: <strong style={{ color: "var(--card-yellow)" }}>{[...played].sort((a, b) => b.pts / b.max - a.pts / a.max)[0].name.toLowerCase()}</strong>. Quedan 2 rondas por jugarse.</p>
        </div>
      </div>
    </React.Fragment>
  );
}

// ---- leaderboard screen (interactive: tap a player) ----
function TablaScreen() {
  const [sel, setSel] = useState(null);
  if (sel) {
    const rank = TABLE.findIndex((r) => r.name === sel.name) + 1;
    return (
      <div className="pscreen">
        <div className="topbar"><div className="title"><span>🏆</span> DETALLE</div><div className="pts">{ME.pts}</div></div>
        <div className="pscreen__body" style={{ gap: 0, paddingTop: 0 }}>
          <PlayerDetail player={sel} rank={rank} onBack={() => setSel(null)} />
        </div>
        <BottomNav active="tabla" />
      </div>
    );
  }
  return (
    <div className="pscreen">
      <div className="topbar"><div className="title"><span>🏆</span> TABLA</div><div className="pts">{ME.pts}</div></div>
      <div className="pscreen__body">
        <div className="sec-title"><span>🏆 GRUPO "LOS PIBES"</span><span className="more">FECHA 4 ▸</span></div>
        {TABLE.map((r, i) => {
          const medal = ["g", "s", "b"][i] || "";
          return (
            <div key={r.name} className={"lb-row " + medal + (r.me ? " me" : "")} onClick={() => setSel(r)}>
              <span className="rank">{i + 1}</span>
              <Avatar emoji={r.emoji} bg={r.bg} size={32} />
              <span className="pname">{r.name}{i === 0 ? " 👑" : ""} <span className={"delta " + deltaCls(r.delta)}>{deltaTxt(r.delta)}</span></span>
              <span className="pts-badge">{r.pts}</span>
            </div>
          );
        })}
        <div style={{ padding: "2px 16px 16px", display: "flex", gap: 10 }}>
          <Btn variant="sec" block sm><span>👥</span>Invitar</Btn>
          <Btn variant="ghost" block sm onClick={() => setSel(TABLE.find((r) => r.me))}>👤 Mi desglose</Btn>
        </div>
        <div style={{ padding: "0 16px 12px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--grey-400)" }}>Tocá un jugador para ver su desglose por ronda ▸</div>
      </div>
      <BottomNav active="tabla" />
    </div>
  );
}

// ---- standalone detail screen (own breakdown) for the canvas ----
function DetailScreen() {
  return (
    <div className="pscreen">
      <div className="topbar"><div className="title"><span>🏆</span> MI DESGLOSE</div><div className="pts">{ME.pts}</div></div>
      <div className="pscreen__body" style={{ gap: 0, paddingTop: 0 }}>
        <PlayerDetail player={TABLE.find((r) => r.me)} rank={2} />
      </div>
      <BottomNav active="tabla" />
    </div>
  );
}

Object.assign(window, { ROUNDS_BY_NAME, PlayerDetail, TablaScreen, DetailScreen, deltaCls, deltaTxt });
