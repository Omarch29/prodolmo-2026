import type { FdTeamsResponse, FdMatchesResponse } from "./types";

const BASE = "https://api.football-data.org/v4";
const COMPETITION = "WC"; // FIFA World Cup

export type FootballDataClient = {
  fetchTeams: () => Promise<FdTeamsResponse>;
  fetchMatches: () => Promise<FdMatchesResponse>;
};

/**
 * Cliente de football-data.org. Recibe el token explícito (no lee env), así se
 * puede usar tanto desde el server (route) como desde un script de Node.
 */
export function createFootballDataClient(token: string): FootballDataClient {
  async function fd<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "X-Auth-Token": token },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`football-data ${path}: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  return {
    fetchTeams: () => fd<FdTeamsResponse>(`/competitions/${COMPETITION}/teams`),
    fetchMatches: () => fd<FdMatchesResponse>(`/competitions/${COMPETITION}/matches`),
  };
}
