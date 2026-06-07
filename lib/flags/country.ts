/**
 * Bandera (emoji) a partir del nombre de país en inglés (como lo da
 * football-data en la nacionalidad de los árbitros). Devuelve null si no se
 * reconoce, para mostrar solo el texto. Fácil de extender.
 */

// Subdivisiones con emoji propio.
const SPECIAL: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

// Nombre (inglés) -> ISO 3166-1 alpha-2.
const ISO2: Record<string, string> = {
  Argentina: "AR", Brazil: "BR", Uruguay: "UY", Paraguay: "PY", Chile: "CL",
  Colombia: "CO", Peru: "PE", Ecuador: "EC", Bolivia: "BO", Venezuela: "VE",
  Mexico: "MX", "United States": "US", USA: "US", Canada: "CA", "Costa Rica": "CR",
  Honduras: "HN", Panama: "PA", Jamaica: "JM", Guatemala: "GT", "El Salvador": "SV",
  Spain: "ES", Italy: "IT", France: "FR", Germany: "DE", Netherlands: "NL",
  Portugal: "PT", Belgium: "BE", Croatia: "HR", Switzerland: "CH", Poland: "PL",
  Austria: "AT", Sweden: "SE", Norway: "NO", Denmark: "DK", Turkey: "TR",
  "Türkiye": "TR", Greece: "GR", Romania: "RO", Serbia: "RS", Russia: "RU",
  Ukraine: "UA", Czechia: "CZ", "Czech Republic": "CZ", Hungary: "HU", Ireland: "IE",
  Slovenia: "SI", Slovakia: "SK", Bulgaria: "BG", Iceland: "IS", Finland: "FI",
  Morocco: "MA", Egypt: "EG", Algeria: "DZ", Tunisia: "TN", Senegal: "SN",
  Nigeria: "NG", Cameroon: "CM", Ghana: "GH", "Ivory Coast": "CI", "Côte d'Ivoire": "CI",
  "South Africa": "ZA", Gambia: "GM", Mali: "ML", Zambia: "ZM", Kenya: "KE",
  Japan: "JP", "South Korea": "KR", "Korea Republic": "KR", "Saudi Arabia": "SA",
  Iran: "IR", Iraq: "IQ", Qatar: "QA", "United Arab Emirates": "AE", Uzbekistan: "UZ",
  Australia: "AU", "New Zealand": "NZ", China: "CN", India: "IN", Jordan: "JO",
  Lebanon: "LB", Bahrain: "BH", Kuwait: "KW", "Hong Kong": "HK",
};

function emojiFromIso(iso: string): string {
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export function countryFlag(name: string | null | undefined): string | null {
  if (!name) return null;
  const n = name.trim();
  if (SPECIAL[n]) return SPECIAL[n];
  const iso = ISO2[n];
  return iso ? emojiFromIso(iso) : null;
}
