import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";

export class ListCompetitions {
  constructor(private readonly competitions: CompetitionRepository) {}

  public findMany = async () => this.competitions.findMany();
}
