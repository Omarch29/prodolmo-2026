/**
 * Bandera (emoji) a partir del código FIFA de la selección (TLA de 3 letras,
 * ej. MEX, RSA). Se usa donde no se puede renderizar el escudo (texto plano,
 * como el título del evento de Google Calendar). Devuelve "" si no se reconoce.
 */

// Subdivisiones del Reino Unido con emoji propio.
const SPECIAL: Record<string, string> = {
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

// Código FIFA -> ISO 3166-1 alpha-2.
const ISO2: Record<string, string> = {
  // CONMEBOL
  ARG: "AR", BRA: "BR", URU: "UY", PAR: "PY", CHI: "CL", COL: "CO", PER: "PE",
  ECU: "EC", BOL: "BO", VEN: "VE",
  // CONCACAF
  MEX: "MX", USA: "US", CAN: "CA", CRC: "CR", HON: "HN", PAN: "PA", JAM: "JM",
  SLV: "SV", GUA: "GT", HAI: "HT", TRI: "TT", CUW: "CW", SUR: "SR", NCA: "NI",
  // UEFA
  ESP: "ES", FRA: "FR", GER: "DE", POR: "PT", NED: "NL", BEL: "BE", ITA: "IT",
  CRO: "HR", SUI: "CH", POL: "PL", AUT: "AT", SWE: "SE", NOR: "NO", DEN: "DK",
  TUR: "TR", GRE: "GR", ROU: "RO", SRB: "RS", UKR: "UA", CZE: "CZ", HUN: "HU",
  IRL: "IE", SVN: "SI", SVK: "SK", RUS: "RU", FIN: "FI", ISL: "IS", BUL: "BG",
  ALB: "AL", BIH: "BA", MKD: "MK", NMK: "MK", GEO: "GE", MNE: "ME", LUX: "LU",
  NIR: "GB", ARM: "AM", AZE: "AZ", ISR: "IL", BLR: "BY", KAZ: "KZ", CYP: "CY",
  // CAF
  MAR: "MA", EGY: "EG", ALG: "DZ", TUN: "TN", SEN: "SN", NGA: "NG", CMR: "CM",
  GHA: "GH", CIV: "CI", RSA: "ZA", MLI: "ML", BFA: "BF", COD: "CD", TOG: "TG",
  GUI: "GN", CPV: "CV", ANG: "AO", ZAM: "ZM", KEN: "KE", GAB: "GA", BEN: "BJ",
  MTN: "MR", GAM: "GM", EQG: "GQ", UGA: "UG", MOZ: "MZ", MAD: "MG", NAM: "NA",
  // AFC
  JPN: "JP", KOR: "KR", KSA: "SA", IRN: "IR", IRQ: "IQ", QAT: "QA", UAE: "AE",
  UZB: "UZ", AUS: "AU", JOR: "JO", OMA: "OM", BHR: "BH", KUW: "KW", CHN: "CN",
  IND: "IN", THA: "TH", VIE: "VN", SYR: "SY", LBN: "LB", PLE: "PS", PRK: "KP",
  TKM: "TM", KGZ: "KG", IDN: "ID", MAS: "MY",
  // OFC
  NZL: "NZ", FIJ: "FJ", SOL: "SB", NCL: "NC", TAH: "PF", VAN: "VU", PNG: "PG",
};

function emojiFromIso(iso: string): string {
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

/** Emoji de bandera para un código FIFA. "" si no se reconoce. */
export function flagEmojiForCode(code: string | null | undefined): string {
  if (!code) return "";
  const c = code.toUpperCase();
  if (SPECIAL[c]) return SPECIAL[c];
  const iso = ISO2[c];
  return iso ? emojiFromIso(iso) : "";
}
