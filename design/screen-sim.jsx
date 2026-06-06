// ============================================================
// PRODE Mundial — Screen 4: SIMULADOR DE CAMPEÓN (modo simulación)
// Herramienta aparte: simulá los partidos que quedan y mirá qué
// EQUIPO saldría campeón del Mundial (avanza el cuadro, no la tabla
// de jugadores).
// ============================================================

const T = {
  ARG: { name: "ARGENTINA", flag: "🇦🇷" }, FRA: { name: "FRANCIA", flag: "🇫🇷" },
  BRA: { name: "BRASIL", flag: "🇧🇷" }, ESP: { name: "ESPAÑA", flag: "🇪🇸" },
  ING: { name: "INGLATERRA", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, POR: { name: "PORTUGAL", flag: "🇵🇹" },
  URU: { name: "URUGUAY", flag: "🇺🇾" }, ALE: { name: "ALEMANIA", flag: "🇩🇪" },
};

// cuartos = partidos por jugarse (con contador)
const QUARTERS = [
  { id: "q1", a: T.ARG, b: T.FRA, sec: 47 * 60 },
  { id: "q2", a: T.BRA, b: T.ESP, sec: 3 * 3600 + 12 * 60 },
  { id: "q3", a: T.ING, b: T.POR, sec: 26 * 3600 },
  { id: "q4", a: T.URU, b: T.ALE, sec: 49 * 3600 },
];

function SimGame({ label, a, b, pick, onPick, sec }) {
  const live = sec != null;
  const ticked = useClock(sec || 0, -1);
  return (
    <div className="simg">
      <div className="simg__head">
        <span>{label}</span>
        {live
          ? <span className="pend"><Marcador sec={ticked} sm variant="live" /></span>
          : <span>⚙ HIPOTÉTICO</span>}
      </div>
      {[["a", a], ["b", b]].map(([k, team]) => (
        <button key={k} className={"simg__opt" + (pick === k ? " win" : "")} onClick={() => onPick(k)}>
          <span className="fl">{team.flag}</span>
          <span className="nm">{team.name}</span>
          <span className="pickdot">{pick === k ? "✓ PASA" : "ELEGIR"}</span>
        </button>
      ))}
    </div>
  );
}

function SimuladorScreen() {
  // who advances at each match (slot 'a' or 'b' of that match)
  const [pick, setPick] = useState({ q1: "a", q2: "a", q3: "a", q4: "a", s1: "a", s2: "a", f: "a" });
  const set = (k, v) => setPick((p) => ({ ...p, [k]: v }));
  const W = (m, k) => (pick[k] === "a" ? m.a : m.b);

  // derive bracket from quarter picks upward
  const wq = { q1: W(QUARTERS[0], "q1"), q2: W(QUARTERS[1], "q2"), q3: W(QUARTERS[2], "q3"), q4: W(QUARTERS[3], "q4") };
  const semis = [
    { id: "s1", a: wq.q1, b: wq.q2 },
    { id: "s2", a: wq.q3, b: wq.q4 },
  ];
  const ws1 = pick.s1 === "a" ? semis[0].a : semis[0].b;
  const ws2 = pick.s2 === "a" ? semis[1].a : semis[1].b;
  const finalG = { id: "f", a: ws1, b: ws2 };
  const champ = pick.f === "a" ? finalG.a : finalG.b;

  return (
    <div className="pscreen">
      <div className="topbar"><div className="title"><span>🎮</span> SIMULADOR</div><div className="pts">{ME.pts}</div></div>
      <div className="pscreen__body">
        <div className="sim-banner">
          <span className="ic">🧪</span>
          <span className="tx">MODO SIMULACIÓN<small>Probá quién sale campeón del Mundial. NO afecta tus pronósticos del PRODE.</small></span>
        </div>

        {/* projected world cup champion (a TEAM) */}
        <div className="champ-hero">
          <span className="sim-tag">HIPOTÉTICO</span>
          <div className="lbl">🏆 CAMPEÓN DEL MUNDIAL</div>
          <div className="trophy">🏆</div>
          <div className="flag">{champ.flag}</div>
          <div className="team">{champ.name}</div>
          <div className="sub">Según los resultados que elijas abajo. Cambialos y mirá cómo se arma el cuadro.</div>
        </div>

        <div className="bracket-round">
          <div className="bracket-round__lbl">🗓 CUARTOS · PARTIDOS POR JUGARSE <span className="n">4 PARTIDOS</span></div>
          {QUARTERS.map((m, i) => (
            <SimGame key={m.id} label={`CUARTOS · LLAVE ${i + 1}`} a={m.a} b={m.b} sec={m.sec}
              pick={pick[m.id]} onPick={(v) => set(m.id, v)} />
          ))}
        </div>

        <div className="bracket-round">
          <div className="bracket-round__lbl">⚔ SEMIFINALES <span className="n">DEPENDE DE CUARTOS</span></div>
          {semis.map((m, i) => (
            <SimGame key={m.id} label={`SEMIFINAL ${i + 1}`} a={m.a} b={m.b}
              pick={pick[m.id]} onPick={(v) => set(m.id, v)} />
          ))}
        </div>

        <div className="bracket-round">
          <div className="bracket-round__lbl">👑 FINAL</div>
          <SimGame label="FINAL DEL MUNDIAL" a={finalG.a} b={finalG.b} pick={pick.f} onPick={(v) => set("f", v)} />
        </div>

        <div style={{ padding: "0 16px 16px" }}>
          <Btn block variant="info" onClick={() => setPick({ q1: "a", q2: "a", q3: "a", q4: "a", s1: "a", s2: "a", f: "a" })}>↺ Reiniciar simulación</Btn>
        </div>
      </div>
      <BottomNav active="sim" />
    </div>
  );
}

Object.assign(window, { T, QUARTERS, SimGame, SimuladorScreen });
