// ============================================================
// PRODE Mundial — Canvas assembly: all screens as mockups
// ============================================================
const PH = 390; // phone width

function Frame({ children }) { return <div className="prode-screen" style={{ width: "100%", height: "100%" }}>{children}</div>; }

function Canvas() {
  return (
    <DesignCanvas>
      <DCSection id="dash-m" title="01 · Dashboard (mobile)" subtitle="Pantalla de inicio — 3 variantes. Contadores en vivo, mensajes contextuales.">
        <DCArtboard id="d-feed" label="A · Feed (recomendada)" width={PH} height={1016} style={{ border: "6px solid var(--border-color)" }}><Frame><DashboardFeed /></Frame></DCArtboard>
        <DCArtboard id="d-hud" label="B · HUD — foco en próximo partido" width={PH} height={684} style={{ border: "6px solid var(--border-color)" }}><Frame><DashboardHUD /></Frame></DCArtboard>
        <DCArtboard id="d-mis" label="C · Misiones (gamificada)" width={PH} height={650} style={{ border: "6px solid var(--border-color)" }}><Frame><DashboardMisiones /></Frame></DCArtboard>
      </DCSection>

      <DCSection id="dash-d" title="01 · Dashboard (desktop)" subtitle="Misma info, nav lateral izquierda estilo menú de juego.">
        <DCArtboard id="d-desk" label="Desktop · 1280px" width={1280} height={864} style={{ border: "6px solid var(--border-color)" }}><Frame><DesktopDashboard /></Frame></DCArtboard>
      </DCSection>

      <DCSection id="cargar" title="02 · Cargar Partido" subtitle="Lista de la fecha → cargás cada partido. Steppers +/-, contador marcador, picks del grupo.">
        <DCArtboard id="c-list" label="Lista de la fecha · todos los partidos" width={PH} height={760} style={{ border: "6px solid var(--border-color)" }}><Frame><CargarLista /></Frame></DCArtboard>
        <DCArtboard id="c-gru" label="Grupos · editable" width={PH} height={758} style={{ border: "6px solid var(--border-color)" }}><Frame><CargarGrupos /></Frame></DCArtboard>
        <DCArtboard id="c-eli" label="Eliminación · empate → quién pasa" width={PH} height={852} style={{ border: "6px solid var(--border-color)" }}><Frame><CargarElim /></Frame></DCArtboard>
        <DCArtboard id="c-blo" label="Bloqueado · cerrado" width={PH} height={764} style={{ border: "6px solid var(--border-color)" }}><Frame><CargarBloqueado /></Frame></DCArtboard>
        <DCArtboard id="c-his" label="Histórico · ya jugado + análisis" width={PH} height={708} style={{ border: "6px solid var(--border-color)" }}><Frame><CargarHistorico /></Frame></DCArtboard>
      </DCSection>

      <DCSection id="tabla" title="03 · Tabla de Posiciones" subtitle="Scoreboard del grupo. Tocá un jugador para abrir su desglose por ronda.">
        <DCArtboard id="t-lb" label="Ranking · tocá un jugador" width={PH} height={700} style={{ border: "6px solid var(--border-color)" }}><Frame><TablaScreen /></Frame></DCArtboard>
        <DCArtboard id="t-det" label="Detalle por ronda (% del total)" width={PH} height={768} style={{ border: "6px solid var(--border-color)" }}><Frame><DetailScreen /></Frame></DCArtboard>
      </DCSection>

      <DCSection id="sim" title="04 · Simulador" subtitle="Herramienta aparte: simulá los partidos que quedan y mirá qué EQUIPO sale campeón del Mundial.">
        <DCArtboard id="s-sim" label="Simulador de campeón · bracket del Mundial" width={PH} height={1712} style={{ border: "6px solid var(--border-color)" }}><Frame><SimuladorScreen /></Frame></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Canvas />);
