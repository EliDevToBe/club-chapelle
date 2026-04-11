import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";

export class ListPublicCompetitions {
  constructor(private readonly competitions: CompetitionRepository) {}

  public async findPublic() {
    return this.competitions.findAll();
  }
}
