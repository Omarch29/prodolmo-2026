// ============================================================
// PRODE Mundial — Screen 1: DASHBOARD (mobile) + variations
// ============================================================

// shared: dashboard identity header
function HeroHead({ compact }) {
  return (
    <div className="hero-head" style={compact ? { padding: "12px 16px" } : null}>
      <Avatar emoji={ME.emoji} bg={ME.bg} size={compact ? 44 : 56} />
      <div className="who">
        <div className="hi">HOLA, PIBE 👋</div>
        <div className="nm">{ME.name.toUpperCase()}</div>
        {!compact && <div className="grp">Grupo "Los Pibes" · 6 jugadores</div>}
      </div>
      <div className="stat-chip"><span className="c">PUNTOS</span><span className="v">{ME.pts}</span></div>
      <div className="stat-chip rank"><span className="c">PUESTO</span><span className="v">#{ME.rank}</span></div>
    </div>
  );
}

// shared: próximo partido hero with live countdown
function NextHero({ big }) {
  const sec = useClock(UPCOMING[0].sec, -1);
  const m = UPCOMING[0];
  return (
    <div className="next-hero">
      <div className="next-hero__head"><span>⚽ PRÓXIMO PARTIDO</span><span>{m.round}</span></div>
      <div className="next-hero__body">
        <div className="team"><span className="flag">{m.a.flag}</span><span className="nm">{m.a.name}</span></div>
        <div className="vs">VS</div>
        <div className="team"><span className="flag">{m.b.flag}</span><span className="nm">{m.b.name}</span></div>
      </div>
      <div className="next-hero__foot">
        <span className="lbl">EMPIEZA EN</span>
        <Marcador sec={sec} variant="live" sm={!big} />
      </div>
    </div>
  );
}

// ---- notification cards (Feed style) ----
function NotifPend({ fire }) {
  const sec = useClock(47 * 60, -1);
  return (
    <div className="ncard pend">
      <div className="ncard__head"><span className="ic">⏳</span><span className="t">PENDIENTE</span><span className="when">FECHA DE OCTAVOS</span></div>
      <div className="ncard__body">
        <p>Te faltan cargar <span className="hl">3 partidos</span>. El próximo empieza pronto: tenés <span className="hl">menos de una hora</span> para cargar tu resultado.</p>
      </div>
      <div className="ncard__foot">
        <Btn sm onClick={() => fire && fire({ kind: "info", title: "VAMOS A CARGAR", msg: "Abriendo tus partidos pendientes…" })}><span className="ball">⚽</span>Cargar ahora</Btn>
        <div className="timer"><Marcador sec={sec} variant="live" sm /></div>
      </div>
    </div>
  );
}

function NotifWin() {
  return (
    <div className="ncard win">
      <div className="ncard__head"><span className="ic">🎯</span><span className="t">¡ENHORABUENA!</span><span className="when">HACE 2 HS</span></div>
      <div className="ncard__body">
        <p style={{ marginBottom: 12 }}>Conseguiste puntos por <span className="hl">Argentina 2 - 1 Francia</span>. ¡Le pegaste al resultado exacto!</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="scoreline"><span className="nm">🇦🇷 ARG</span><span className="sc">2</span><span style={{ color: "var(--grey-400)" }}>-</span><span className="sc">1</span><span className="nm">FRA 🇫🇷</span></span>
          <span className="pts-pop">+5</span>
        </div>
      </div>
    </div>
  );
}

function NotifRankUp() {
  return (
    <div className="ncard rank">
      <div className="ncard__head"><span className="ic">📣</span><span className="t">MOVIMIENTO EN LA TABLA</span><span className="when">FECHA 4</span></div>
      <div className="ncard__body">
        <div className="rank-move">
          <Avatar emoji="🧢" bg="var(--card-yellow)" size={38} />
          <span className="arrow up">▲</span>
          <p style={{ flex: 1 }}><span className="pos">Julián</span> se puso a la cabeza 👑. Te pasó por 14 puntos, ¡a no aflojar!</p>
        </div>
      </div>
    </div>
  );
}

function NotifFail() {
  return (
    <div className="ncard fail">
      <div className="ncard__head"><span className="ic">🧊</span><span className="t">MOVIMIENTO EN LA TABLA</span><span className="when">FECHA 4</span></div>
      <div className="ncard__body">
        <div className="rank-move">
          <Avatar emoji="🧔" bg="var(--sky-blue)" size={38} />
          <span className="arrow down">▼</span>
          <p style={{ flex: 1 }}><strong>Carlos</strong> no adivinó nada en esta fecha 😬. Cayó al último puesto del grupo.</p>
        </div>
      </div>
    </div>
  );
}

// ---- VARIATION A — Feed (default) ----
function DashboardFeed() {
  const [toastNode, fire] = useToast();
  return (
    <div className="pscreen">
      {toastNode}
      <HeroHead />
      <div className="pscreen__body">
        <NextHero />
        <div className="sec-title"><span>📬 TUS MENSAJES</span><span className="more">VER TODO ▸</span></div>
        <NotifPend fire={fire} />
        <NotifWin />
        <NotifRankUp />
        <NotifFail />
      </div>
      <BottomNav active="inicio" />
    </div>
  );
}

// ---- VARIATION B — HUD focus (big marcador hero leads) ----
function DashboardHUD() {
  const sec = useClock(UPCOMING[0].sec, -1);
  const m = UPCOMING[0];
  return (
    <div className="pscreen">
      <HeroHead compact />
      <div className="pscreen__body" style={{ gap: 14 }}>
        {/* big focus block */}
        <div className="next-hero" style={{ marginBottom: 2 }}>
          <div className="next-hero__head"><span>⚽ PRÓXIMO · {m.round}</span><span style={{ color: "var(--card-red)" }}>● CARGÁ YA</span></div>
          <div className="next-hero__body" style={{ padding: "20px 12px 10px" }}>
            <div className="team"><span className="flag" style={{ fontSize: 44 }}>{m.a.flag}</span><span className="nm">{m.a.name}</span></div>
            <div className="vs" style={{ fontSize: 16 }}>VS</div>
            <div className="team"><span className="flag" style={{ fontSize: 44 }}>{m.b.flag}</span><span className="nm">{m.b.name}</span></div>
          </div>
          <div className="center" style={{ paddingBottom: 14 }}><Marcador sec={sec} variant="live" /></div>
          <div style={{ padding: "0 12px 14px" }}><Btn block sm><span className="ball">⚽</span>Cargar pronóstico</Btn></div>
        </div>
        <div className="sec-title"><span>📬 ACTIVIDAD</span><span className="more">VER TODO ▸</span></div>
        {/* condensed message strips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px" }}>
          <CompactMsg ic="🎯" tone="win" big="+5" txt={<><b>Argentina 2-1 Francia</b> — resultado exacto.</>} />
          <CompactMsg ic="👑" tone="rank" txt={<><b>Julián</b> se puso a la cabeza del grupo.</>} />
          <CompactMsg ic="😬" tone="fail" txt={<><b>Carlos</b> no adivinó nada en esta fecha.</>} />
          <CompactMsg ic="⏳" tone="pend" txt={<>Te faltan <b>3 partidos</b> por cargar.</>} />
        </div>
      </div>
      <BottomNav active="inicio" />
    </div>
  );
}

function CompactMsg({ ic, tone, txt, big }) {
  const barColor = { win: "var(--pitch-green)", rank: "var(--sky-blue)", fail: "var(--card-red)", pend: "var(--goal-orange)" }[tone];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--scoreboard-black)", border: "var(--border-thin) solid var(--border-color)", boxShadow: "var(--shadow-xs)", padding: "8px 10px" }}>
      <span style={{ width: 5, alignSelf: "stretch", background: barColor }}></span>
      <span style={{ fontSize: 18 }}>{ic}</span>
      <p style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--line-white)", lineHeight: 1.35 }}>{txt}</p>
      {big && <span className="pts-pop" style={{ fontSize: 18 }}>{big}</span>}
    </div>
  );
}

// ---- VARIATION C — Misiones (game-quest framing) ----
function DashboardMisiones() {
  const sec = useClock(47 * 60, -1);
  return (
    <div className="pscreen">
      <HeroHead />
      <div className="pscreen__body" style={{ gap: 12 }}>
        <div className="sec-title"><span>🎮 MISIONES DE LA FECHA</span><span className="more">2 / 5</span></div>
        <Quest accent="var(--goal-orange)" ic="⏳" state="ACTIVA" title="CARGÁ TUS OCTAVOS" desc="Te faltan 3 partidos. Cerrá antes del cierre.">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Marcador sec={sec} variant="live" sm />
            <Btn sm style={{ marginLeft: "auto" }}><span className="ball">⚽</span>Ir</Btn>
          </div>
        </Quest>
        <Quest accent="var(--pitch-green)" ic="🎯" state="COMPLETADA" title="RESULTADO EXACTO" desc="Argentina 2 - 1 Francia. ¡Le pegaste!" reward="+5" done />
        <Quest accent="var(--sky-blue)" ic="👑" state="SOCIAL" title="JULIÁN TOMÓ LA PUNTA" desc="Se puso a la cabeza del grupo, +14 sobre vos." />
        <Quest accent="var(--scoreboard-slate)" ic="😬" state="SOCIAL" title="CARLOS EN CERO" desc="No adivinó nada en esta fecha. Último puesto." />
      </div>
      <BottomNav active="inicio" />
    </div>
  );
}

function Quest({ accent, ic, state, title, desc, reward, done, children }) {
  return (
    <div style={{ margin: "0 16px", background: "var(--line-white)", border: "var(--border-thick) solid var(--border-color)", boxShadow: "var(--shadow)", display: "flex" }}>
      <div style={{ width: 8, background: accent, flex: "0 0 auto" }}></div>
      <div style={{ flex: 1, padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>{ic}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 8, letterSpacing: 1, color: "var(--scoreboard-ink)" }}>{title}</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontSize: 6, letterSpacing: 1, color: "#fff", background: accent, padding: "3px 6px", border: "var(--border-thin) solid var(--border-color)" }}>{done ? "✓ " : ""}{state}</span>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--scoreboard-ink)", lineHeight: 1.4, marginBottom: children || reward ? 10 : 0 }}>{desc}</p>
        {reward && <div style={{ display: "flex", justifyContent: "flex-end" }}><span className="pts-pop">{reward}</span></div>}
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { HeroHead, NextHero, DashboardFeed, DashboardHUD, DashboardMisiones, CompactMsg, Quest, NotifPend, NotifWin, NotifRankUp, NotifFail });
