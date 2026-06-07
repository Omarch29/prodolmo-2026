import "server-only";
import { serverEnv } from "@/lib/env";
import { createFootballDataClient, type FootballDataClient } from "./client-core";

/** Cliente de football-data.org leyendo el token de env (solo servidor). */
export function getFootballDataClient(): FootballDataClient {
  const token = serverEnv().FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error("FOOTBALL_DATA_TOKEN no configurado.");
  return createFootballDataClient(token);
}
