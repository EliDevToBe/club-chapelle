import type { Competition } from "~~/domain/competitions/competition";

export interface CompetitionRepository {
  findPublic: () => Promise<Competition[]>;
}
