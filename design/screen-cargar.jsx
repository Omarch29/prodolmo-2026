// ============================================================
// PRODE Mundial — Screen 2: CARGAR PARTIDO (pronóstico)
// Variants: grupos · eliminación (empate) · bloqueado · histórico
// ============================================================

// friends' picks for the open match (ARG vs BRA grupos)
const PICKS_OPEN = [
  { name: "Julián", emoji: "🧢", bg: "var(--card-yellow)", a: 2, b: 0 },
  { name: "Sofi", emoji: "👧", bg: "var(--card-red)", a: 1, b: 1 },
  { name: "Carlos", emoji: "🧔", bg: "var(--sky-blue)", a: 3, b: 1 },
  { name: "Mati", emoji: "🧑", bg: "var(--goal-orange)", a: 1, b: 2 },
];

// friends' picks + outcome for the played match (ARG 2-1 FRA)
const PICKS_PLAYED = [
  { name: "Vos", emoji: "🧑‍🦱", bg: "var(--pitch-green-light)", a: 2, b: 1, pts: 5, kind: "exact", me: true },
  { name: "Julián", emoji: "🧢", bg: "var(--card-yellow)", a: 2, b: 0, pts: 3, kind: "pts" },
  { name: "Sofi", emoji: "👧", bg: "var(--card-red)", a: 1, b: 0, pts: 3, kind: "pts" },
  { name: "Mati", emoji: "🧑", bg: "var(--goal-orange)", a: 1, b: 2, pts: 0, kind: "zero" },
  { name: "Carlos", emoji: "🧔", bg: "var(--sky-blue)", a: 0, b: 2, pts: 0, kind: "zero" },
];

function FriendPicks({ title, picks, reveal }) {
  return (
    <div className="fp-block">
      <div className="fp-block__title">👥 {title}</div>
      {picks.map((p) => (
        <div key={p.name} className={"fp-row" + (reveal && p.pts > 0 ? " hit" : "")} style={p.me ? { outline: "var(--border-thin) dashed var(--goal-orange)", outlineOffset: -2 } : null}>
          <Avatar emoji={p.emoji} bg={p.bg} size={28} />
          <span className="pnm">{p.name}</span>
          {reveal
            ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="pred" style={{ fontSize: 18 }}>{p.a}-{p.b}</span>
                <span className={"res-badge " + p.kind}>{p.kind === "exact" ? "🎯 " : ""}{p.pts > 0 ? "+" + p.pts : "0"}</span>
              </span>
            : <span className="pred">{p.a} - {p.b}</span>}
        </div>
      ))}
    </div>
  );
}

// ---- VARIANT A — FASE DE GRUPOS (editable) ----
function CargarGrupos() {
  const [pred, setPred] = useState({ a: 2, b: 1 });
  const sec = useClock(2 * 3600 + 12 * 60, -1);
  const [toastNode, fire] = useToast();
  return (
    <div className="pscreen">
      {toastNode}
      <div className="topbar">
        <div className="title"><span>⚽</span> CARGAR</div>
        <div className="pts">{ME.pts}</div>
      </div>
      <div className="pscreen__body">
        <div className="fecha-head"><span className="ttl">FECHA 5 · GRUPOS</span><span className="chip warn">EDITABLE</span></div>

        <div className="match">
          <div className="match__head"><span>GRUPO C · HOY 18:00</span><span>⏱ FALTA</span></div>
          <div className="match__teams">
            <div className="team"><span className="flag">🇦🇷</span><span className="nm">ARGENTINA</span></div>
            <div className="vs">VS</div>
            <div className="team"><span className="flag">🇧🇷</span><span className="nm">BRASIL</span></div>
          </div>
          <div className="match__inputs">
            <div className="center"><Stepper value={pred.a} onChange={(v) => setPred({ ...pred, a: v })} /></div>
            <span className="dash">-</span>
            <div className="center"><Stepper value={pred.b} onChange={(v) => setPred({ ...pred, b: v })} /></div>
          </div>
          <div className="match__timerbar"><span className="lbl">EMPIEZA EN</span><Marcador sec={sec} variant="" sm /></div>
        </div>

        <FriendPicks title="¿Qué pusieron tus compañeros?" picks={PICKS_OPEN} />

        <div style={{ padding: "4px 16px 16px" }}>
          <Btn block onClick={() => fire({ kind: "ok", title: "PRONÓSTICO GUARDADO", msg: `Argentina ${pred.a} - ${pred.b} Brasil cargado. Podés editarlo hasta el cierre.` })}><span className="ball">⚽</span>Guardar pronóstico</Btn>
        </div>
      </div>
      <BottomNav active="cargar" />
    </div>
  );
}

// ---- VARIANT B — ELIMINACIÓN (empate → quién pasa) ----
function CargarElim() {
  const [pred, setPred] = useState({ a: 1, b: 1 });
  const [pass, setPass] = useState("a");
  const sec = useClock(47 * 60, -1);
  const [toastNode, fire] = useToast();
  const tie = pred.a === pred.b;
  return (
    <div className="pscreen">
      {toastNode}
      <div className="topbar">
        <div className="title"><span>⚽</span> CARGAR</div>
        <div className="pts">{ME.pts}</div>
      </div>
      <div className="pscreen__body">
        <div className="fecha-head"><span className="ttl">OCTAVOS · LLAVE 1</span><span className="chip live">● ELIMINACIÓN</span></div>

        <div className="match">
          <div className="match__head"><span>OCTAVOS · HOY 21:00</span><span className="live">⏱ FALTA POCO</span></div>
          <div className="match__teams">
            <div className="team"><span className="flag">🇦🇷</span><span className="nm">ARGENTINA</span></div>
            <div className="vs">VS</div>
            <div className="team"><span className="flag">🇫🇷</span><span className="nm">FRANCIA</span></div>
          </div>
          <div className="match__inputs">
            <div className="center"><Stepper value={pred.a} onChange={(v) => setPred({ ...pred, a: v })} /></div>
            <span className="dash">-</span>
            <div className="center"><Stepper value={pred.b} onChange={(v) => setPred({ ...pred, b: v })} /></div>
          </div>
          {tie && (
            <div className="passsel">
              <div className="lbl">⚠ EMPATE — ¿QUIÉN PASA DE RONDA?</div>
              <div className="opts">
                <button className={"opt" + (pass === "a" ? " on" : "")} onClick={() => setPass("a")}><span className="fl">🇦🇷</span> ARGENTINA</button>
                <button className={"opt" + (pass === "b" ? " on" : "")} onClick={() => setPass("b")}><span className="fl">🇫🇷</span> FRANCIA</button>
              </div>
            </div>
          )}
          <div className="match__timerbar"><span className="lbl">EMPIEZA EN</span><Marcador sec={sec} variant="live" sm /></div>
        </div>

        <FriendPicks title="¿Qué pusieron tus compañeros?" picks={PICKS_OPEN} />

        <div style={{ padding: "4px 16px 16px" }}>
          <Btn block onClick={() => fire({ kind: "ok", title: "PRONÓSTICO GUARDADO", msg: tie ? `Empate ${pred.a}-${pred.b}, pasa ${pass === "a" ? "Argentina" : "Francia"}.` : `Argentina ${pred.a} - ${pred.b} Francia cargado.` })}><span className="ball">⚽</span>Guardar pronóstico</Btn>
        </div>
      </div>
      <BottomNav active="cargar" />
    </div>
  );
}

// ---- VARIANT C — BLOQUEADO (cerrado, no editable) ----
function CargarBloqueado() {
  const sec = useClock(63 * 60 + 12, +1); // en juego, minuto 63
  return (
    <div className="pscreen">
      <div className="topbar">
        <div className="title"><span>⚽</span> CARGAR</div>
        <div className="pts">{ME.pts}</div>
      </div>
      <div className="pscreen__body">
        <div className="fecha-head"><span className="ttl">OCTAVOS · LLAVE 2</span><span className="chip dim">🔒 CERRADO</span></div>

        <div className="match locked-card">
          <div className="match__head"><span className="lk">🔒 BLOQUEADO · EN JUEGO</span><span className="live">● VIVO</span></div>
          <div className="match__teams">
            <div className="team"><span className="flag">🇧🇷</span><span className="nm">BRASIL</span></div>
            <div className="vs">VS</div>
            <div className="team"><span className="flag">🇪🇸</span><span className="nm">ESPAÑA</span></div>
          </div>
          <div className="match__inputs">
            <div className="center"><Stepper value={2} disabled onChange={() => {}} /></div>
            <span className="dash">-</span>
            <div className="center"><Stepper value={1} disabled onChange={() => {}} /></div>
          </div>
          <div className="match__timerbar"><span className="lbl">VA EN EL MINUTO</span><Marcador sec={sec} variant="live" sm /></div>
        </div>

        <div className="lock-banner">
          <span className="ic">🟥</span>
          <span className="tx">FECHA CERRADA<small>El partido ya empezó, no podés editar tu pronóstico. ¡A esperar los goles!</small></span>
        </div>

        <FriendPicks title="Pronósticos del grupo (ya visibles)" picks={PICKS_OPEN} />
      </div>
      <BottomNav active="cargar" />
    </div>
  );
}

// ---- VARIANT D — HISTÓRICO (ya jugado, con análisis) ----
function CargarHistorico() {
  return (
    <div className="pscreen">
      <div className="topbar">
        <div className="title"><span>⚽</span> CARGAR</div>
        <div className="pts">{ME.pts}</div>
      </div>
      <div className="pscreen__body">
        <div className="fecha-head"><span className="ttl">OCTAVOS · FINALIZADO</span><span className="chip ok">✓ JUGADO</span></div>

        <div className="realresult">
          <div className="realresult__head">⏱ RESULTADO FINAL · HACE 2 HS</div>
          <div className="realresult__body">
            <div className="team"><span className="flag" style={{ fontSize: 34 }}>🇦🇷</span><span className="nm">ARGENTINA</span></div>
            <div className="center" style={{ gap: 8 }}><span className="big">2</span><span className="sep">-</span><span className="big">1</span></div>
            <div className="team"><span className="flag" style={{ fontSize: 34 }}>🇫🇷</span><span className="nm">FRANCIA</span></div>
          </div>
        </div>

        <FriendPicks title="Análisis del grupo · quién sumó" picks={PICKS_PLAYED} reveal />

        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--scoreboard-ink)", border: "var(--border) solid var(--border-color)", boxShadow: "var(--shadow-xs)", padding: "10px 12px" }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--grey-300)", lineHeight: 1.4 }}>Le pegaste al <strong style={{ color: "var(--card-yellow)" }}>resultado exacto</strong> y sumaste 5. Solo vos clavaste el 2-1.</p>
          </div>
        </div>
      </div>
      <BottomNav active="cargar" />
    </div>
  );
}

Object.assign(window, { FriendPicks, CargarGrupos, CargarElim, CargarBloqueado, CargarHistorico, PICKS_OPEN, PICKS_PLAYED });

// ---- VARIANT 0 — LISTA DE LA FECHA (todos los partidos) ----
const MATCHDAY = [
  { id: "ml1", round: "LLAVE 1", a: { name: "ARG", flag: "🇦🇷" }, b: { name: "FRA", flag: "🇫🇷" }, sec: 47 * 60, status: "pend", pick: null },
  { id: "ml2", round: "LLAVE 2", a: { name: "BRA", flag: "🇧🇷" }, b: { name: "ESP", flag: "🇪🇸" }, sec: 63 * 60, status: "live", pick: [2, 1] },
  { id: "ml3", round: "LLAVE 3", a: { name: "ING", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, b: { name: "POR", flag: "🇵🇹" }, sec: 26 * 3600, status: "done", pick: [0, 1] },
  { id: "ml4", round: "LLAVE 4", a: { name: "URU", flag: "🇺🇾" }, b: { name: "ALE", flag: "🇩🇪" }, sec: 49 * 3600, status: "pend", pick: null },
];
const STATUS_META = {
  pend: { chip: "warn", txt: "● SIN CARGAR", lbl: "EMPIEZA EN", mv: "live", act: "Cargar", actVar: undefined },
  live: { chip: "live", txt: "🔒 EN JUEGO", lbl: "VA MINUTO", mv: "live", act: "Ver", actVar: "ghost" },
  done: { chip: "ok", txt: "✓ CARGADO", lbl: "EMPIEZA EN", mv: "", act: "Editar", actVar: "sec" },
};

function MatchListRow({ m, fire }) {
  const meta = STATUS_META[m.status];
  const sec = useClock(m.sec, m.status === "live" ? +1 : -1);
  return (
    <div className={"mrow is-" + m.status}>
      <div className="mrow__top">
        <span className="when">OCTAVOS · {m.round}</span>
        <span className={"chip " + meta.chip} style={{ fontSize: 7 }}>{meta.txt}</span>
      </div>
      <div className="mrow__teams">
        <span className="t"><span className="fl">{m.a.flag}</span>{m.a.name}</span>
        {m.pick
          ? <span className="mrow__pick">{m.pick[0]}<span className="sep">-</span>{m.pick[1]}</span>
          : <span className="mrow__pick empty">+ / +</span>}
        <span className="t r">{m.b.name}<span className="fl">{m.b.flag}</span></span>
      </div>
      <div className="mrow__foot">
        <span className="lbl">{meta.lbl}</span>
        <Marcador sec={sec} variant={meta.mv} sm />
        <div className="act">
          <Btn sm variant={meta.actVar} disabled={m.status === "live"}
            onClick={() => fire && fire({ kind: m.status === "done" ? "ok" : "info", title: m.status === "done" ? "EDITANDO" : "VAMOS A CARGAR", msg: `${m.a.name} vs ${m.b.name} — abriendo el partido…` })}>
            {m.status === "live" ? "🔒" : ""}{meta.act}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function CargarLista() {
  const [toastNode, fire] = useToast();
  const pend = MATCHDAY.filter((m) => m.status === "pend").length;
  return (
    <div className="pscreen">
      {toastNode}
      <div className="topbar">
        <div className="title"><span>⚽</span> CARGAR</div>
        <div className="pts">{ME.pts}</div>
      </div>
      <div className="pscreen__body">
        <div className="fecha-head"><span className="ttl">FECHA 5 · OCTAVOS</span><span className="chip warn">{pend} SIN CARGAR</span></div>
        <div className="sec-title" style={{ paddingTop: 0 }}><span>🗓 PARTIDOS DE LA FECHA</span><span className="more">{MATCHDAY.length} EN TOTAL</span></div>
        {MATCHDAY.map((m) => <MatchListRow key={m.id} m={m} fire={fire} />)}
        <div style={{ padding: "4px 16px 16px" }}>
          <Btn block disabled={pend > 0}><span className="ball">⚽</span>{pend > 0 ? `Faltan ${pend} por cargar` : "Confirmar fecha"}</Btn>
        </div>
        <div style={{ padding: "0 16px 8px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--grey-400)" }}>Tocá un partido para cargar o editar tu pronóstico ▸</div>
      </div>
      <BottomNav active="cargar" />
    </div>
  );
}

Object.assign(window, { MATCHDAY, MatchListRow, CargarLista });
