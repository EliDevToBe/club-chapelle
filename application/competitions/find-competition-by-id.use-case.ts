import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";
import type { CompetitionId } from "~~/domain/competitions/competition";

export class FindCompetitionById {
  constructor(private readonly competitions: CompetitionRepository) {}

  public findById = async (id: CompetitionId) => this.competitions.findById(id);
}
