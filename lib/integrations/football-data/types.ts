/** Subconjunto de la respuesta de football-data.org v4 que usamos. */

export type FdTeam = {
  id: number;
  name: string;
  tla: string | null; // código de 3 letras (ARG, BRA...)
  crest: string | null; // URL del escudo/bandera
};

export type FdTeamsResponse = { teams: FdTeam[] };

export type FdMatchTeam = {
  id: number | null;
  name: string | null;
  tla: string | null;
};

export type FdMatch = {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | ...
  stage: string; // GROUP_STAGE | LAST_16 | QUARTER_FINALS | ...
  group: string | null; // "GROUP A" | null
  homeTeam: FdMatchTeam;
  awayTeam: FdMatchTeam;
  score: { fullTime: { home: number | null; away: number | null } };
};

export type FdMatchesResponse = { matches: FdMatch[] };
