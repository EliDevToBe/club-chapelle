import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";

export class ListPublicCompetitions {
  constructor(private readonly competitions: CompetitionRepository) {}

  public findPublic = async () => this.competitions.findMany();
}
