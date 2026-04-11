import type { Competition } from "~~/domain/competitions/competition";

export interface CompetitionRepository {
  findAll: () => Promise<Competition[]>;
}
