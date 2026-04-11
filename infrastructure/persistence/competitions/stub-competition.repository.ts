import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";

export class StubCompetitionRepository implements CompetitionRepository {
  findPublic = async () => [];
}
