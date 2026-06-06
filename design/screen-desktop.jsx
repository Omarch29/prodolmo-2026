// ============================================================
// PRODE Mundial — DESKTOP Dashboard (sidebar nav)
// Reuses the mobile notification/next-match components.
// ============================================================

function MiniStanding() {
  return (
    <div className="proj" style={{ borderColor: "var(--border-color)" }}>
      <div className="proj__head" style={{ background: "var(--scoreboard-ink)", color: "var(--card-yellow)" }}>🏆 TABLA · LOS PIBES <span style={{ marginLeft: "auto", fontSize: 7, color: "var(--grey-300)" }}>FECHA 4</span></div>
      {TABLE.map((r, i) => (
        <div key={r.name} className={"proj__row" + (r.me ? " me" : "")}>
          <span className="rk">{i + 1}</span>
          <Avatar emoji={r.emoji} bg={r.bg} size={26} />
          <span className="nm">{r.name}{i === 0 ? " 👑" : ""}</span>
          <span className="pt">{r.pts}</span>
          <span className={"mv " + deltaCls(r.delta)}>{deltaTxt(r.delta)}</span>
        </div>
      ))}
    </div>
  );
}

function DesktopDashboard() {
  const sec = useClock(UPCOMING[0].sec, -1);
  const [toastNode, fire] = useToast();
  const m = UPCOMING[0];
  return (
    <div className="desktop" style={{ position: "relative" }}>
      {toastNode}
      <Sidebar active="inicio" me={ME} />
      <div className="dmain">
        <div className="dtop">
          <div className="h">¡HOLA, VOS! 👋<small>Grupo "Los Pibes" · Octavos de final · te faltan 3 partidos por cargar</small></div>
          <div className="stats">
            <div className="stat-chip"><span className="c">PUNTOS</span><span className="v">{ME.pts}</span></div>
            <div className="stat-chip rank"><span className="c">PUESTO</span><span className="v">#{ME.rank}</span></div>
          </div>
        </div>

        <div className="dcontent">
          {/* left column — próximo partido + mensajes */}
          <div className="dcol">
            <div className="dcard-title">⚽ PRÓXIMO PARTIDO</div>
            <div className="next-hero">
              <div className="next-hero__head"><span>OCTAVOS · LLAVE 1 · HOY 21:00</span><span style={{ color: "var(--card-red)" }}>● CARGÁ YA</span></div>
              <div className="next-hero__body" style={{ padding: "22px 16px 12px" }}>
                <div className="team"><span className="flag" style={{ fontSize: 48 }}>{m.a.flag}</span><span className="nm">{m.a.name}</span></div>
                <div className="vs" style={{ fontSize: 18 }}>VS</div>
                <div className="team"><span className="flag" style={{ fontSize: 48 }}>{m.b.flag}</span><span className="nm">{m.b.name}</span></div>
              </div>
              <div className="next-hero__foot" style={{ paddingBottom: 16 }}>
                <span className="lbl">EMPIEZA EN</span>
                <Marcador sec={sec} variant="live" />
                <Btn sm onClick={() => fire({ kind: "info", title: "VAMOS A CARGAR", msg: "Abriendo tus partidos pendientes…" })}><span className="ball">⚽</span>Cargar</Btn>
              </div>
            </div>

            <div className="dcard-title" style={{ marginTop: 8 }}>📬 TUS MENSAJES</div>
            <NotifPend fire={fire} />
            <NotifWin />
          </div>

          {/* right column — tabla + actividad social */}
          <div className="dcol">
            <div className="dcard-title">📊 CÓMO VA LA TABLA</div>
            <MiniStanding />
            <div className="dcard-title" style={{ marginTop: 8 }}>📣 ACTIVIDAD</div>
            <NotifRankUp />
            <NotifFail />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MiniStanding, DesktopDashboard });
