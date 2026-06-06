/* @ds-bundle: {"format":3,"namespace":"PRODEPixelDesignSystem_625e71","components":[],"sourceHashes":{"ui_kits/prode-app/App.jsx":"27eeee8bebaa","ui_kits/prode-app/components.jsx":"d3d55877e643","ui_kits/prode-app/screens.jsx":"0e1ea22d390f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PRODEPixelDesignSystem_625e71 = window.PRODEPixelDesignSystem_625e71 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/prode-app/App.jsx
try { (() => {
// PRODE app UI kit — App shell wiring screens, nav, toast, modal
const {
  useState: useAppState
} = React;
const MATCHES = [{
  id: 1,
  group: "GRUPO C",
  time: "18:00",
  a: {
    name: "ARG",
    flag: "🇦🇷"
  },
  b: {
    name: "BRA",
    flag: "🇧🇷"
  }
}, {
  id: 2,
  group: "GRUPO C",
  time: "21:00",
  a: {
    name: "FRA",
    flag: "🇫🇷"
  },
  b: {
    name: "ESP",
    flag: "🇪🇸"
  }
}, {
  id: 3,
  group: "GRUPO D",
  time: "15:00",
  a: {
    name: "ENG",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
  },
  b: {
    name: "POR",
    flag: "🇵🇹"
  }
}, {
  id: 4,
  group: "GRUPO D",
  time: "18:00",
  a: {
    name: "URU",
    flag: "🇺🇾"
  },
  b: {
    name: "GER",
    flag: "🇩🇪"
  }
}];
const TABLE = [{
  name: "Leo",
  emoji: "🐐",
  bg: "var(--card-yellow)",
  pts: 1280
}, {
  name: "Caro",
  emoji: "👩",
  bg: "var(--sky-blue)",
  pts: 1175
}, {
  name: "Diego",
  emoji: "🧔",
  bg: "var(--goal-orange)",
  pts: 1090
}, {
  name: "Vos",
  emoji: "🧑‍🦱",
  bg: "var(--pitch-green-light)",
  pts: 980,
  me: true
}, {
  name: "Sofi",
  emoji: "👧",
  bg: "var(--card-red)",
  pts: 845
}];
function App() {
  const [screen, setScreen] = useAppState("play");
  const [preds, setPreds] = useAppState(MATCHES.map(() => ({
    a: 0,
    b: 0
  })));
  const [modal, setModal] = useAppState(false);
  const [toast, setToast] = useAppState(null);
  function fireToast(t) {
    setToast(t);
    setTimeout(() => setToast(null), 2600);
  }
  function confirmFecha() {
    setModal(false);
    fireToast({
      kind: "ok",
      title: "FECHA CONFIRMADA",
      msg: "Tus 4 pronósticos quedaron cargados."
    });
    setTimeout(() => fireToast({
      kind: "goal",
      title: "¡GOOOL!",
      msg: "Arrancó el partido. ¡Suerte!"
    }), 1400);
  }
  const me = {
    name: "Vos",
    emoji: "🧑‍🦱",
    bg: "var(--pitch-green-light)",
    pts: 980
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "phone"
  }, /*#__PURE__*/React.createElement(TopBar, {
    points: 980
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast-wrap"
  }, /*#__PURE__*/React.createElement(Toast, toast)), screen === "play" && /*#__PURE__*/React.createElement(PlayScreen, {
    matches: MATCHES,
    preds: preds,
    setPreds: setPreds,
    onConfirm: () => setModal(true)
  }), screen === "fechas" && /*#__PURE__*/React.createElement(PlayScreen, {
    matches: MATCHES,
    preds: preds,
    setPreds: setPreds,
    onConfirm: () => setModal(true)
  }), screen === "table" && /*#__PURE__*/React.createElement(TableScreen, {
    rows: TABLE
  }), screen === "profile" && /*#__PURE__*/React.createElement(ProfileScreen, {
    player: me
  }), /*#__PURE__*/React.createElement(BottomNav, {
    active: screen,
    onNav: setScreen
  }), modal && /*#__PURE__*/React.createElement(Modal, {
    title: "CERRAR FECHA",
    onClose: () => setModal(false),
    onConfirm: confirmFecha,
    confirmLabel: "Confirmar"
  }, "Una vez confirmada la fecha no vas a poder cambiar tus pron\xF3sticos. \xBFCerrar y enviar tus 4 partidos?"));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/prode-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/prode-app/components.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// PRODE app UI kit — shared components
const {
  useState
} = React;
function Avatar({
  emoji,
  bg,
  size = 44
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "avatar",
    style: {
      width: size,
      height: size,
      background: bg,
      fontSize: size * 0.5
    }
  }, emoji);
}
function Stepper({
  value,
  onChange,
  min = 0,
  max = 20
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stepper"
  }, /*#__PURE__*/React.createElement("button", {
    className: "minus",
    onClick: () => onChange(Math.max(min, value - 1))
  }, "\u2013"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, value), /*#__PURE__*/React.createElement("button", {
    className: "plus",
    onClick: () => onChange(Math.min(max, value + 1))
  }, "+"));
}
function Btn({
  children,
  variant,
  block,
  ...rest
}) {
  const cls = ["btn", variant === "sec" ? "btn--sec" : "", block ? "btn--block" : ""].join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls
  }, rest), children);
}
function TopBar({
  points
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, /*#__PURE__*/React.createElement("span", null, "\u26BD"), " PRODE"), /*#__PURE__*/React.createElement("div", {
    className: "pts"
  }, points));
}
function BottomNav({
  active,
  onNav
}) {
  const items = [{
    id: "play",
    ic: "⚽",
    l: "JUGAR"
  }, {
    id: "fechas",
    ic: "📋",
    l: "FECHAS"
  }, {
    id: "table",
    ic: "🏆",
    l: "TABLA"
  }, {
    id: "profile",
    ic: "👤",
    l: "PERFIL"
  }];
  return /*#__PURE__*/React.createElement("nav", {
    className: "bnav"
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    className: "bnav__item" + (active === it.id ? " a" : ""),
    onClick: () => onNav(it.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, it.ic), /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, it.l))));
}
function Toast({
  kind,
  title,
  msg
}) {
  const ic = {
    ok: "✅",
    goal: "⚽",
    err: "🟥"
  }[kind] || "✅";
  return /*#__PURE__*/React.createElement("div", {
    className: "toast " + kind
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, ic), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "tm"
  }, msg)));
}
function Modal({
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__head"
  }, /*#__PURE__*/React.createElement("span", null, "\u26A0 ", title), /*#__PURE__*/React.createElement("span", {
    className: "x",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal__body"
  }, children), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "sec",
    block: true,
    onClick: onClose
  }, "Volver"), /*#__PURE__*/React.createElement(Btn, {
    block: true,
    onClick: onConfirm
  }, /*#__PURE__*/React.createElement("span", {
    className: "ball"
  }, "\u26BD"), confirmLabel || "Confirmar"))));
}
Object.assign(window, {
  Avatar,
  Stepper,
  Btn,
  TopBar,
  BottomNav,
  Toast,
  Modal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/prode-app/components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/prode-app/screens.jsx
try { (() => {
// PRODE app UI kit — screens
const {
  useState: useStateS
} = React;
function MatchRow({
  m,
  pred,
  onPred,
  locked
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "match" + (locked ? " locked" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "match__head"
  }, /*#__PURE__*/React.createElement("span", null, m.group, " \xB7 ", m.time), locked ? /*#__PURE__*/React.createElement("span", {
    className: "ok"
  }, "\u2713 CARGADO") : /*#__PURE__*/React.createElement("span", null, "\u23F1 HOY")), /*#__PURE__*/React.createElement("div", {
    className: "match__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "team"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flag"
  }, m.a.flag), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, m.a.name)), /*#__PURE__*/React.createElement("div", {
    className: "vs"
  }, "VS"), /*#__PURE__*/React.createElement("div", {
    className: "team"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flag"
  }, m.b.flag), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, m.b.name))), !locked && /*#__PURE__*/React.createElement("div", {
    className: "match__body",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    value: pred.a,
    onChange: v => onPred({
      ...pred,
      a: v
    })
  })), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    value: pred.b,
    onChange: v => onPred({
      ...pred,
      b: v
    })
  }))), locked && /*#__PURE__*/React.createElement("div", {
    className: "match__body",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 36
    }
  }, pred.a), /*#__PURE__*/React.createElement("div", {
    className: "vs"
  }, "-"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 36
    }
  }, pred.b)));
}
function PlayScreen({
  matches,
  preds,
  setPreds,
  onConfirm
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fecha-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, "FECHA 2 \xB7 GRUPOS"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "CIERRA EN 3H")), matches.map((m, i) => /*#__PURE__*/React.createElement(MatchRow, {
    key: m.id,
    m: m,
    pred: preds[i],
    locked: m.locked,
    onPred: p => setPreds(preds.map((x, j) => j === i ? p : x))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 20px"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    block: true,
    onClick: onConfirm
  }, /*#__PURE__*/React.createElement("span", {
    className: "ball"
  }, "\u26BD"), "Confirmar Fecha")));
}
function TableScreen({
  rows
}) {
  const medal = ["g", "s", "b"];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-title"
  }, "\uD83C\uDFC6 TABLA DEL GRUPO \"LOS PIBES\""), rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.name,
    className: "lb-row " + (medal[i] || "") + (r.me ? " me" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "rank"
  }, i + 1), /*#__PURE__*/React.createElement(Avatar, {
    emoji: r.emoji,
    bg: r.bg,
    size: 38
  }), /*#__PURE__*/React.createElement("span", {
    className: "pname"
  }, r.name), /*#__PURE__*/React.createElement("span", {
    className: "pts-badge",
    style: i > 2 ? {
      background: "var(--line-white-dim)"
    } : {}
  }, r.pts))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 16px 20px"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "sec",
    block: true
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC65"), "Invitar Amigos")));
}
function ProfileScreen({
  player
}) {
  const ach = [{
    ic: "🎯",
    nm: "EXACTO X5",
    on: true
  }, {
    ic: "🔥",
    nm: "RACHA 7",
    on: true
  }, {
    ic: "⚽",
    nm: "GOLEADOR",
    on: true
  }, {
    ic: "🧤",
    nm: "VALLA INV.",
    on: false
  }, {
    ic: "👑",
    nm: "LÍDER",
    on: false
  }, {
    ic: "💎",
    nm: "PLENO",
    on: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "profile-hero"
  }, /*#__PURE__*/React.createElement(Avatar, {
    emoji: player.emoji,
    bg: player.bg,
    size: 88
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 14,
      color: "var(--line-white)",
      marginTop: 14
    }
  }, player.name), /*#__PURE__*/React.createElement("div", {
    className: "scoreboard"
  }, /*#__PURE__*/React.createElement("span", {
    className: "c"
  }, "PUNTOS TOTALES"), /*#__PURE__*/React.createElement("span", {
    className: "p"
  }, player.pts))), /*#__PURE__*/React.createElement("div", {
    className: "sec-title"
  }, "\uD83C\uDFC5 LOGROS"), /*#__PURE__*/React.createElement("div", {
    className: "badge-grid"
  }, ach.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.nm,
    className: "ach " + (a.on ? "on" : "off")
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, a.ic), /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, a.nm)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 16px"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "sec",
    block: true
  }, "\u2699\uFE0F Configuraci\xF3n")));
}
Object.assign(window, {
  PlayScreen,
  TableScreen,
  ProfileScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/prode-app/screens.jsx", error: String((e && e.message) || e) }); }

})();
