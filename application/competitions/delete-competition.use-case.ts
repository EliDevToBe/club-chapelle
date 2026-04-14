import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";
import type { CompetitionId } from "~~/domain/competitions/competition";

export class DeleteCompetition {
  constructor(private readonly competitions: CompetitionRepository) {}

  public delete = async (id: CompetitionId) => this.competitions.delete(id);
}
